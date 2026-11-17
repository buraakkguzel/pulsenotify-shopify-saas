'use strict';

/**
 * Herhangi bir Shopify temasında (Dawn, Horizon, Prestige, Impulse, Organik Kal vb.)
 * sıfır kod değişikliğiyle çalışan Evrensel Vitrin Widget SDK'sı (/widget/notify-sdk.js)
 */
function renderUniversalWidgetSdk(defaultAppOrigin = '') {
  return `(function() {
  if (window.__PulseNotifyLoaded) return;
  window.__PulseNotifyLoaded = true;

  const currentScript = document.currentScript || document.querySelector('script[src*="notify-sdk.js"]');
  const scriptUrl = currentScript ? new URL(currentScript.src, window.location.origin) : null;
  const appOrigin = scriptUrl ? scriptUrl.origin : ${JSON.stringify(defaultAppOrigin)};
  const shopDomain =
    (scriptUrl && scriptUrl.searchParams.get('shop')) ||
    (window.Shopify && window.Shopify.shop) ||
    window.location.hostname;

  const subscribeEndpoint = appOrigin ? appOrigin + '/apps/ok-notify/subscribe' : '/apps/ok-notify/subscribe';
  const configEndpoint = appOrigin
    ? appOrigin + '/api/storefront/config?shop=' + encodeURIComponent(shopDomain)
    : '/api/storefront/config?shop=' + encodeURIComponent(shopDomain);

  let brandConfig = {
    shop: shopDomain,
    brand_name: document.title.split(/[|\\-–]/)[0].trim() || 'Mağaza',
    widget_theme: {
      primary_color: '#18181b',
      background_color: '#ffffff',
      surface_color: '#f4f4f5',
      accent_color: '#0f766e',
      text_color: '#0f172a',
      border_radius: '12px',
      notify_button_text: 'Gelince Haber Ver',
      subscribed_button_text: '✓ Bildirim Listesinde',
      preorder_button_text: 'Ön Sipariş Ver',
      modal_eyebrow: 'STOK BİLDİRİM SERVİSİ',
      modal_title: 'Stok gelince haber verelim',
      modal_subtitle: 'Bu ürün yeniden stoklara girdiğinde seçtiğiniz kanallardan size anında bilgi gönderelim.',
      submit_button_text: 'Stoğa Gelince Bana Haber Ver',
      success_message: 'Bildirim talebiniz alındı!'
    },
    preorders: []
  };

  function injectUniversalDialogIfNeeded() {
    if (document.querySelector('[data-ok-notify-dialog], [data-pulsenotify-dialog]')) return;
    const t = brandConfig.widget_theme || {};
    const style = document.createElement('style');
    style.id = 'pulsenotify-sdk-styles';
    style.textContent = \`
      .pn-trigger-btn {
        box-sizing: border-box;
        width: 100%;
        min-height: 48px;
        margin-top: 10px;
        padding: 12px 18px;
        border: 1.5px solid var(--pn-primary, #18181b);
        border-radius: var(--pn-radius, 12px);
        background: var(--pn-primary, #18181b);
        color: #ffffff;
        font: 600 15px/1.3 system-ui, -apple-system, sans-serif;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      dialog.pn-dialog {
        border: 1px solid rgba(0,0,0,0.12);
        border-radius: 20px;
        padding: 24px;
        width: min(440px, calc(100vw - 28px));
        background: var(--pn-bg, #ffffff);
        color: var(--pn-text, #0f172a);
        box-shadow: 0 24px 60px rgba(0,0,0,0.24);
        font-family: system-ui, -apple-system, sans-serif;
      }
      dialog.pn-dialog::backdrop {
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(2px);
      }
      .pn-field { display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
      .pn-field label { font-size:12.5px; font-weight:600; }
      .pn-field input { padding:10px 12px; border:1px solid #cbd5e1; border-radius:10px; font-size:14px; }
      .pn-channels { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
      .pn-channels label {
        display:flex; align-items:center; justify-content:center; gap:5px;
        padding:8px; border:1px solid #cbd5e1; border-radius:10px; font-size:12.5px; font-weight:600; cursor:pointer;
      }
    \`;
    document.head.appendChild(style);

    const dialog = document.createElement('dialog');
    dialog.className = 'pn-dialog';
    dialog.setAttribute('data-pulsenotify-dialog', 'true');
    dialog.style.setProperty('--pn-primary', t.primary_color || '#18181b');
    dialog.style.setProperty('--pn-bg', t.background_color || '#ffffff');
    dialog.style.setProperty('--pn-text', t.text_color || '#0f172a');
    dialog.style.setProperty('--pn-radius', t.border_radius || '12px');

    dialog.innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
        <div>
          <small style="font-size:11px;font-weight:700;letter-spacing:1px;opacity:0.75;" data-pn-eyebrow>\${t.modal_eyebrow || 'STOK BİLDİRİMİ'}</small>
          <h3 style="margin:4px 0 6px;font-size:21px;" data-pn-title>\${t.modal_title || 'Stok gelince haber verelim'}</h3>
        </div>
        <button type="button" data-pn-close style="border:none;background:transparent;font-size:22px;cursor:pointer;">×</button>
      </div>
      <p style="margin:0 0 14px;font-size:13px;opacity:0.8;" data-pn-subtitle>\${t.modal_subtitle || ''}</p>
      <div style="padding:10px 12px;border-radius:12px;background:rgba(0,0,0,0.04);margin-bottom:14px;">
        <strong data-pn-product-name style="font-size:14px;"></strong>
      </div>
      <form data-pn-form>
        <div class="pn-channels">
          <label><input type="checkbox" name="ch_email" checked /> E-posta</label>
          <label><input type="checkbox" name="ch_whatsapp" /> WhatsApp</label>
          <label><input type="checkbox" name="ch_sms" /> SMS</label>
        </div>
        <div class="pn-field">
          <label>Adınız Soyadınız</label>
          <input type="text" name="customer_name" placeholder="Adınız Soyadınız" />
        </div>
        <div class="pn-field">
          <label>E-posta Adresiniz</label>
          <input type="email" name="customer_email" placeholder="ornek@eposta.com" />
        </div>
        <div class="pn-field">
          <label>Cep Telefonu (WhatsApp / SMS)</label>
          <input type="tel" name="customer_phone" placeholder="05xx xxx xx xx" />
        </div>
        <p data-pn-status hidden style="margin:0 0 10px;padding:9px 11px;border-radius:8px;font-size:12.5px;"></p>
        <button type="submit" class="pn-trigger-btn" style="margin-top:4px;" data-pn-submit>\${t.submit_button_text || 'Haber Ver'}</button>
      </form>
    \`;
    document.body.appendChild(dialog);

    dialog.querySelector('[data-pn-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.querySelector('[data-pn-form]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const channels = [];
      if (fd.get('ch_email')) channels.push('email');
      if (fd.get('ch_whatsapp')) channels.push('whatsapp');
      if (fd.get('ch_sms')) channels.push('sms');
      const statusEl = dialog.querySelector('[data-pn-status]');
      const payload = {
        shop: shopDomain,
        product_id: dialog.dataset.productId || 'unknown',
        product_title: dialog.dataset.productTitle || document.title,
        product_handle: window.location.pathname.split('/products/')[1]?.split('?')[0] || '',
        variant_id: dialog.dataset.variantId || 'default',
        variant_title: dialog.dataset.variantTitle || 'Standart',
        customer_name: fd.get('customer_name'),
        customer_email: fd.get('customer_email'),
        customer_phone: fd.get('customer_phone'),
        channels
      };
      const res = await fetch(subscribeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      statusEl.hidden = false;
      if (res.ok && data.ok) {
        statusEl.style.background = '#dcfce7';
        statusEl.style.color = '#166534';
        statusEl.textContent = data.message || brandConfig.widget_theme.success_message;
        setTimeout(() => dialog.close(), 1800);
      } else {
        statusEl.style.background = '#fee2e2';
        statusEl.style.color = '#991b1b';
        statusEl.textContent = data.error || 'Bir hata oluştu.';
      }
    });
  }

  window.PulseNotify = {
    openModal(productInfo = {}) {
      injectUniversalDialogIfNeeded();
      const dialog = document.querySelector('[data-pulsenotify-dialog]');
      if (!dialog) return;
      dialog.dataset.productId = String(productInfo.product_id || '');
      dialog.dataset.productTitle = String(productInfo.product_title || document.title);
      dialog.dataset.variantId = String(productInfo.variant_id || '');
      dialog.dataset.variantTitle = String(productInfo.variant_title || '');
      const nameEl = dialog.querySelector('[data-pn-product-name]');
      if (nameEl) nameEl.textContent = productInfo.product_title || document.title;
      dialog.showModal();
    }
  };

  fetch(configEndpoint, { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && data.config) {
        brandConfig = data.config;
      }
      injectUniversalDialogIfNeeded();
    })
    .catch(() => {});
})();`;
}

module.exports = { renderUniversalWidgetSdk };
