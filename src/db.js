'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { normalizePhone } = require('./phone');

const DEFAULT_SHOP = process.env.SHOPIFY_SHOP_DOMAIN || 'organikkal.myshopify.com';

const DEFAULT_WIDGET_THEME = {
  primary_color: '#18181b',
  background_color: '#ffffff',
  surface_color: '#f8fafc',
  accent_color: '#0f766e',
  text_color: '#0f172a',
  border_radius: '12px',
  notify_button_text: 'Gelince Haber Ver',
  subscribed_button_text: '✓ Bildirim Listesinde',
  preorder_button_text: 'Ön Sipariş Ver',
  preorder_badge_text: 'Ön Sipariş',
  modal_eyebrow: 'STOK BİLDİRİM SERVİSİ',
  modal_title: 'Stok gelince haber verelim',
  modal_subtitle: 'Bu ürün yeniden stoklara girdiğinde seçtiğiniz kanallardan size anında bilgi gönderelim.',
  submit_button_text: 'Stoğa Gelince Bana Haber Ver',
  success_message: 'Bildirim talebiniz alındı! Ürün yeniden satışa açıldığında size hemen haber vereceğiz.',
  privacy_text: 'Paylaştığınız iletişim bilgileri yalnızca stok bildirimi göndermek amacıyla kullanılır.'
};

function createDefaultTenantSettings(shop, brandName = 'Mağaza', storefrontUrl = '') {
  return {
    shop,
    brand_name: brandName,
    storefront_url: storefrontUrl || `https://${shop}`,
    logo_url: '',
    locale: 'tr',
    plan: 'pro',
    email_enabled: 1,
    whatsapp_enabled: 1,
    sms_enabled: 1,
    auto_notify_on_restock: 1,
    min_stock_threshold: 1,
    email_provider: process.env.EMAIL_PROVIDER || 'resend',
    from_email: process.env.FROM_EMAIL || `bildirim@${shop.replace('.myshopify.com', '.com')}`,
    from_name: brandName,
    resend_api_key: process.env.RESEND_API_KEY || '',
    brevo_api_key: process.env.BREVO_API_KEY || '',
    email_webhook_url: process.env.EMAIL_WEBHOOK_URL || '',
    whatsapp_provider: process.env.WHATSAPP_PROVIDER || 'meta_cloud',
    whatsapp_phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    whatsapp_access_token: process.env.WHATSAPP_ACCESS_TOKEN || '',
    whatsapp_template_name: process.env.WHATSAPP_TEMPLATE_NAME || 'stok_bildirimi_tr',
    whatsapp_webhook_url: process.env.WHATSAPP_WEBHOOK_URL || '',
    sms_provider: process.env.SMS_PROVIDER || 'netgsm',
    netgsm_usercode: process.env.NETGSM_USERCODE || '',
    netgsm_password: process.env.NETGSM_PASSWORD || '',
    netgsm_msgheader: brandName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) || 'MAGAZA',
    twilio_account_sid: process.env.TWILIO_ACCOUNT_SID || '',
    twilio_auth_token: process.env.TWILIO_AUTH_TOKEN || '',
    twilio_from_number: process.env.TWILIO_FROM_NUMBER || '',
    twilio_whatsapp_from: process.env.TWILIO_WHATSAPP_FROM || '',
    sms_webhook_url: process.env.SMS_WEBHOOK_URL || '',
    email_subject_template: '🔔 Beklediğiniz {{product_title}} yeniden stokta! | {{brand_name}}',
    whatsapp_message_template:
      'Merhaba {{customer_name}} 👋\n\n*{{brand_name}}* mağazasında beklediğiniz *{{product_title}}* ({{variant_title}}) yeniden stoklarımıza girdi!\n\nStoklar tükenmeden hemen incelemek ve sipariş vermek için:\n{{product_url}}',
    sms_message_template:
      '{{brand_name}}: Merhaba {{customer_name}}, beklediginiz {{product_title}} ({{variant_title}}) yeniden stokta! Siparis icin: {{product_url}}',
    widget_theme: { ...DEFAULT_WIDGET_THEME }
  };
}

function normalizeShopDomain(shop) {
  const cleaned = String(shop || DEFAULT_SHOP)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  return cleaned || DEFAULT_SHOP;
}

function createDatabase(dbPath) {
  const resolvedPath =
    dbPath ||
    process.env.DATABASE_PATH ||
    path.join(__dirname, '..', 'data', 'pulsenotify-saas.sqlite');

  if (resolvedPath !== ':memory:') {
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  }

  const db = new DatabaseSync(resolvedPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      shop TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL,
      storefront_url TEXT NOT NULL,
      access_token TEXT DEFAULT '',
      plan TEXT NOT NULL DEFAULT 'pro',
      active INTEGER NOT NULL DEFAULT 1,
      config_json TEXT NOT NULL,
      installed_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      product_handle TEXT DEFAULT '',
      product_image TEXT DEFAULT '',
      variant_id TEXT NOT NULL,
      variant_title TEXT DEFAULT 'Varsayılan',
      variant_sku TEXT DEFAULT '',
      inventory_item_id TEXT DEFAULT '',
      price_cents INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'TRY',
      customer_name TEXT DEFAULT '',
      customer_email TEXT DEFAULT '',
      customer_phone TEXT DEFAULT '',
      channels TEXT NOT NULL DEFAULT '["email"]',
      kvkk_consent INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      notified_at TEXT DEFAULT NULL,
      converted_at TEXT DEFAULT NULL,
      converted_order_id TEXT DEFAULT NULL,
      converted_revenue_cents INTEGER DEFAULT 0,
      last_error TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_subscriptions_shop_variant_status
      ON subscriptions(shop, variant_id, status);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_shop_inventory
      ON subscriptions(shop, inventory_item_id, status);

    CREATE TABLE IF NOT EXISTS preorder_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      product_handle TEXT DEFAULT '',
      variant_title TEXT DEFAULT 'Varsayılan',
      enabled INTEGER NOT NULL DEFAULT 1,
      button_text TEXT NOT NULL DEFAULT 'Ön Sipariş Ver',
      badge_text TEXT NOT NULL DEFAULT 'Ön Sipariş',
      shipping_note TEXT NOT NULL DEFAULT 'Planlanan sevkiyat tarihinde öncelikli olarak kargoya teslim edilir.',
      estimated_shipping_date TEXT DEFAULT '',
      max_quantity INTEGER DEFAULT 0,
      reserved_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(shop, variant_id)
    );

    CREATE TABLE IF NOT EXISTS notification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop TEXT NOT NULL DEFAULT 'organikkal.myshopify.com',
      subscription_id INTEGER NOT NULL,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      status TEXT NOT NULL,
      provider TEXT DEFAULT '',
      provider_message_id TEXT DEFAULT '',
      error_message TEXT DEFAULT '',
      payload_preview TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
    );
  `);

  function ensureTenant(shopInput, defaults = {}) {
    const shop = normalizeShopDomain(shopInput);
    const existing = db.prepare('SELECT * FROM tenants WHERE shop = ?').get(shop);
    if (existing) {
      return parseTenantRow(existing);
    }

    const isOrganikKal = shop.includes('organikkal');
    const brandName =
      defaults.brand_name || (isOrganikKal ? 'Organik Kal' : shop.split('.')[0].replace(/-/g, ' '));
    const storefrontUrl =
      defaults.storefront_url || (isOrganikKal ? 'https://organikkal.com' : `https://${shop}`);

    const baseConfig = createDefaultTenantSettings(shop, brandName, storefrontUrl);
    if (isOrganikKal) {
      baseConfig.from_email = 'bilgi@organikkal.com';
      baseConfig.netgsm_msgheader = 'ORGANIKKAL';
      baseConfig.widget_theme = {
        ...DEFAULT_WIDGET_THEME,
        primary_color: '#244735',
        background_color: '#fffcf5',
        surface_color: '#f4efe5',
        accent_color: '#c86f42',
        text_color: '#203c33',
        border_radius: '14px',
        modal_eyebrow: '✦ ORGANİK KAL STOK HABERCİSİ',
        preorder_badge_text: 'Yeni Hasat · Ön Sipariş'
      };
    } else if (defaults.widget_theme) {
      baseConfig.widget_theme = { ...DEFAULT_WIDGET_THEME, ...defaults.widget_theme };
    }

    const mergedConfig = { ...baseConfig, ...defaults, shop };
    db.prepare(`
      INSERT INTO tenants (shop, brand_name, storefront_url, access_token, plan, active, config_json)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(
      shop,
      mergedConfig.brand_name,
      mergedConfig.storefront_url,
      defaults.access_token || '',
      mergedConfig.plan || 'pro',
      JSON.stringify(mergedConfig)
    );

    return getTenant(shop);
  }

  function parseTenantRow(row) {
    if (!row) return null;
    let parsedConfig = {};
    try {
      parsedConfig = JSON.parse(row.config_json || '{}');
    } catch {}
    const base = createDefaultTenantSettings(row.shop, row.brand_name, row.storefront_url);
    return {
      ...base,
      ...parsedConfig,
      shop: row.shop,
      brand_name: parsedConfig.brand_name || row.brand_name,
      storefront_url: parsedConfig.storefront_url || row.storefront_url,
      access_token: row.access_token || '',
      plan: row.plan || 'pro',
      active: Boolean(row.active),
      installed_at: row.installed_at,
      widget_theme: {
        ...DEFAULT_WIDGET_THEME,
        ...(parsedConfig.widget_theme || {})
      }
    };
  }

  function getTenant(shopInput = DEFAULT_SHOP) {
    const shop = normalizeShopDomain(shopInput);
    const row = db.prepare('SELECT * FROM tenants WHERE shop = ?').get(shop);
    if (!row) return ensureTenant(shop);
    return parseTenantRow(row);
  }

  function listTenants() {
    return db
      .prepare('SELECT * FROM tenants WHERE active = 1 ORDER BY installed_at ASC')
      .all()
      .map(parseTenantRow);
  }

  function getSettings(shopInput = DEFAULT_SHOP) {
    return getTenant(shopInput);
  }

  function updateSettings(patch, shopInput = DEFAULT_SHOP) {
    const shop = normalizeShopDomain(patch?.shop || shopInput);
    const current = getTenant(shop);
    const nextWidgetTheme = patch.widget_theme
      ? { ...current.widget_theme, ...patch.widget_theme }
      : current.widget_theme;
    const merged = {
      ...current,
      ...patch,
      shop,
      widget_theme: nextWidgetTheme
    };
    db.prepare(`
      UPDATE tenants
      SET brand_name = ?,
          storefront_url = ?,
          access_token = COALESCE(NULLIF(?, ''), access_token),
          plan = ?,
          config_json = ?,
          updated_at = datetime('now')
      WHERE shop = ?
    `).run(
      merged.brand_name || current.brand_name,
      merged.storefront_url || current.storefront_url,
      patch.access_token || '',
      merged.plan || current.plan || 'pro',
      JSON.stringify(merged),
      shop
    );
    return getTenant(shop);
  }

  // Ensure default tenant exists
  ensureTenant(DEFAULT_SHOP);

  function addSubscription(input) {
    const shop = normalizeShopDomain(input.shop || DEFAULT_SHOP);
    ensureTenant(shop);

    const productId = String(input.product_id || '').trim();
    const variantId = String(input.variant_id || '').trim();
    const productTitle = String(input.product_title || 'Ürün').trim();
    const variantTitle = String(input.variant_title || 'Standart').trim();
    const productHandle = String(input.product_handle || '').trim();
    const productImage = String(input.product_image || '').trim();
    const variantSku = String(input.variant_sku || '').trim();
    const inventoryItemId = String(input.inventory_item_id || '').trim();
    const priceCents = Number(input.price_cents || 0);
    const currency = String(input.currency || 'TRY').trim();
    const customerName = String(input.customer_name || '').trim();
    const customerEmail = String(input.customer_email || '').trim().toLowerCase();
    const customerPhone = normalizePhone(input.customer_phone || '');
    const kvkkConsent = input.kvkk_consent === false ? 0 : 1;

    let channels = Array.isArray(input.channels) ? input.channels : [];
    channels = channels
      .map((c) => String(c).toLowerCase().trim())
      .filter((c) => ['email', 'whatsapp', 'sms'].includes(c));

    if (channels.length === 0) {
      if (customerEmail) channels.push('email');
      if (customerPhone) channels.push('whatsapp');
    }
    channels = [...new Set(channels)];

    if (!variantId || !productId) {
      throw new Error('Ürün ve varyant bilgisi zorunludur.');
    }
    if (!customerEmail && !customerPhone) {
      throw new Error('Lütfen e-posta adresi veya telefon numarası girin.');
    }
    if (channels.includes('email') && !customerEmail) {
      throw new Error('E-posta bildirimi için geçerli bir e-posta adresi girin.');
    }
    if ((channels.includes('whatsapp') || channels.includes('sms')) && !customerPhone) {
      throw new Error('WhatsApp veya SMS bildirimi için geçerli bir telefon numarası girin (Örn: 05xx xxx xx xx).');
    }

    const existing = db
      .prepare(`
        SELECT * FROM subscriptions
        WHERE shop = ?
          AND variant_id = ?
          AND status = 'pending'
          AND (
            (? != '' AND customer_email = ?)
            OR (? != '' AND customer_phone = ?)
          )
        LIMIT 1
      `)
      .get(shop, variantId, customerEmail, customerEmail, customerPhone, customerPhone);

    if (existing) {
      const prevChannels = safeParseArray(existing.channels);
      const mergedChannels = [...new Set([...prevChannels, ...channels])];
      db.prepare(`
        UPDATE subscriptions
        SET customer_name = COALESCE(NULLIF(?, ''), customer_name),
            customer_email = COALESCE(NULLIF(?, ''), customer_email),
            customer_phone = COALESCE(NULLIF(?, ''), customer_phone),
            channels = ?,
            product_title = COALESCE(NULLIF(?, ''), product_title),
            variant_title = COALESCE(NULLIF(?, ''), variant_title),
            product_handle = COALESCE(NULLIF(?, ''), product_handle),
            product_image = COALESCE(NULLIF(?, ''), product_image),
            price_cents = CASE WHEN ? > 0 THEN ? ELSE price_cents END,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        customerName,
        customerEmail,
        customerPhone,
        JSON.stringify(mergedChannels),
        productTitle,
        variantTitle,
        productHandle,
        productImage,
        priceCents,
        priceCents,
        existing.id
      );
      return {
        ...getSubscriptionById(existing.id),
        deduplicated: true
      };
    }

    const result = db
      .prepare(`
        INSERT INTO subscriptions (
          shop, product_id, product_title, product_handle, product_image,
          variant_id, variant_title, variant_sku, inventory_item_id,
          price_cents, currency, customer_name, customer_email, customer_phone,
          channels, kvkk_consent, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `)
      .run(
        shop,
        productId,
        productTitle,
        productHandle,
        productImage,
        variantId,
        variantTitle,
        variantSku,
        inventoryItemId,
        priceCents,
        currency,
        customerName,
        customerEmail,
        customerPhone,
        JSON.stringify(channels),
        kvkkConsent
      );

    return {
      ...getSubscriptionById(Number(result.lastInsertRowid)),
      deduplicated: false
    };
  }

  function formatSubscriptionRow(row) {
    if (!row) return null;
    return {
      ...row,
      channels: safeParseArray(row.channels),
      kvkk_consent: Boolean(row.kvkk_consent)
    };
  }

  function getSubscriptionById(id) {
    const row = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
    return formatSubscriptionRow(row);
  }

  function listSubscriptions(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.shop && filters.shop !== 'all') {
      conditions.push('shop = ?');
      params.push(normalizeShopDomain(filters.shop));
    }
    if (filters.status && filters.status !== 'all') {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    if (filters.variant_id) {
      conditions.push('variant_id = ?');
      params.push(String(filters.variant_id));
    }
    if (filters.product_id) {
      conditions.push('product_id = ?');
      params.push(String(filters.product_id));
    }
    if (filters.channel) {
      conditions.push('channels LIKE ?');
      params.push(`%"${filters.channel}"%`);
    }
    if (filters.search) {
      const q = `%${filters.search.trim()}%`;
      conditions.push(
        '(product_title LIKE ? OR variant_title LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ? OR customer_name LIKE ?)'
      );
      params.push(q, q, q, q, q);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(500, Math.max(1, Number(filters.limit || 200)));

    const rows = db
      .prepare(`SELECT * FROM subscriptions ${whereClause} ORDER BY id DESC LIMIT ?`)
      .all(...params, limit);

    return rows.map(formatSubscriptionRow);
  }

  function findPendingForRestock({ shop, variantId, inventoryItemId }) {
    const shopClause = shop ? 'AND shop = ?' : '';
    const shopParams = shop ? [normalizeShopDomain(shop)] : [];

    if (variantId && inventoryItemId) {
      return db
        .prepare(`
          SELECT * FROM subscriptions
          WHERE status = 'pending' ${shopClause} AND (variant_id = ? OR inventory_item_id = ?)
          ORDER BY id ASC
        `)
        .all(...shopParams, String(variantId), String(inventoryItemId))
        .map(formatSubscriptionRow);
    }
    if (variantId) {
      return db
        .prepare(`
          SELECT * FROM subscriptions
          WHERE status = 'pending' ${shopClause} AND variant_id = ?
          ORDER BY id ASC
        `)
        .all(...shopParams, String(variantId))
        .map(formatSubscriptionRow);
    }
    if (inventoryItemId) {
      return db
        .prepare(`
          SELECT * FROM subscriptions
          WHERE status = 'pending' ${shopClause} AND inventory_item_id = ?
          ORDER BY id ASC
        `)
        .all(...shopParams, String(inventoryItemId))
        .map(formatSubscriptionRow);
    }
    return [];
  }

  function markSubscriptionNotified(id, lastError = null) {
    db.prepare(`
      UPDATE subscriptions
      SET status = 'notified',
          notified_at = datetime('now'),
          last_error = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(lastError, id);
    return getSubscriptionById(id);
  }

  function markSubscriptionConverted({ shop, variantId, customerEmail, customerPhone, orderId, revenueCents }) {
    const normalizedPhone = normalizePhone(customerPhone || '');
    const email = String(customerEmail || '').trim().toLowerCase();
    const shopFilter = shop ? 'AND shop = ?' : '';
    const args = shop
      ? [String(variantId), normalizeShopDomain(shop), email, email, normalizedPhone, normalizedPhone]
      : [String(variantId), email, email, normalizedPhone, normalizedPhone];

    const matching = db
      .prepare(`
        SELECT * FROM subscriptions
        WHERE variant_id = ?
          ${shopFilter}
          AND status IN ('notified', 'pending')
          AND (
            (? != '' AND customer_email = ?)
            OR (? != '' AND customer_phone = ?)
          )
        ORDER BY id DESC
        LIMIT 1
      `)
      .get(...args);

    if (!matching) return null;

    db.prepare(`
      UPDATE subscriptions
      SET status = 'converted',
          converted_at = datetime('now'),
          converted_order_id = ?,
          converted_revenue_cents = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(String(orderId || ''), Number(revenueCents || matching.price_cents || 0), matching.id);

    return getSubscriptionById(matching.id);
  }

  function deleteSubscription(id) {
    const info = db.prepare('DELETE FROM subscriptions WHERE id = ?').run(id);
    return info.changes > 0;
  }

  function addNotificationLog(entry) {
    const sub = entry.subscription_id ? getSubscriptionById(entry.subscription_id) : null;
    const shop = normalizeShopDomain(entry.shop || sub?.shop || DEFAULT_SHOP);
    db.prepare(`
      INSERT INTO notification_logs (
        shop, subscription_id, channel, recipient, status,
        provider, provider_message_id, error_message, payload_preview
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      shop,
      entry.subscription_id,
      entry.channel,
      entry.recipient || '',
      entry.status || 'sent',
      entry.provider || '',
      entry.provider_message_id || '',
      entry.error_message || '',
      entry.payload_preview || ''
    );
  }

  function listNotificationLogs(limit = 100, shop = null) {
    if (shop && shop !== 'all') {
      return db
        .prepare(`
          SELECT l.*, s.product_title, s.variant_title, s.customer_name
          FROM notification_logs l
          LEFT JOIN subscriptions s ON s.id = l.subscription_id
          WHERE l.shop = ?
          ORDER BY l.id DESC
          LIMIT ?
        `)
        .all(normalizeShopDomain(shop), limit);
    }
    return db
      .prepare(`
        SELECT l.*, s.product_title, s.variant_title, s.customer_name
        FROM notification_logs l
        LEFT JOIN subscriptions s ON s.id = l.subscription_id
        ORDER BY l.id DESC
        LIMIT ?
      `)
      .all(limit);
  }

  // Preorder management (Multi-tenant)
  function upsertPreorderConfig(input) {
    const shop = normalizeShopDomain(input.shop || DEFAULT_SHOP);
    ensureTenant(shop);
    const productId = String(input.product_id || '').trim();
    const variantId = String(input.variant_id || '').trim();
    if (!productId || !variantId) {
      throw new Error('Ön sipariş kuralı için product_id ve variant_id zorunludur.');
    }

    db.prepare(`
      INSERT INTO preorder_configs (
        shop, product_id, variant_id, product_title, product_handle, variant_title,
        enabled, button_text, badge_text, shipping_note, estimated_shipping_date,
        max_quantity, reserved_count, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(shop, variant_id) DO UPDATE SET
        product_id = excluded.product_id,
        product_title = excluded.product_title,
        product_handle = excluded.product_handle,
        variant_title = excluded.variant_title,
        enabled = excluded.enabled,
        button_text = excluded.button_text,
        badge_text = excluded.badge_text,
        shipping_note = excluded.shipping_note,
        estimated_shipping_date = excluded.estimated_shipping_date,
        max_quantity = excluded.max_quantity,
        updated_at = datetime('now')
    `).run(
      shop,
      productId,
      variantId,
      String(input.product_title || 'Ürün').trim(),
      String(input.product_handle || '').trim(),
      String(input.variant_title || 'Varsayılan').trim(),
      input.enabled === false || input.enabled === 0 ? 0 : 1,
      String(input.button_text || 'Ön Sipariş Ver').trim(),
      String(input.badge_text || 'Ön Sipariş').trim(),
      String(input.shipping_note || 'Planlanan sevkiyat tarihinde öncelikli olarak kargoya teslim edilir.').trim(),
      String(input.estimated_shipping_date || '').trim(),
      Number(input.max_quantity || 0),
      Number(input.reserved_count || 0)
    );

    return getPreorderByVariant(variantId, shop);
  }

  function getPreorderByVariant(variantId, shop = null) {
    const row = shop
      ? db
          .prepare('SELECT * FROM preorder_configs WHERE variant_id = ? AND shop = ?')
          .get(String(variantId), normalizeShopDomain(shop))
      : db.prepare('SELECT * FROM preorder_configs WHERE variant_id = ?').get(String(variantId));
    if (!row) return null;
    return {
      ...row,
      enabled: Boolean(row.enabled),
      quota_available:
        row.max_quantity > 0 ? Math.max(0, row.max_quantity - row.reserved_count) : null
    };
  }

  function listPreorderConfigs(onlyEnabled = false, shop = null) {
    const clauses = [];
    const params = [];
    if (onlyEnabled) clauses.push('enabled = 1');
    if (shop && shop !== 'all') {
      clauses.push('shop = ?');
      params.push(normalizeShopDomain(shop));
    }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return db
      .prepare(`SELECT * FROM preorder_configs ${whereSql} ORDER BY updated_at DESC`)
      .all(...params)
      .map((row) => ({
        ...row,
        enabled: Boolean(row.enabled),
        quota_available:
          row.max_quantity > 0 ? Math.max(0, row.max_quantity - row.reserved_count) : null
      }));
  }

  function incrementPreorderReserved(variantId, quantity = 1, shop = null) {
    if (shop) {
      db.prepare(`
        UPDATE preorder_configs
        SET reserved_count = reserved_count + ?,
            updated_at = datetime('now')
        WHERE variant_id = ? AND shop = ?
      `).run(Number(quantity || 1), String(variantId), normalizeShopDomain(shop));
      return getPreorderByVariant(variantId, shop);
    }
    db.prepare(`
      UPDATE preorder_configs
      SET reserved_count = reserved_count + ?,
          updated_at = datetime('now')
      WHERE variant_id = ?
    `).run(Number(quantity || 1), String(variantId));
    return getPreorderByVariant(variantId);
  }

  function deletePreorderConfig(variantId, shop = null) {
    const info = shop
      ? db
          .prepare('DELETE FROM preorder_configs WHERE variant_id = ? AND shop = ?')
          .run(String(variantId), normalizeShopDomain(shop))
      : db.prepare('DELETE FROM preorder_configs WHERE variant_id = ?').run(String(variantId));
    return info.changes > 0;
  }

  function getDashboardStats(shop = null) {
    const hasShop = shop && shop !== 'all';
    const whereSql = hasShop ? 'WHERE shop = ?' : '';
    const params = hasShop ? [normalizeShopDomain(shop)] : [];

    const counts = db
      .prepare(`
        SELECT
          COUNT(*) AS total_subscriptions,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
          SUM(CASE WHEN status = 'notified' THEN 1 ELSE 0 END) AS notified_count,
          SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) AS converted_count,
          SUM(CASE WHEN status = 'pending' THEN price_cents ELSE 0 END) AS pending_demand_cents,
          SUM(CASE WHEN status = 'converted' THEN converted_revenue_cents ELSE 0 END) AS recovered_revenue_cents,
          SUM(CASE WHEN channels LIKE '%"email"%' THEN 1 ELSE 0 END) AS email_channel_count,
          SUM(CASE WHEN channels LIKE '%"whatsapp"%' THEN 1 ELSE 0 END) AS whatsapp_channel_count,
          SUM(CASE WHEN channels LIKE '%"sms"%' THEN 1 ELSE 0 END) AS sms_channel_count
        FROM subscriptions
        ${whereSql}
      `)
      .get(...params);

    const topProducts = db
      .prepare(`
        SELECT
          shop,
          product_id,
          product_title,
          product_handle,
          product_image,
          variant_id,
          variant_title,
          price_cents,
          COUNT(*) AS total_requests,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS waiting_count,
          SUM(CASE WHEN status = 'notified' THEN 1 ELSE 0 END) AS notified_count,
          SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) AS converted_count
        FROM subscriptions
        ${whereSql}
        GROUP BY shop, variant_id
        ORDER BY waiting_count DESC, total_requests DESC
        LIMIT 10
      `)
      .all(...params);

    const preorderSummary = db
      .prepare(`
        SELECT
          COUNT(*) AS total_rules,
          SUM(CASE WHEN enabled = 1 THEN 1 ELSE 0 END) AS active_rules,
          SUM(reserved_count) AS total_preorders
        FROM preorder_configs
        ${whereSql}
      `)
      .get(...params);

    return {
      shop: hasShop ? normalizeShopDomain(shop) : 'all',
      total_subscriptions: Number(counts.total_subscriptions || 0),
      pending_count: Number(counts.pending_count || 0),
      notified_count: Number(counts.notified_count || 0),
      converted_count: Number(counts.converted_count || 0),
      pending_demand_cents: Number(counts.pending_demand_cents || 0),
      recovered_revenue_cents: Number(counts.recovered_revenue_cents || 0),
      channels: {
        email: Number(counts.email_channel_count || 0),
        whatsapp: Number(counts.whatsapp_channel_count || 0),
        sms: Number(counts.sms_channel_count || 0)
      },
      preorders: {
        total_rules: Number(preorderSummary.total_rules || 0),
        active_rules: Number(preorderSummary.active_rules || 0),
        total_preorders: Number(preorderSummary.total_preorders || 0)
      },
      top_products: topProducts
    };
  }

  return {
    db,
    ensureTenant,
    getTenant,
    listTenants,
    getSettings,
    updateSettings,
    addSubscription,
    getSubscriptionById,
    listSubscriptions,
    findPendingForRestock,
    markSubscriptionNotified,
    markSubscriptionConverted,
    deleteSubscription,
    addNotificationLog,
    listNotificationLogs,
    upsertPreorderConfig,
    getPreorderByVariant,
    listPreorderConfigs,
    incrementPreorderReserved,
    deletePreorderConfig,
    getDashboardStats
  };
}

function safeParseArray(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

module.exports = {
  createDatabase,
  normalizeShopDomain,
  createDefaultTenantSettings,
  DEFAULT_WIDGET_THEME,
  DEFAULT_SHOP
};
