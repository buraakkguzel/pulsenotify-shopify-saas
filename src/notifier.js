'use strict';

const { toDigitsOnlyPhone, buildWhatsAppDirectUrl, normalizePhone } = require('./phone');

function formatMoneyTry(cents, currency = 'TRY') {
  const amount = Number(cents || 0) / 100;
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY'
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || 'TL'}`;
  }
}

function buildProductUrl(subscription, settings) {
  const baseUrl = String(settings.storefront_url || `https://${subscription.shop}`).replace(/\/+$/, '');
  const handle = subscription.product_handle || '';
  const variantParam = subscription.variant_id ? `variant=${encodeURIComponent(subscription.variant_id)}&` : '';
  if (handle) {
    return `${baseUrl}/products/${encodeURIComponent(handle)}?${variantParam}utm_source=pulsenotify&utm_medium=restock`;
  }
  return `${baseUrl}?utm_source=pulsenotify`;
}

function renderTemplate(template, subscription, settings) {
  const productUrl = buildProductUrl(subscription, settings);
  const customerName = subscription.customer_name || 'Değerli Müşterimiz';
  const brandName = settings.brand_name || 'Mağazamız';
  const variantTitle =
    subscription.variant_title && subscription.variant_title !== 'Default Title'
      ? subscription.variant_title
      : 'Standart';
  const priceText =
    subscription.price_cents > 0 ? formatMoneyTry(subscription.price_cents, subscription.currency) : '';

  return String(template || '')
    .replace(/\{\{\s*customer_name\s*\}\}/g, customerName)
    .replace(/\{\{\s*product_title\s*\}\}/g, subscription.product_title || 'Ürün')
    .replace(/\{\{\s*variant_title\s*\}\}/g, variantTitle)
    .replace(/\{\{\s*product_url\s*\}\}/g, productUrl)
    .replace(/\{\{\s*price\s*\}\}/g, priceText)
    .replace(/\{\{\s*brand_name\s*\}\}/g, brandName);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildRestockEmailHtml(subscription, settings) {
  const productUrl = buildProductUrl(subscription, settings);
  const brandName = escapeHtml(settings.brand_name || 'Mağaza');
  const customerName = escapeHtml(subscription.customer_name || 'Değerli Müşterimiz');
  const productTitle = escapeHtml(subscription.product_title || 'Ürün');
  const variantTitle =
    subscription.variant_title && subscription.variant_title !== 'Default Title'
      ? escapeHtml(subscription.variant_title)
      : '';
  const priceFormatted =
    subscription.price_cents > 0
      ? escapeHtml(formatMoneyTry(subscription.price_cents, subscription.currency))
      : '';

  const theme = settings.widget_theme || {};
  const primaryColor = escapeHtml(theme.primary_color || '#18181b');
  const bgColor = escapeHtml(theme.background_color || '#ffffff');
  const surfaceColor = escapeHtml(theme.surface_color || '#f4f4f5');
  const accentColor = escapeHtml(theme.accent_color || primaryColor);
  const textColor = escapeHtml(theme.text_color || '#18181b');

  const imageHtml = subscription.product_image
    ? `<div style="margin: 0 auto 20px; width: 180px; height: 180px; border-radius: 18px; overflow: hidden; border: 1px solid #e4e4e7; background: #ffffff;">
         <img src="${escapeHtml(subscription.product_image)}" alt="${productTitle}" width="180" height="180" style="display: block; width: 180px; height: 180px; object-fit: cover;" />
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${productTitle} Yeniden Stokta | ${brandName}</title>
</head>
<body style="margin:0; padding:0; background-color:${surfaceColor}; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color:${textColor};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${surfaceColor}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color:${bgColor}; border: 1px solid #e4e4e7; border-radius: 22px; overflow: hidden; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);">
          <tr>
            <td style="background-color:${primaryColor}; padding: 26px 32px; text-align:center;">
              <span style="display:inline-block; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.8); font-weight:600;">${brandName} · STOK BİLDİRİMİ</span>
              <h1 style="margin: 10px 0 0; font-size: 24px; line-height: 1.25; color:#ffffff; font-weight:600;">
                Beklediğiniz ürün yeniden stokta!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: ${textColor};">
                Merhaba <strong>${customerName}</strong>,<br/>
                <strong>${brandName}</strong> mağazasında stok bildirim listesine eklediğiniz ürün yeniden satışa açıldı.
              </p>
              ${imageHtml}
              <h2 style="margin: 0 0 8px; font-size: 21px; color: ${primaryColor};">
                ${productTitle}
              </h2>
              ${
                variantTitle
                  ? `<p style="margin: 0 0 10px;"><span style="display:inline-block; padding: 4px 12px; border-radius: 999px; background:${surfaceColor}; color:${primaryColor}; font-size: 13px; font-weight: 600;">Seçenek: ${variantTitle}</span></p>`
                  : ''
              }
              ${
                priceFormatted
                  ? `<p style="margin: 8px 0 22px; font-size: 20px; font-weight: 700; color: ${accentColor};">${priceFormatted}</p>`
                  : '<div style="height: 16px;"></div>'
              }
              <a href="${escapeHtml(productUrl)}" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 12px;">
                Ürünü İncele ve Sepete Ekle →
              </a>
              <p style="margin: 22px 0 0; font-size: 12px; line-height: 1.5; color: #71717a;">
                Stoklar sınırlı sayıda olduğu için ürün hızlı tükenebilir.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 28px; background-color: ${surfaceColor}; border-top: 1px solid #e4e4e7; text-align: center; font-size: 12px; color: #71717a;">
              Bu e-posta, <strong>${brandName}</strong> mağazasında stok bildirim talebi oluşturduğunuz için gönderilmiştir.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEmailNotification(subscription, settings, fetchImpl = globalThis.fetch) {
  const recipient = subscription.customer_email;
  if (!recipient) {
    return { status: 'skipped', provider: 'none', error: 'E-posta adresi yok' };
  }

  const subject = renderTemplate(settings.email_subject_template, subscription, settings);
  const html = buildRestockEmailHtml(subscription, settings);
  const provider = settings.email_provider || 'resend';
  const senderName = settings.from_name || settings.brand_name || 'Mağaza Bildirim';
  const senderEmail = settings.from_email || 'bildirim@example.com';

  if (provider === 'resend' && settings.resend_api_key) {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.resend_api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [recipient],
        subject,
        html
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Resend hata kodu: ${response.status}`);
    }
    return {
      status: 'sent',
      provider: 'resend',
      provider_message_id: data.id || `resend_${Date.now()}`,
      preview: subject
    };
  }

  if (provider === 'brevo' && settings.brevo_api_key) {
    const response = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': settings.brevo_api_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipient, name: subscription.customer_name || '' }],
        subject,
        htmlContent: html
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Brevo hata kodu: ${response.status}`);
    }
    return {
      status: 'sent',
      provider: 'brevo',
      provider_message_id: data.messageId || `brevo_${Date.now()}`,
      preview: subject
    };
  }

  if (provider === 'webhook' && settings.email_webhook_url) {
    const response = await fetchImpl(settings.email_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: subscription.shop, to: recipient, subject, html, subscription })
    });
    if (!response.ok) {
      throw new Error(`Email webhook hata kodu: ${response.status}`);
    }
    return {
      status: 'sent',
      provider: 'webhook',
      provider_message_id: `webhook_${Date.now()}`,
      preview: subject
    };
  }

  return {
    status: 'simulated',
    provider: `${provider}_dry_run`,
    provider_message_id: `sim_email_${Date.now()}`,
    preview: subject
  };
}

async function sendWhatsAppNotification(subscription, settings, fetchImpl = globalThis.fetch) {
  const recipient = normalizePhone(subscription.customer_phone);
  if (!recipient) {
    return { status: 'skipped', provider: 'none', error: 'Telefon numarası yok' };
  }

  const text = renderTemplate(settings.whatsapp_message_template, subscription, settings);
  const directUrl = buildWhatsAppDirectUrl(recipient, text);
  const provider = settings.whatsapp_provider || 'meta_cloud';

  if (provider === 'meta_cloud' && settings.whatsapp_phone_number_id && settings.whatsapp_access_token) {
    const digitsPhone = toDigitsOnlyPhone(recipient);
    const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
      settings.whatsapp_phone_number_id
    )}/messages`;

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.whatsapp_access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: digitsPhone,
        type: 'text',
        text: { preview_url: true, body: text }
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || `WhatsApp Cloud API hata: ${response.status}`);
    }
    return {
      status: 'sent',
      provider: 'meta_cloud',
      provider_message_id: data?.messages?.[0]?.id || `waba_${Date.now()}`,
      preview: text,
      whatsapp_direct_url: directUrl
    };
  }

  if (provider === 'twilio' && settings.twilio_account_sid && settings.twilio_auth_token && settings.twilio_whatsapp_from) {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
      settings.twilio_account_sid
    )}/Messages.json`;
    const auth = Buffer.from(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`).toString('base64');
    const form = new URLSearchParams({
      From: settings.twilio_whatsapp_from.startsWith('whatsapp:')
        ? settings.twilio_whatsapp_from
        : `whatsapp:${settings.twilio_whatsapp_from}`,
      To: `whatsapp:${recipient}`,
      Body: text
    });

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Twilio WhatsApp hata: ${response.status}`);
    }
    return {
      status: 'sent',
      provider: 'twilio_whatsapp',
      provider_message_id: data.sid || `twilio_wa_${Date.now()}`,
      preview: text,
      whatsapp_direct_url: directUrl
    };
  }

  if (provider === 'webhook' && settings.whatsapp_webhook_url) {
    const response = await fetchImpl(settings.whatsapp_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: subscription.shop, to: recipient, text, whatsapp_direct_url: directUrl, subscription })
    });
    if (!response.ok) {
      throw new Error(`WhatsApp webhook hata: ${response.status}`);
    }
    return {
      status: 'sent',
      provider: 'webhook',
      provider_message_id: `wa_webhook_${Date.now()}`,
      preview: text,
      whatsapp_direct_url: directUrl
    };
  }

  return {
    status: 'simulated',
    provider: `${provider}_dry_run`,
    provider_message_id: `sim_wa_${Date.now()}`,
    preview: text,
    whatsapp_direct_url: directUrl
  };
}

async function sendSmsNotification(subscription, settings, fetchImpl = globalThis.fetch) {
  const recipient = normalizePhone(subscription.customer_phone);
  if (!recipient) {
    return { status: 'skipped', provider: 'none', error: 'Telefon numarası yok' };
  }

  const text = renderTemplate(settings.sms_message_template, subscription, settings);
  const provider = settings.sms_provider || 'netgsm';

  if (provider === 'netgsm' && settings.netgsm_usercode && settings.netgsm_password) {
    const gsmNo = toDigitsOnlyPhone(recipient);
    const params = new URLSearchParams({
      usercode: settings.netgsm_usercode,
      password: settings.netgsm_password,
      gsmno: gsmNo,
      message: text,
      msgheader: settings.netgsm_msgheader || 'MAGAZA',
      dil: 'TR'
    });
    const response = await fetchImpl(`https://api.netgsm.com.tr/sms/send/get?${params.toString()}`);
    const bodyText = (await response.text()).trim();
    if (!response.ok || /^(20|30|40|50|70)/.test(bodyText)) {
      throw new Error(`NetGSM hata kodu: ${bodyText}`);
    }
    return {
      status: 'sent',
      provider: 'netgsm',
      provider_message_id: bodyText || `netgsm_${Date.now()}`,
      preview: text
    };
  }

  if (provider === 'twilio' && settings.twilio_account_sid && settings.twilio_auth_token && settings.twilio_from_number) {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
      settings.twilio_account_sid
    )}/Messages.json`;
    const auth = Buffer.from(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`).toString('base64');
    const form = new URLSearchParams({
      From: settings.twilio_from_number,
      To: recipient,
      Body: text
    });

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Twilio SMS hata: ${response.status}`);
    }
    return {
      status: 'sent',
      provider: 'twilio_sms',
      provider_message_id: data.sid || `twilio_sms_${Date.now()}`,
      preview: text
    };
  }

  if (provider === 'webhook' && settings.sms_webhook_url) {
    const response = await fetchImpl(settings.sms_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: subscription.shop, to: recipient, text, subscription })
    });
    if (!response.ok) {
      throw new Error(`SMS webhook hata: ${response.status}`);
    }
    return {
      status: 'sent',
      provider: 'webhook',
      provider_message_id: `sms_webhook_${Date.now()}`,
      preview: text
    };
  }

  return {
    status: 'simulated',
    provider: `${provider}_dry_run`,
    provider_message_id: `sim_sms_${Date.now()}`,
    preview: text
  };
}

async function dispatchSubscriptionNotifications(subscription, store, fetchImpl = globalThis.fetch) {
  const settings = store.getSettings(subscription.shop);
  const channels = Array.isArray(subscription.channels) ? subscription.channels : ['email'];
  const results = [];
  const errors = [];

  for (const channel of channels) {
    try {
      if (channel === 'email' && settings.email_enabled) {
        const res = await sendEmailNotification(subscription, settings, fetchImpl);
        store.addNotificationLog({
          shop: subscription.shop,
          subscription_id: subscription.id,
          channel: 'email',
          recipient: subscription.customer_email,
          status: res.status,
          provider: res.provider,
          provider_message_id: res.provider_message_id,
          payload_preview: res.preview
        });
        results.push({ channel: 'email', ...res });
      } else if (channel === 'whatsapp' && settings.whatsapp_enabled) {
        const res = await sendWhatsAppNotification(subscription, settings, fetchImpl);
        store.addNotificationLog({
          shop: subscription.shop,
          subscription_id: subscription.id,
          channel: 'whatsapp',
          recipient: subscription.customer_phone,
          status: res.status,
          provider: res.provider,
          provider_message_id: res.provider_message_id,
          payload_preview: res.preview
        });
        results.push({ channel: 'whatsapp', ...res });
      } else if (channel === 'sms' && settings.sms_enabled) {
        const res = await sendSmsNotification(subscription, settings, fetchImpl);
        store.addNotificationLog({
          shop: subscription.shop,
          subscription_id: subscription.id,
          channel: 'sms',
          recipient: subscription.customer_phone,
          status: res.status,
          provider: res.provider,
          provider_message_id: res.provider_message_id,
          payload_preview: res.preview
        });
        results.push({ channel: 'sms', ...res });
      }
    } catch (err) {
      const errorMsg = err.message || String(err);
      errors.push(`${channel}: ${errorMsg}`);
      store.addNotificationLog({
        shop: subscription.shop,
        subscription_id: subscription.id,
        channel,
        recipient: channel === 'email' ? subscription.customer_email : subscription.customer_phone,
        status: 'failed',
        error_message: errorMsg
      });
      results.push({ channel, status: 'failed', error: errorMsg });
    }
  }

  const updated = store.markSubscriptionNotified(
    subscription.id,
    errors.length > 0 ? errors.join(' | ') : null
  );

  const waText = renderTemplate(settings.whatsapp_message_template, subscription, settings);
  const whatsappDirectUrl = subscription.customer_phone
    ? buildWhatsAppDirectUrl(subscription.customer_phone, waText)
    : '';

  return {
    subscription: updated,
    results,
    whatsapp_direct_url: whatsappDirectUrl,
    errors
  };
}

module.exports = {
  formatMoneyTry,
  buildProductUrl,
  renderTemplate,
  buildRestockEmailHtml,
  sendEmailNotification,
  sendWhatsAppNotification,
  sendSmsNotification,
  dispatchSubscriptionNotifications
};
