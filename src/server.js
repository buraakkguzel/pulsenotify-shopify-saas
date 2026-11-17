'use strict';

const http = require('node:http');
const { createHash, timingSafeEqual } = require('node:crypto');
const { URL } = require('node:url');
const { createDatabase, normalizeShopDomain } = require('./db');
const {
  dispatchSubscriptionNotifications,
  renderTemplate,
  buildRestockEmailHtml
} = require('./notifier');
const { buildWhatsAppDirectUrl, formatPhoneDisplay } = require('./phone');
const {
  verifyShopifyWebhookHmac,
  handleInventoryLevelUpdate,
  handleProductUpdate,
  handleOrderCreate
} = require('./shopify');
const { renderAdminHtml } = require('./admin-ui');
const { renderUniversalWidgetSdk } = require('./widget-sdk');

function readRawBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Shopify-Hmac-Sha256, X-Shopify-Shop-Domain'
  });
  res.end(body);
}

function createAppServer(options = {}) {
  const store = options.store || createDatabase(options.dbPath);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const webhookSecret = options.webhookSecret ?? (process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET || '');
  const adminPassword = options.adminPassword ?? process.env.PULSENOTIFY_ADMIN_PASSWORD ?? '';
  const adminDigest = createHash('sha256').update(`admin:${adminPassword}`).digest();

  const requestHandler = async (req, res) => {
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Shopify-Hmac-Sha256, X-Shopify-Shop-Domain'
        });
        res.end();
        return;
      }

      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;
      const queryShop = url.searchParams.get('shop') || req.headers['x-shopify-shop-domain'] || '';

      if (pathname === '/' || /^\/(?:admin|api\/admin)(?:\/|$)/.test(pathname)) {
        if (!adminPassword && (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true')) {
          sendJson(res, 503, { ok: false, error: 'Yönetim paneli henüz yapılandırılmadı.' });
          return;
        }
        if (adminPassword) {
          const match = (req.headers.authorization || '').match(/^Basic ([A-Za-z0-9+/=]+)$/i);
          const supplied = createHash('sha256').update(Buffer.from(match?.[1] || '', 'base64')).digest();
          if (!timingSafeEqual(supplied, adminDigest)) {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="PulseNotify"', 'Cache-Control': 'no-store' });
            res.end();
            return;
          }
          if (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site'])) {
            res.writeHead(403);
            res.end();
            return;
          }
          res.setHeader?.('Cache-Control', 'no-store');
        }
      }

      // Health check
      if (req.method === 'GET' && pathname === '/health') {
        sendJson(res, 200, { ok: true, service: 'pulsenotify-saas' });
        return;
      }

      // Universal Storefront Widget SDK
      if (req.method === 'GET' && pathname === '/widget/notify-sdk.js') {
        const js = renderUniversalWidgetSdk(`http://${req.headers.host || 'localhost'}`);
        res.writeHead(200, {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        });
        res.end(js);
        return;
      }

      // Public Storefront Config for a Tenant (brand colors, widget texts, active preorders)
      if (req.method === 'GET' && pathname === '/api/storefront/config') {
        const tenant = store.getTenant(queryShop || 'organikkal.myshopify.com');
        const preorders = store.listPreorderConfigs(true, tenant.shop);
        sendJson(res, 200, {
          ok: true,
          config: {
            shop: tenant.shop,
            brand_name: tenant.brand_name,
            storefront_url: tenant.storefront_url,
            widget_theme: tenant.widget_theme,
            preorders
          }
        });
        return;
      }

      // Admin UI
      if (req.method === 'GET' && (pathname === '/' || pathname === '/admin')) {
        const html = renderAdminHtml();
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      // Storefront / App Proxy: Subscribe to Back-in-Stock
      if (
        req.method === 'POST' &&
        (pathname === '/apps/ok-notify/subscribe' ||
          pathname === '/apps/pulsenotify/subscribe' ||
          pathname === '/api/subscribe')
      ) {
        const raw = await readRawBody(req);
        const body = JSON.parse(raw.toString('utf8') || '{}');
        if (!body.shop && queryShop) body.shop = queryShop;
        const sub = store.addSubscription(body);
        const tenant = store.getTenant(sub.shop);
        sendJson(res, 200, {
          ok: true,
          deduplicated: sub.deduplicated,
          subscription: sub,
          message: sub.deduplicated
            ? 'Bu ürün çeşidi için bildirim talebiniz güncellendi. Stoklarımıza girdiğinde size hemen haber vereceğiz.'
            : tenant.widget_theme?.success_message ||
              'Bildirim talebiniz alındı! Seçtiğiniz ürün yeniden satışa açıldığında size hemen haber vereceğiz.'
        });
        return;
      }

      // Storefront / App Proxy: Preorder status for a product or variant
      if (
        req.method === 'GET' &&
        (pathname === '/apps/ok-notify/preorder-status' ||
          pathname === '/apps/pulsenotify/preorder-status' ||
          pathname === '/api/preorder-status')
      ) {
        const variantId = url.searchParams.get('variant_id') || '';
        const productId = url.searchParams.get('product_id') || '';
        const shop = queryShop || null;
        if (variantId) {
          const rule = store.getPreorderByVariant(variantId, shop);
          sendJson(res, 200, { ok: true, preorder: rule });
          return;
        }
        const allActive = store
          .listPreorderConfigs(true, shop)
          .filter((r) => !productId || r.product_id === String(productId));
        sendJson(res, 200, { ok: true, preorders: allActive });
        return;
      }

      // Shopify Webhooks (Multi-tenant via X-Shopify-Shop-Domain)
      if (req.method === 'POST' && pathname.startsWith('/webhooks/')) {
        const raw = await readRawBody(req);
        const hmac = req.headers['x-shopify-hmac-sha256'] || '';
        const webhookShop = req.headers['x-shopify-shop-domain'] || queryShop || null;
        if (!webhookSecret || !verifyShopifyWebhookHmac(raw, hmac, webhookSecret)) {
          sendJson(res, 401, { ok: false, error: 'Invalid webhook HMAC signature' });
          return;
        }
        const payload = JSON.parse(raw.toString('utf8') || '{}');

        if (pathname === '/webhooks/inventory_levels/update') {
          const result = await handleInventoryLevelUpdate(payload, store, fetchImpl, webhookShop);
          sendJson(res, 200, { ok: true, ...result });
          return;
        }
        if (pathname === '/webhooks/products/update') {
          const result = await handleProductUpdate(payload, store, fetchImpl, webhookShop);
          sendJson(res, 200, { ok: true, ...result });
          return;
        }
        if (pathname === '/webhooks/orders/create') {
          const result = handleOrderCreate(payload, store, webhookShop);
          sendJson(res, 200, { ok: true, ...result });
          return;
        }
      }

      // Admin API: Tenants (Brands)
      if (req.method === 'GET' && pathname === '/api/admin/tenants') {
        sendJson(res, 200, { ok: true, tenants: store.listTenants() });
        return;
      }
      if (req.method === 'POST' && pathname === '/api/admin/tenants') {
        const raw = await readRawBody(req);
        const body = JSON.parse(raw.toString('utf8') || '{}');
        const shop = normalizeShopDomain(body.shop);
        const tenant = store.ensureTenant(shop, body);
        const updated = store.updateSettings(body, shop);
        sendJson(res, 200, { ok: true, tenant: updated || tenant });
        return;
      }

      // Admin API: Dashboard stats
      if (req.method === 'GET' && pathname === '/api/admin/dashboard') {
        sendJson(res, 200, { ok: true, stats: store.getDashboardStats(queryShop || null) });
        return;
      }

      // Admin API: List subscriptions
      if (req.method === 'GET' && pathname === '/api/admin/subscriptions') {
        const list = store.listSubscriptions({
          shop: queryShop || 'all',
          status: url.searchParams.get('status') || 'all',
          channel: url.searchParams.get('channel') || '',
          search: url.searchParams.get('search') || '',
          variant_id: url.searchParams.get('variant_id') || ''
        });
        const enriched = list.map((sub) => {
          const subSettings = store.getSettings(sub.shop);
          const waText = renderTemplate(subSettings.whatsapp_message_template, sub, subSettings);
          return {
            ...sub,
            customer_phone_display: formatPhoneDisplay(sub.customer_phone),
            whatsapp_direct_url: sub.customer_phone
              ? buildWhatsAppDirectUrl(sub.customer_phone, waText)
              : ''
          };
        });
        sendJson(res, 200, { ok: true, subscriptions: enriched });
        return;
      }

      // Admin API: CSV Export
      if (req.method === 'GET' && pathname === '/api/admin/subscriptions/export.csv') {
        const list = store.listSubscriptions({ shop: queryShop || 'all', limit: 500 });
        const header = [
          'ID',
          'Magaza',
          'Musteri Adi',
          'E-posta',
          'Telefon',
          'Urun',
          'Varyant',
          'Variant ID',
          'Kanallar',
          'Durum',
          'Kayit Tarihi',
          'Bildirim Tarihi'
        ];
        const rows = list.map((s) =>
          [
            s.id,
            s.shop,
            s.customer_name,
            s.customer_email,
            s.customer_phone,
            s.product_title,
            s.variant_title,
            s.variant_id,
            (s.channels || []).join('+'),
            s.status,
            s.created_at,
            s.notified_at || ''
          ]
            .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
            .join(',')
        );
        const csv = '\uFEFF' + [header.join(','), ...rows].join('\r\n');
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="pulsenotify-aboneler.csv"'
        });
        res.end(csv);
        return;
      }

      // Admin API: Import CSV from old Notify! app
      if (req.method === 'POST' && pathname === '/api/admin/subscriptions/import-csv') {
        const raw = await readRawBody(req);
        const body = JSON.parse(raw.toString('utf8') || '{}');
        const targetShop = normalizeShopDomain(body.shop || queryShop || 'organikkal.myshopify.com');
        const csvText = String(body.csv || '').trim();
        if (!csvText) {
          sendJson(res, 400, { ok: false, error: 'CSV içeriği boş.' });
          return;
        }
        const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          sendJson(res, 400, { ok: false, error: 'CSV başlık ve en az 1 veri satırı içermelidir.' });
          return;
        }
        const parseCsvLine = (line) => {
          const out = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if ((ch === ',' || ch === ';') && !inQuotes) {
              out.push(cur.trim());
              cur = '';
            } else {
              cur += ch;
            }
          }
          out.push(cur.trim());
          return out;
        };

        const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9_ğüşıöç]/g, ''));
        const findCol = (candidates) => headers.findIndex((h) => candidates.some((c) => h.includes(c)));

        const idxEmail = findCol(['email', 'eposta', 'mail', 'customeremail']);
        const idxPhone = findCol(['phone', 'telefon', 'tel', 'gsm', 'whatsapp']);
        const idxName = findCol(['name', 'isim', 'musteri', 'customername', 'ad']);
        const idxProductTitle = findCol(['producttitle', 'productname', 'urun', 'product']);
        const idxVariantTitle = findCol(['varianttitle', 'variantname', 'varyant', 'secenek']);
        const idxVariantId = findCol(['variantid', 'varyantid']);
        const idxProductId = findCol(['productid', 'urunid']);
        const idxHandle = findCol(['handle', 'slug']);

        let importedCount = 0;
        for (let r = 1; r < lines.length; r++) {
          const cols = parseCsvLine(lines[r]);
          const email = idxEmail >= 0 ? cols[idxEmail] : '';
          const phone = idxPhone >= 0 ? cols[idxPhone] : '';
          if (!email && !phone) continue;

          const variantId = (idxVariantId >= 0 && cols[idxVariantId]) || `import_var_${r}`;
          const productId = (idxProductId >= 0 && cols[idxProductId]) || `import_prod_${r}`;
          const productTitle = (idxProductTitle >= 0 && cols[idxProductTitle]) || 'Ürün';
          const variantTitle = (idxVariantTitle >= 0 && cols[idxVariantTitle]) || 'Standart';
          const customerName = (idxName >= 0 && cols[idxName]) || '';
          const productHandle = (idxHandle >= 0 && cols[idxHandle]) || '';

          const channels = [];
          if (email) channels.push('email');
          if (phone) channels.push('whatsapp');

          try {
            store.addSubscription({
              shop: targetShop,
              product_id: productId,
              product_title: productTitle,
              product_handle: productHandle,
              variant_id: variantId,
              variant_title: variantTitle,
              customer_name: customerName,
              customer_email: email,
              customer_phone: phone,
              channels
            });
            importedCount++;
          } catch {}
        }

        sendJson(res, 200, { ok: true, imported_count: importedCount });
        return;
      }

      // Admin API: Notify single subscriber
      const notifySingleMatch = pathname.match(/^\/api\/admin\/subscriptions\/(\d+)\/notify$/);
      if (req.method === 'POST' && notifySingleMatch) {
        const subId = Number(notifySingleMatch[1]);
        const sub = store.getSubscriptionById(subId);
        if (!sub) {
          sendJson(res, 404, { ok: false, error: 'Abone bulunamadı.' });
          return;
        }
        const dispatchResult = await dispatchSubscriptionNotifications(sub, store, fetchImpl);
        sendJson(res, 200, { ok: true, ...dispatchResult });
        return;
      }

      // Admin API: Preview HTML email for a subscriber
      const emailPreviewMatch = pathname.match(/^\/api\/admin\/email-preview\/(\d+)$/);
      if (req.method === 'GET' && emailPreviewMatch) {
        const sub = store.getSubscriptionById(Number(emailPreviewMatch[1]));
        if (!sub) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const html = buildRestockEmailHtml(sub, store.getSettings(sub.shop));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      // Admin API: Delete subscriber
      const deleteSubMatch = pathname.match(/^\/api\/admin\/subscriptions\/(\d+)$/);
      if (req.method === 'DELETE' && deleteSubMatch) {
        const deleted = store.deleteSubscription(Number(deleteSubMatch[1]));
        sendJson(res, 200, { ok: deleted });
        return;
      }

      // Admin API: Bulk notify all pending subscribers for a variant
      if (req.method === 'POST' && pathname === '/api/admin/notify-variant') {
        const raw = await readRawBody(req);
        const body = JSON.parse(raw.toString('utf8') || '{}');
        const pending = store.findPendingForRestock({
          shop: body.shop && body.shop !== 'all' ? body.shop : null,
          variantId: body.variant_id,
          inventoryItemId: body.inventory_item_id
        });
        const results = [];
        for (const sub of pending) {
          results.push(await dispatchSubscriptionNotifications(sub, store, fetchImpl));
        }
        sendJson(res, 200, {
          ok: true,
          notified_count: results.length,
          results
        });
        return;
      }

      // Admin API: Preorders
      if (req.method === 'GET' && pathname === '/api/admin/preorders') {
        sendJson(res, 200, {
          ok: true,
          preorders: store.listPreorderConfigs(false, queryShop || null)
        });
        return;
      }
      if (req.method === 'POST' && pathname === '/api/admin/preorders') {
        const raw = await readRawBody(req);
        const body = JSON.parse(raw.toString('utf8') || '{}');
        if (!body.shop && queryShop) body.shop = queryShop;
        const rule = store.upsertPreorderConfig(body);
        sendJson(res, 200, { ok: true, preorder: rule });
        return;
      }
      const deletePreorderMatch = pathname.match(/^\/api\/admin\/preorders\/([^/]+)$/);
      if (req.method === 'DELETE' && deletePreorderMatch) {
        const deleted = store.deletePreorderConfig(
          decodeURIComponent(deletePreorderMatch[1]),
          queryShop && queryShop !== 'all' ? queryShop : null
        );
        sendJson(res, 200, { ok: deleted });
        return;
      }

      // Admin API: Settings
      if (req.method === 'GET' && pathname === '/api/admin/settings') {
        sendJson(res, 200, { ok: true, settings: store.getSettings(queryShop || undefined) });
        return;
      }
      if (req.method === 'POST' && pathname === '/api/admin/settings') {
        const raw = await readRawBody(req);
        const patch = JSON.parse(raw.toString('utf8') || '{}');
        const updated = store.updateSettings(patch, patch.shop || queryShop || undefined);
        sendJson(res, 200, { ok: true, settings: updated });
        return;
      }

      // Admin API: Notification Logs
      if (req.method === 'GET' && pathname === '/api/admin/logs') {
        sendJson(res, 200, { ok: true, logs: store.listNotificationLogs(100, queryShop || null) });
        return;
      }

      sendJson(res, 404, { ok: false, error: 'Endpoint bulunamadı.' });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message || 'İstek işlenirken hata oluştu.' });
    }
  };

  const server = http.createServer(requestHandler);

  return { server, store, requestHandler };
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3456);
  const { server } = createAppServer();
  server.listen(port, () => {
    console.log(`⚡ PulseNotify Multi-Brand Shopify SaaS çalışıyor: http://localhost:${port}`);
  });
}

module.exports = { createAppServer };
