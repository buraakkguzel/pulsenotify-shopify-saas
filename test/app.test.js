'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { normalizePhone, buildWhatsAppDirectUrl, formatPhoneDisplay } = require('../src/phone');
const { createDatabase } = require('../src/db');
const { createAppServer } = require('../src/server');

function invokeHandler(requestHandler, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const rawBuffer = body
      ? Buffer.isBuffer(body)
        ? body
        : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body), 'utf8')
      : Buffer.alloc(0);

    const req = Readable.from(rawBuffer.length ? [rawBuffer] : []);
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost', ...headers };

    let statusCode = 200;
    let resHeaders = {};
    const resChunks = [];

    const res = {
      writeHead(code, h = {}) {
        statusCode = code;
        resHeaders = { ...resHeaders, ...h };
      },
      end(chunk) {
        if (chunk) resChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), 'utf8'));
        const text = Buffer.concat(resChunks).toString('utf8');
        resolve({
          status: statusCode,
          headers: resHeaders,
          text: async () => text,
          json: async () => JSON.parse(text)
        });
      }
    };

    Promise.resolve(requestHandler(req, res)).catch(reject);
  });
}

test('Yönetim erişimi doğrulanır ve anahtarsız webhook reddedilir', async () => {
  const { requestHandler, store } = createAppServer({
    dbPath: ':memory:',
    adminPassword: 'test-only-password',
    webhookSecret: ''
  });
  try {
    const authorization = 'Basic ' + Buffer.from('admin:test-only-password').toString('base64');
    for (const url of ['/', '/admin', '/api/admin/subscriptions', '/api/admin/settings']) {
      const denied = await invokeHandler(requestHandler, { url });
      assert.equal(denied.status, 401);
      assert.match(denied.headers['WWW-Authenticate'], /^Basic /);
    }
    const session = await invokeHandler(requestHandler, {
      url: '/api/admin/dashboard',
      headers: { authorization, 'sec-fetch-site': 'same-origin' }
    });
    assert.equal(session.status, 200);
    const crossSite = await invokeHandler(requestHandler, {
      method: 'POST',
      url: '/api/admin/settings',
      headers: { authorization, 'sec-fetch-site': 'cross-site' }
    });
    assert.equal(crossSite.status, 403);
    const webhook = await invokeHandler(requestHandler, {
      method: 'POST',
      url: '/webhooks/inventory_levels/update',
      body: { available: 1 }
    });
    assert.equal(webhook.status, 401);
    assert.equal((await invokeHandler(requestHandler, { url: '/health' })).status, 200);
  } finally {
    store.db.close();
  }
});

test('Türk ve uluslararası telefon numarası normalizasyonu ve WhatsApp linki', () => {
  assert.equal(normalizePhone('0532 123 45 67'), '+905321234567');
  assert.equal(normalizePhone('5321234567'), '+905321234567');
  assert.equal(normalizePhone('+90 (532) 123-45-67'), '+905321234567');
  assert.equal(normalizePhone('905321234567'), '+905321234567');
  assert.equal(formatPhoneDisplay('05321234567'), '+90 532 123 45 67');

  const waUrl = buildWhatsAppDirectUrl('0532 123 45 67', 'Merhaba');
  assert.equal(waUrl, 'https://wa.me/905321234567?text=Merhaba');
});

test('Çoklu marka (Multi-Tenant) izolasyonu: Organik Kal ve diğer markaların ayrımı', async () => {
  const { requestHandler } = createAppServer({ dbPath: ':memory:' });

  // Yeni bir marka ekle: Lumi Cosmetics
  const tenantRes = await invokeHandler(requestHandler, {
    method: 'POST',
    url: '/api/admin/tenants',
    headers: { 'content-type': 'application/json' },
    body: {
      shop: 'lumi-cosmetics.myshopify.com',
      brand_name: 'Lumi Cosmetics',
      storefront_url: 'https://lumicosmetics.com',
      widget_theme: { primary_color: '#e11d48' }
    }
  });
  const tenantData = await tenantRes.json();
  assert.equal(tenantData.ok, true);
  assert.equal(tenantData.tenant.brand_name, 'Lumi Cosmetics');

  // Organik Kal için abone ekle
  await invokeHandler(requestHandler, {
    method: 'POST',
    url: '/apps/pulsenotify/subscribe',
    headers: { 'content-type': 'application/json' },
    body: {
      shop: 'organikkal.myshopify.com',
      product_id: '101',
      product_title: 'Organik Yumurta',
      variant_id: '201',
      customer_email: 'ayse@organikkal.com',
      channels: ['email']
    }
  });

  // Lumi Cosmetics için abone ekle
  await invokeHandler(requestHandler, {
    method: 'POST',
    url: '/apps/pulsenotify/subscribe',
    headers: { 'content-type': 'application/json' },
    body: {
      shop: 'lumi-cosmetics.myshopify.com',
      product_id: '909',
      product_title: 'Glow Serum',
      variant_id: '808',
      customer_email: 'selin@lumi.com',
      channels: ['email']
    }
  });

  // Her markanın kendi istatistiklerinin izole olduğunu doğrula
  const okStats = await (
    await invokeHandler(requestHandler, {
      method: 'GET',
      url: '/api/admin/dashboard?shop=organikkal.myshopify.com'
    })
  ).json();
  assert.equal(okStats.stats.pending_count, 1);
  assert.equal(okStats.stats.top_products[0].product_title, 'Organik Yumurta');

  const lumiStats = await (
    await invokeHandler(requestHandler, {
      method: 'GET',
      url: '/api/admin/dashboard?shop=lumi-cosmetics.myshopify.com'
    })
  ).json();
  assert.equal(lumiStats.stats.pending_count, 1);
  assert.equal(lumiStats.stats.top_products[0].product_title, 'Glow Serum');

  // Evrensel Widget SDK ve Storefront Config kontrolü
  const sdkRes = await invokeHandler(requestHandler, {
    method: 'GET',
    url: '/widget/notify-sdk.js?shop=lumi-cosmetics.myshopify.com'
  });
  assert.equal(sdkRes.status, 200);
  assert.ok((await sdkRes.text()).includes('window.PulseNotify'));
});

test('HTTP API, Shopify stok güncelleme webhooku ve sipariş dönüşüm (Ciro Kurtarma) akışı', async () => {
  const secret = 'test_shopify_secret_123';
  const sentCalls = [];

  const mockFetch = async (url, opts) => {
    sentCalls.push({ url, opts });
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'msg_123', messages: [{ id: 'waba_123' }] }),
      text: async () => '00 123456'
    };
  };

  const { store, requestHandler } = createAppServer({
    dbPath: ':memory:',
    fetchImpl: mockFetch,
    webhookSecret: secret
  });

  store.updateSettings(
    {
      email_provider: 'resend',
      resend_api_key: 're_test_key',
      whatsapp_provider: 'meta_cloud',
      whatsapp_phone_number_id: '10998877',
      whatsapp_access_token: 'meta_token_test',
      sms_provider: 'netgsm',
      netgsm_usercode: '8503000000',
      netgsm_password: 'secret_password'
    },
    'organikkal.myshopify.com'
  );

  // 1. Storefront üzerinden abone ol
  const subRes = await invokeHandler(requestHandler, {
    method: 'POST',
    url: '/apps/ok-notify/subscribe',
    headers: { 'content-type': 'application/json' },
    body: {
      shop: 'organikkal.myshopify.com',
      product_id: '8801',
      product_title: 'Ekodoli Organik Zeytinyağı',
      product_handle: 'organik-zeytinyagi',
      variant_id: '9901',
      variant_title: '1 Litre',
      inventory_item_id: '7701',
      price_cents: 85000,
      customer_name: 'Caner Aydın',
      customer_email: 'caner@example.com',
      customer_phone: '0532 555 44 33',
      channels: ['email', 'whatsapp', 'sms']
    }
  });
  const subData = await subRes.json();
  assert.equal(subData.ok, true);
  assert.equal(subData.subscription.status, 'pending');

  // 2. Shopify inventory_levels/update webhooku gönder (X-Shopify-Shop-Domain ile)
  const webhookBody = JSON.stringify({
    inventory_item_id: 7701,
    available: 15
  });
  const hmac = crypto.createHmac('sha256', secret).update(webhookBody).digest('base64');

  const whRes = await invokeHandler(requestHandler, {
    method: 'POST',
    url: '/webhooks/inventory_levels/update',
    headers: {
      'content-type': 'application/json',
      'x-shopify-hmac-sha256': hmac,
      'x-shopify-shop-domain': 'organikkal.myshopify.com'
    },
    body: webhookBody
  });
  const whData = await whRes.json();
  assert.equal(whData.ok, true);
  assert.equal(whData.notified_count, 1);
  assert.equal(sentCalls.length, 3);

  // 3. Sipariş oluştuğunda orders/create webhooku ile 'converted' ve kurtarılan ciro takibi
  const orderBody = JSON.stringify({
    id: 555001,
    email: 'caner@example.com',
    line_items: [{ variant_id: 9901, quantity: 2, price: '850.00' }]
  });
  const orderHmac = crypto.createHmac('sha256', secret).update(orderBody).digest('base64');

  const orderRes = await invokeHandler(requestHandler, {
    method: 'POST',
    url: '/webhooks/orders/create',
    headers: {
      'content-type': 'application/json',
      'x-shopify-hmac-sha256': orderHmac,
      'x-shopify-shop-domain': 'organikkal.myshopify.com'
    },
    body: orderBody
  });
  const orderData = await orderRes.json();
  assert.equal(orderData.ok, true);
  assert.equal(orderData.conversions_count, 1);
});
