'use strict';

function renderAdminHtml() {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PulseNotify · Multi-Brand Back in Stock & Preorder SaaS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --brand-primary: #18181b;
      --brand-hover: #27272a;
      --brand-soft: #f4f4f5;
      --brand-bg: #f8fafc;
      --brand-surface: #ffffff;
      --brand-accent: #0f766e;
      --brand-border: #e2e8f0;
      --brand-text: #0f172a;
      --brand-muted: #64748b;
      --brand-danger: #b42318;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--brand-bg);
      color: var(--brand-text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .topbar {
      background: #0f172a;
      color: #f8fafc;
      padding: 16px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .topbar__brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .topbar__logo {
      width: 40px;
      height: 40px;
      border-radius: 11px;
      background: linear-gradient(135deg, #10b981, #059669);
      display: grid;
      place-items: center;
      font-size: 19px;
      color: #ffffff;
      font-weight: 700;
    }
    .topbar__title h1 {
      margin: 0;
      font-size: 17px;
      font-weight: 600;
      letter-spacing: -0.2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .topbar__badge {
      font-size: 10.5px;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
      font-weight: 600;
    }
    .topbar__title p {
      margin: 2px 0 0;
      font-size: 12px;
      color: #94a3b8;
    }
    .topbar__actions {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    .tenant-switcher {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.08);
      padding: 5px 10px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.16);
    }
    .tenant-switcher label {
      font-size: 11.5px;
      color: #cbd5e1;
      font-weight: 600;
    }
    .tenant-switcher select {
      background: #1e293b;
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      padding: 6px 10px;
      min-height: 32px;
      font-weight: 600;
      font-size: 13px;
    }
    .container {
      max-width: 1340px;
      margin: 0 auto;
      padding: 24px 28px 60px;
    }
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--brand-border);
      padding-bottom: 12px;
      overflow-x: auto;
    }
    .tab-btn {
      appearance: none;
      border: 1px solid transparent;
      background: transparent;
      color: var(--brand-muted);
      font: 600 13.5px/1.3 'Inter', sans-serif;
      padding: 10px 15px;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .tab-btn:hover {
      background: #eef2f6;
      color: var(--brand-text);
    }
    .tab-btn.is-active {
      background: var(--brand-primary);
      color: #ffffff;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--brand-surface);
      border: 1px solid var(--brand-border);
      border-radius: 16px;
      padding: 18px 20px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
    }
    .kpi-card__label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--brand-muted);
    }
    .kpi-card__value {
      font-size: 28px;
      font-weight: 700;
      color: var(--brand-text);
      margin: 6px 0 4px;
    }
    .kpi-card__sub {
      font-size: 12.5px;
      color: var(--brand-muted);
    }
    .panel {
      background: var(--brand-surface);
      border: 1px solid var(--brand-border);
      border-radius: 18px;
      padding: 22px 24px;
      margin-bottom: 22px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
    }
    .panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }
    .panel__title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--brand-text);
    }
    .panel__subtitle {
      margin: 3px 0 0;
      font-size: 13px;
      color: var(--brand-muted);
    }
    .toolbar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="number"],
    input[type="password"],
    input[type="color"],
    select,
    textarea {
      padding: 9px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background: #ffffff;
      color: var(--brand-text);
      font: 400 13.5px/1.4 'Inter', sans-serif;
      min-height: 38px;
    }
    textarea {
      width: 100%;
      min-height: 84px;
      resize: vertical;
    }
    .btn {
      appearance: none;
      border: 1px solid var(--brand-primary);
      background: var(--brand-primary);
      color: #ffffff;
      font: 600 13px/1.2 'Inter', sans-serif;
      padding: 10px 15px;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn:hover:not(:disabled) {
      background: var(--brand-hover);
    }
    .btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .btn--secondary {
      background: #ffffff;
      color: var(--brand-text);
      border-color: #cbd5e1;
    }
    .btn--secondary:hover:not(:disabled) {
      background: #f1f5f9;
    }
    .btn--whatsapp {
      background: #128c7e;
      border-color: #128c7e;
      color: #ffffff;
    }
    .btn--danger {
      background: #fff5f5;
      border-color: #f5c2c7;
      color: var(--brand-danger);
    }
    .btn--sm {
      padding: 6px 10px;
      font-size: 12px;
      border-radius: 8px;
    }
    .table-wrap { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--brand-muted);
      padding: 11px 12px;
      border-bottom: 1px solid var(--brand-border);
      background: #f8fafc;
    }
    td {
      padding: 13px 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      font-size: 13.5px;
    }
    tr:last-child td { border-bottom: none; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 600;
    }
    .badge--pending { background: #fef3c7; color: #92400e; }
    .badge--notified { background: #dbeafe; color: #1e40af; }
    .badge--converted { background: #d1fae5; color: #065f46; }
    .badge--email { background: #f1f5f9; color: #0f172a; }
    .badge--whatsapp { background: #dcfce7; color: #15803d; }
    .badge--sms { background: #f3e8ff; color: #6b21a8; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .form-field label {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--brand-text);
    }
    .form-field small {
      font-size: 11.5px;
      color: var(--brand-muted);
    }
    .code-box {
      background: #0f172a;
      color: #e2e8f0;
      padding: 14px 16px;
      border-radius: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12.5px;
      overflow-x: auto;
    }
    .toast {
      position: fixed;
      bottom: 22px;
      right: 22px;
      background: #0f172a;
      color: #ffffff;
      padding: 13px 18px;
      border-radius: 12px;
      box-shadow: 0 14px 35px rgba(0,0,0,0.22);
      font-weight: 500;
      z-index: 9999;
      display: none;
    }
    .toast.is-visible { display: block; }
    dialog.admin-modal {
      border: 1px solid var(--brand-border);
      border-radius: 20px;
      background: var(--brand-surface);
      color: var(--brand-text);
      width: min(560px, calc(100vw - 28px));
      padding: 24px;
      box-shadow: 0 24px 65px rgba(15, 23, 42, 0.25);
    }
    dialog.admin-modal::backdrop {
      background: rgba(15, 23, 42, 0.48);
      backdrop-filter: blur(2px);
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar__brand">
      <div class="topbar__logo">⚡</div>
      <div class="topbar__title">
        <h1>PulseNotify <span class="topbar__badge">Multi-Brand Shopify SaaS</span></h1>
        <p>Back in Stock (E-posta · WhatsApp · SMS) & Preorder Yönetim Platformu</p>
      </div>
    </div>
    <div class="topbar__actions">
      <div class="tenant-switcher">
        <label for="ActiveShopSelect">Aktif Marka:</label>
        <select id="ActiveShopSelect"></select>
        <button class="btn btn--secondary btn--sm" type="button" id="BtnOpenAddTenant">+ Yeni Marka Ekle</button>
      </div>
      <button class="btn btn--secondary btn--sm" type="button" id="BtnOpenImportCsv">📥 Notify CSV İçe Aktar</button>
      <button class="btn btn--secondary btn--sm" type="button" id="BtnOpenAddSubscriber">+ Abone Ekle</button>
      <a class="btn btn--secondary btn--sm" id="BtnExportCsv" href="/api/admin/subscriptions/export.csv">⬇ CSV İndir</a>
    </div>
  </header>

  <main class="container">
    <nav class="tabs" role="tablist">
      <button class="tab-btn is-active" data-tab="overview">📊 Genel Bakış & Stok Önceliği</button>
      <button class="tab-btn" data-tab="subscribers">🔔 Stok Bildirim Aboneleri</button>
      <button class="tab-btn" data-tab="preorders">⏳ Ön Sipariş (Preorder)</button>
      <button class="tab-btn" data-tab="studio">🎨 Vitrin & Marka Tasarımı (Widget)</button>
      <button class="tab-btn" data-tab="settings">⚙️ Kanal & API Ayarları</button>
      <button class="tab-btn" data-tab="logs">📋 Gönderim Kayıtları</button>
    </nav>

    <!-- TAB 1: OVERVIEW -->
    <section id="tab-overview" class="tab-panel">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-card__label">Bekleyen Stok Talebi</div>
          <div class="kpi-card__value" id="kpi-pending">0</div>
          <div class="kpi-card__sub">Potansiyel Talep: <strong id="kpi-pending-demand">₺0,00</strong></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__label">Gönderilen Bildirimler</div>
          <div class="kpi-card__value" id="kpi-notified">0</div>
          <div class="kpi-card__sub" id="kpi-channels-breakdown">E-posta: 0 · WhatsApp: 0 · SMS: 0</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__label">Kurtarılan Sipariş & Ciro</div>
          <div class="kpi-card__value" id="kpi-recovered-revenue">₺0,00</div>
          <div class="kpi-card__sub"><strong id="kpi-converted">0</strong> abone bildirim sonrası satın aldı</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__label">Ön Sipariş (Preorder)</div>
          <div class="kpi-card__value" id="kpi-preorder-total">0</div>
          <div class="kpi-card__sub"><strong id="kpi-preorder-rules">0</strong> aktif ön sipariş ürünü</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel__header">
          <div>
            <h2 class="panel__title">🔥 En Çok Talep Alan Ürünler (Stok Öncelik Raporu)</h2>
            <p class="panel__subtitle">Seçili markada hangi ürün ve varyant için kaç müşterinin stok beklediğini görün ve tek tıkla tümünü bilgilendirin.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Marka / Mağaza</th>
                <th>Ürün & Varyant</th>
                <th>Fiyat</th>
                <th>Bekleyen Kişi</th>
                <th>Bildirilen</th>
                <th>Siparişe Dönüşen</th>
                <th>Hızlı Aksiyon</th>
              </tr>
            </thead>
            <tbody id="top-products-tbody">
              <tr><td colspan="7">Yükleniyor…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 2: SUBSCRIBERS -->
    <section id="tab-subscribers" class="tab-panel" hidden>
      <div class="panel">
        <div class="panel__header">
          <div>
            <h2 class="panel__title">Stok Bildirim Aboneleri</h2>
            <p class="panel__subtitle">Müşterilerin E-posta, WhatsApp ve SMS tercihlerini yönetin, tekil veya toplu stok bildirimi gönderin.</p>
          </div>
          <div class="toolbar">
            <input type="text" id="filter-search" placeholder="İsim, e-posta, telefon veya ürün ara…" />
            <select id="filter-status">
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Bekleyen (Stok Yok)</option>
              <option value="notified">Bildirildi</option>
              <option value="converted">Siparişe Dönüştü</option>
            </select>
            <select id="filter-channel">
              <option value="">Tüm Kanallar</option>
              <option value="email">E-posta</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
            <button class="btn btn--secondary btn--sm" type="button" id="BtnRefreshSubscribers">Yenile</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Marka</th>
                <th>Müşteri</th>
                <th>İletişim (E-posta / Tel)</th>
                <th>Ürün & Varyant</th>
                <th>Kanallar</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody id="subscribers-tbody">
              <tr><td colspan="7">Yükleniyor…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 3: PREORDERS -->
    <section id="tab-preorders" class="tab-panel" hidden>
      <div class="panel">
        <div class="panel__header">
          <div>
            <h2 class="panel__title">Yeni Ön Sipariş (Preorder) Kuralı Ekle / Güncelle</h2>
            <p class="panel__subtitle">Seçili mağazada stok 0 olsa bile satışına devam edilecek ön sipariş ürünlerini ve tahmini teslimat tarihlerini yönetin.</p>
          </div>
        </div>
        <form id="preorder-form">
          <div class="form-grid">
            <div class="form-field">
              <label>Ürün Adı *</label>
              <input type="text" name="product_title" required placeholder="Örn: Organik Yumurta / Nemlendirici Serum" />
            </div>
            <div class="form-field">
              <label>Ürün Handle (URL uzantısı)</label>
              <input type="text" name="product_handle" placeholder="Örn: organik-yumurta" />
            </div>
            <div class="form-field">
              <label>Shopify Product ID *</label>
              <input type="text" name="product_id" required placeholder="Örn: 8912345678" />
            </div>
            <div class="form-field">
              <label>Shopify Variant ID *</label>
              <input type="text" name="variant_id" required placeholder="Örn: 45123456789" />
            </div>
            <div class="form-field">
              <label>Varyant Adı</label>
              <input type="text" name="variant_title" value="Standart" />
            </div>
            <div class="form-field">
              <label>Buton Metni</label>
              <input type="text" name="button_text" value="Ön Sipariş Ver" />
            </div>
            <div class="form-field">
              <label>Ürün Kartı / Detay Rozeti</label>
              <input type="text" name="badge_text" value="Ön Sipariş" />
            </div>
            <div class="form-field">
              <label>Tahmini Kargolama / Teslimat Tarihi</label>
              <input type="text" name="estimated_shipping_date" placeholder="Örn: 25 Kasım" />
            </div>
            <div class="form-field">
              <label>Maksimum Ön Sipariş Kotası (0 = Sınırsız)</label>
              <input type="number" name="max_quantity" value="0" min="0" />
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>Teslimat Bilgilendirme Notu</label>
              <input type="text" name="shipping_note" value="Planlanan sevkiyat tarihinde öncelikli olarak kargoya teslim edilir." />
            </div>
          </div>
          <div style="margin-top: 16px;">
            <button type="submit" class="btn">Ön Sipariş Kuralını Kaydet</button>
          </div>
        </form>
      </div>

      <div class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Tanımlı Ön Sipariş Ürünleri</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Marka</th>
                <th>Ürün & Varyant</th>
                <th>Variant ID</th>
                <th>Buton & Rozet</th>
                <th>Tahmini Gönderim</th>
                <th>Rezerv / Kota</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody id="preorders-tbody">
              <tr><td colspan="7">Yükleniyor…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 4: WIDGET & BRAND STUDIO -->
    <section id="tab-studio" class="tab-panel" hidden>
      <div class="panel">
        <div class="panel__header">
          <div>
            <h2 class="panel__title">🎨 Marka Kimliği & Vitrin Widget Tasarımı</h2>
            <p class="panel__subtitle">Her markanın vitrinindeki "Gelince Haber Ver" butonu, açılır modal ve gönderilen HTML e-postalar bu renklere göre otomatik şekillenir.</p>
          </div>
        </div>
        <form id="studio-form">
          <div class="form-grid">
            <div class="form-field">
              <label>Marka Adı (Brand Name)</label>
              <input type="text" name="brand_name" required />
            </div>
            <div class="form-field">
              <label>Mağaza Vitrin URL (Storefront URL)</label>
              <input type="text" name="storefront_url" required />
            </div>
            <div class="form-field">
              <label>Ana Marka Rengi (Buton & E-posta Başlığı)</label>
              <input type="text" name="primary_color" placeholder="#244735" />
            </div>
            <div class="form-field">
              <label>Modal Arka Plan Rengi</label>
              <input type="text" name="background_color" placeholder="#fffcf5" />
            </div>
            <div class="form-field">
              <label>Vurgu Rengi (Fiyat & Etiket)</label>
              <input type="text" name="accent_color" placeholder="#c86f42" />
            </div>
            <div class="form-field">
              <label>Buton Metni (Stok Bittiğinde)</label>
              <input type="text" name="notify_button_text" placeholder="Gelince Haber Ver" />
            </div>
            <div class="form-field">
              <label>Ön Sipariş Buton Metni</label>
              <input type="text" name="preorder_button_text" placeholder="Ön Sipariş Ver" />
            </div>
            <div class="form-field">
              <label>Modal Üst Etiketi (Eyebrow)</label>
              <input type="text" name="modal_eyebrow" placeholder="STOK BİLDİRİM SERVİSİ" />
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>Modal Başlığı</label>
              <input type="text" name="modal_title" placeholder="Stok gelince haber verelim" />
            </div>
          </div>
          <div style="margin-top: 18px;">
            <button type="submit" class="btn">Marka Tasarımını Kaydet</button>
          </div>
        </form>
      </div>

      <div class="panel">
        <div class="panel__header">
          <div>
            <h2 class="panel__title">🔌 Evrensel Shopify Mağaza Kurulum Kodu (Universal SDK)</h2>
            <p class="panel__subtitle">Bu uygulamayı kullanan herhangi bir Shopify markası, kendi temasına tek satırlık aşağıdaki script'i ekleyerek veya Theme App Extension'ı açarak anında kullanmaya başlayabilir:</p>
          </div>
        </div>
        <div class="code-box" id="SdkEmbedCode"></div>
      </div>
    </section>

    <!-- TAB 5: SETTINGS -->
    <section id="tab-settings" class="tab-panel" hidden>
      <form id="settings-form">
        <div class="panel">
          <div class="panel__header">
            <div>
              <h2 class="panel__title">Otomasyon & Stok Eşiği (Seçili Marka İçin)</h2>
              <p class="panel__subtitle">Shopify'da ürün stoğu güncellendiğinde bildirimlerin nasıl tetikleneceğini belirleyin.</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Minimum Stok Eşiği</label>
              <input type="number" name="min_stock_threshold" min="1" value="1" />
            </div>
            <div class="form-field">
              <label>Otomatik Stok Bildirimi (Webhook)</label>
              <select name="auto_notify_on_restock">
                <option value="1">Açık (Stok girildiğinde otomatik gönder)</option>
                <option value="0">Kapalı (Sadece panelden manuel gönder)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel__header">
            <div>
              <h2 class="panel__title">📧 E-posta Bildirim Ayarları (Resend / Brevo)</h2>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>E-posta Kanalı</label>
              <select name="email_enabled">
                <option value="1">Aktif</option>
                <option value="0">Pasif</option>
              </select>
            </div>
            <div class="form-field">
              <label>E-posta Sağlayıcısı</label>
              <select name="email_provider">
                <option value="resend">Resend (Ayda 3.000 e-posta ücretsiz)</option>
                <option value="brevo">Brevo / Sendinblue</option>
                <option value="webhook">Özel Webhook</option>
              </select>
            </div>
            <div class="form-field">
              <label>Gönderici Adı</label>
              <input type="text" name="from_name" />
            </div>
            <div class="form-field">
              <label>Gönderici E-posta Adresi</label>
              <input type="email" name="from_email" />
            </div>
            <div class="form-field">
              <label>Resend API Key</label>
              <input type="password" name="resend_api_key" placeholder="re_..." />
            </div>
            <div class="form-field">
              <label>Brevo API Key</label>
              <input type="password" name="brevo_api_key" placeholder="xkeysib-..." />
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>E-posta Konu Başlığı Şablonu</label>
              <input type="text" name="email_subject_template" />
              <small>Değişkenler: {{brand_name}}, {{customer_name}}, {{product_title}}, {{variant_title}}, {{price}}</small>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel__header">
            <div>
              <h2 class="panel__title">💬 WhatsApp & 📱 SMS Bildirim Ayarları</h2>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>WhatsApp Kanalı</label>
              <select name="whatsapp_enabled">
                <option value="1">Aktif</option>
                <option value="0">Pasif</option>
              </select>
            </div>
            <div class="form-field">
              <label>WhatsApp Sağlayıcısı</label>
              <select name="whatsapp_provider">
                <option value="meta_cloud">Meta WhatsApp Business Cloud API</option>
                <option value="twilio">Twilio WhatsApp</option>
                <option value="webhook">Özel Webhook</option>
              </select>
            </div>
            <div class="form-field">
              <label>Meta Phone Number ID</label>
              <input type="text" name="whatsapp_phone_number_id" />
            </div>
            <div class="form-field">
              <label>Meta Access Token</label>
              <input type="password" name="whatsapp_access_token" />
            </div>
            <div class="form-field">
              <label>SMS Kanalı</label>
              <select name="sms_enabled">
                <option value="1">Aktif</option>
                <option value="0">Pasif</option>
              </select>
            </div>
            <div class="form-field">
              <label>NetGSM Kullanıcı Kodu</label>
              <input type="text" name="netgsm_usercode" />
            </div>
            <div class="form-field">
              <label>NetGSM Şifre</label>
              <input type="password" name="netgsm_password" />
            </div>
            <div class="form-field">
              <label>NetGSM Başlığı (Originator)</label>
              <input type="text" name="netgsm_msgheader" />
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>WhatsApp Mesaj Şablonu</label>
              <textarea name="whatsapp_message_template"></textarea>
            </div>
            <div class="form-field" style="grid-column: 1 / -1;">
              <label>SMS Mesaj Şablonu</label>
              <textarea name="sms_message_template"></textarea>
            </div>
          </div>
          <div style="margin-top: 20px;">
            <button type="submit" class="btn">Kanal Ayarlarını Kaydet</button>
          </div>
        </div>
      </form>
    </section>

    <!-- TAB 6: LOGS -->
    <section id="tab-logs" class="tab-panel" hidden>
      <div class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Gönderim Kayıtları (E-posta / WhatsApp / SMS)</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Marka</th>
                <th>Müşteri & Ürün</th>
                <th>Kanal</th>
                <th>Alıcı</th>
                <th>Sağlayıcı / Durum</th>
                <th>Mesaj Özeti</th>
              </tr>
            </thead>
            <tbody id="logs-tbody">
              <tr><td colspan="7">Yükleniyor…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>

  <!-- MODAL: ADD NEW BRAND / TENANT -->
  <dialog class="admin-modal" id="ModalAddTenant">
    <h3 style="margin:0 0 12px;">🏢 Yeni Marka / Shopify Mağazası Ekle</h3>
    <p style="margin:0 0 14px;font-size:13px;color:var(--brand-muted);">
      PulseNotify altyapısını kullanacak yeni bir Shopify mağazası tanımlayın. Her markanın aboneleri, renkleri ve bildirim şablonları birbirinden bağımsız yönetilir.
    </p>
    <form id="add-tenant-form">
      <div class="form-grid">
        <div class="form-field">
          <label>Shopify Mağaza Domaini *</label>
          <input type="text" name="shop" required placeholder="Örn: yeni-marka.myshopify.com" />
        </div>
        <div class="form-field">
          <label>Marka Adı *</label>
          <input type="text" name="brand_name" required placeholder="Örn: Lumi Cosmetics" />
        </div>
        <div class="form-field">
          <label>Vitrin Adresi (Storefront URL) *</label>
          <input type="text" name="storefront_url" required placeholder="https://lumicosmetics.com" />
        </div>
        <div class="form-field">
          <label>Ana Marka Rengi (Hex)</label>
          <input type="text" name="primary_color" value="#1e293b" />
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:18px;">
        <button type="button" class="btn btn--secondary" id="BtnCloseAddTenant">Vazgeç</button>
        <button type="submit" class="btn">Markayı Oluştur</button>
      </div>
    </form>
  </dialog>

  <!-- MODAL: ADD SUBSCRIBER -->
  <dialog class="admin-modal" id="ModalAddSubscriber">
    <h3 style="margin:0 0 14px;">Manuel Stok Bildirim Abonesi / Test Kaydı Ekle</h3>
    <form id="add-subscriber-form">
      <div class="form-grid">
        <div class="form-field">
          <label>Müşteri Adı Soyadı</label>
          <input type="text" name="customer_name" required placeholder="Örn: Ayşe Yılmaz" />
        </div>
        <div class="form-field">
          <label>E-posta Adresi</label>
          <input type="email" name="customer_email" placeholder="ornek@eposta.com" />
        </div>
        <div class="form-field">
          <label>Telefon Numarası (WhatsApp / SMS)</label>
          <input type="tel" name="customer_phone" placeholder="0532 123 45 67" />
        </div>
        <div class="form-field">
          <label>Ürün Adı *</label>
          <input type="text" name="product_title" required value="Organik Gezen Tavuk Yumurtası" />
        </div>
        <div class="form-field">
          <label>Varyant Adı</label>
          <input type="text" name="variant_title" value="30 Adet (L Boy)" />
        </div>
        <div class="form-field">
          <label>Ürün Handle</label>
          <input type="text" name="product_handle" value="organik-yumurta" />
        </div>
        <div class="form-field">
          <label>Product ID *</label>
          <input type="text" name="product_id" required value="901001" />
        </div>
        <div class="form-field">
          <label>Variant ID *</label>
          <input type="text" name="variant_id" required value="4901001" />
        </div>
        <div class="form-field">
          <label>Fiyat (TL)</label>
          <input type="number" name="price_tl" value="345" />
        </div>
        <div class="form-field" style="grid-column: 1 / -1;">
          <label>Bildirim Kanalları</label>
          <div style="display:flex; gap:14px; margin-top:4px;">
            <label><input type="checkbox" name="ch_email" checked /> E-posta</label>
            <label><input type="checkbox" name="ch_whatsapp" checked /> WhatsApp</label>
            <label><input type="checkbox" name="ch_sms" /> SMS</label>
          </div>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:18px;">
        <button type="button" class="btn btn--secondary" id="BtnCloseAddSubscriber">Vazgeç</button>
        <button type="submit" class="btn">Kaydet</button>
      </div>
    </form>
  </dialog>

  <!-- MODAL: IMPORT CSV -->
  <dialog class="admin-modal" id="ModalImportCsv">
    <h3 style="margin:0 0 8px;">📥 Eski Notify! Uygulamasından CSV İçe Aktar</h3>
    <p style="margin:0 0 14px; font-size:13px; color:var(--brand-muted);">
      Seçili mağaza için eski Notify! uygulamasından dışa aktardığınız CSV dosyasını seçin veya içeriğini aşağıya yapıştırın.
    </p>
    <form id="import-csv-form">
      <div class="form-field" style="margin-bottom:12px;">
        <label>CSV Dosyası Seçin</label>
        <input type="file" id="ImportCsvFile" accept=".csv,text/csv" />
      </div>
      <div class="form-field">
        <label>veya CSV Metnini Yapıştırın</label>
        <textarea name="csv" id="ImportCsvText" placeholder="Email,Phone,Product Title,Variant Title,Variant ID&#10;ayse@ornek.com,05321112233,Organik Yumurta,30 Adet,4901001" required></textarea>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
        <button type="button" class="btn btn--secondary" id="BtnCloseImportCsv">Vazgeç</button>
        <button type="submit" class="btn">İçe Aktar</button>
      </div>
    </form>
  </dialog>

  <div class="toast" id="Toast"></div>

  <script>
    let activeShop = 'organikkal.myshopify.com';

    const formatTry = (cents) =>
      new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format((Number(cents) || 0) / 100);

    const showToast = (msg) => {
      const el = document.getElementById('Toast');
      el.textContent = msg;
      el.classList.add('is-visible');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3600);
    };

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('is-active'));
        document.querySelectorAll('.tab-panel').forEach((p) => (p.hidden = true));
        btn.classList.add('is-active');
        const target = document.getElementById('tab-' + btn.dataset.tab);
        if (target) target.hidden = false;
      });
    });

    async function loadTenants() {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      const select = document.getElementById('ActiveShopSelect');
      const tenants = data.tenants || [];
      if (tenants.length && !tenants.some((t) => t.shop === activeShop) && activeShop !== 'all') {
        activeShop = tenants[0].shop;
      }
      select.innerHTML =
        tenants.map((t) => \`<option value="\${t.shop}" \${t.shop === activeShop ? 'selected' : ''}>\${t.brand_name} (\${t.shop})</option>\`).join('') +
        \`<option value="all" \${activeShop === 'all' ? 'selected' : ''}>🌐 Tüm Markalar (Toplam Görünüm)</option>\`;
      document.getElementById('BtnExportCsv').href = \`/api/admin/subscriptions/export.csv?shop=\${encodeURIComponent(activeShop)}\`;
    }

    document.getElementById('ActiveShopSelect').addEventListener('change', (e) => {
      activeShop = e.target.value;
      document.getElementById('BtnExportCsv').href = \`/api/admin/subscriptions/export.csv?shop=\${encodeURIComponent(activeShop)}\`;
      refreshAll();
      loadSettingsAndStudio();
    });

    async function loadDashboard() {
      const res = await fetch('/api/admin/dashboard?shop=' + encodeURIComponent(activeShop));
      const data = await res.json();
      const s = data.stats;
      document.getElementById('kpi-pending').textContent = s.pending_count;
      document.getElementById('kpi-pending-demand').textContent = formatTry(s.pending_demand_cents);
      document.getElementById('kpi-notified').textContent = s.notified_count;
      document.getElementById('kpi-channels-breakdown').textContent =
        \`E-posta: \${s.channels.email} · WhatsApp: \${s.channels.whatsapp} · SMS: \${s.channels.sms}\`;
      document.getElementById('kpi-recovered-revenue').textContent = formatTry(s.recovered_revenue_cents);
      document.getElementById('kpi-converted').textContent = s.converted_count;
      document.getElementById('kpi-preorder-total').textContent = s.preorders.total_preorders;
      document.getElementById('kpi-preorder-rules').textContent = s.preorders.active_rules;

      const tbody = document.getElementById('top-products-tbody');
      if (!s.top_products.length) {
        tbody.innerHTML = '<tr><td colspan="7">Bu mağaza için henüz stok bildirim talebi bulunmuyor.</td></tr>';
        return;
      }
      tbody.innerHTML = s.top_products
        .map(
          (p) => \`
        <tr>
          <td><span class="badge badge--email">\${p.shop}</span></td>
          <td>
            <strong>\${p.product_title}</strong><br/>
            <small style="color:var(--brand-muted)">Varyant: \${p.variant_title} (#\${p.variant_id})</small>
          </td>
          <td>\${formatTry(p.price_cents)}</td>
          <td><span class="badge badge--pending">\${p.waiting_count} bekliyor</span></td>
          <td>\${p.notified_count}</td>
          <td><span class="badge badge--converted">\${p.converted_count} sipariş</span></td>
          <td>
            <button class="btn btn--sm" onclick="notifyVariantAll('\${p.variant_id}', '\${p.shop}')" \${p.waiting_count === 0 ? 'disabled' : ''}>
              🔔 Stok Geldi: Tümüne Bildir (\${p.waiting_count})
            </button>
          </td>
        </tr>
      \`
        )
        .join('');
    }

    async function loadSubscribers() {
      const search = document.getElementById('filter-search').value;
      const status = document.getElementById('filter-status').value;
      const channel = document.getElementById('filter-channel').value;
      const params = new URLSearchParams({ shop: activeShop, search, status, channel });
      const res = await fetch('/api/admin/subscriptions?' + params.toString());
      const data = await res.json();
      const tbody = document.getElementById('subscribers-tbody');

      if (!data.subscriptions.length) {
        tbody.innerHTML = '<tr><td colspan="7">Kriterlere uygun abone bulunamadı.</td></tr>';
        return;
      }

      tbody.innerHTML = data.subscriptions
        .map((sub) => {
          const chBadges = (sub.channels || [])
            .map((c) => {
              if (c === 'email') return '<span class="badge badge--email">📧 E-posta</span>';
              if (c === 'whatsapp') return '<span class="badge badge--whatsapp">💬 WhatsApp</span>';
              if (c === 'sms') return '<span class="badge badge--sms">📱 SMS</span>';
              return '';
            })
            .join(' ');

          const statusMap = {
            pending: '<span class="badge badge--pending">Bekliyor</span>',
            notified: '<span class="badge badge--notified">Bildirildi</span>',
            converted: '<span class="badge badge--converted">Satın Aldı ✓</span>'
          };

          const waBtn = sub.whatsapp_direct_url
            ? \`<a class="btn btn--whatsapp btn--sm" href="\${sub.whatsapp_direct_url}" target="_blank" rel="noopener">💬 WA Gönder</a>\`
            : '';

          return \`
            <tr>
              <td><small>\${sub.shop}</small></td>
              <td><strong>\${sub.customer_name || 'Müşteri'}</strong></td>
              <td>
                \${sub.customer_email ? \`<div>\${sub.customer_email}</div>\` : ''}
                \${sub.customer_phone ? \`<div style="color:var(--brand-muted);font-size:12px;">\${sub.customer_phone}</div>\` : ''}
              </td>
              <td>
                <strong>\${sub.product_title}</strong><br/>
                <small style="color:var(--brand-muted)">\${sub.variant_title} (#\${sub.variant_id})</small>
              </td>
              <td>\${chBadges}</td>
              <td>\${statusMap[sub.status] || sub.status}</td>
              <td style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn btn--sm" onclick="notifySingle(\${sub.id})">🔔 Şimdi Bildir</button>
                \${waBtn}
                <button class="btn btn--danger btn--sm" onclick="deleteSub(\${sub.id})">Sil</button>
              </td>
            </tr>
          \`;
        })
        .join('');
    }

    async function loadPreorders() {
      const res = await fetch('/api/admin/preorders?shop=' + encodeURIComponent(activeShop));
      const data = await res.json();
      const tbody = document.getElementById('preorders-tbody');
      if (!data.preorders.length) {
        tbody.innerHTML = '<tr><td colspan="7">Bu mağaza için ön sipariş kuralı tanımlanmadı.</td></tr>';
        return;
      }
      tbody.innerHTML = data.preorders
        .map(
          (p) => \`
        <tr>
          <td><small>\${p.shop}</small></td>
          <td><strong>\${p.product_title}</strong><br/><small>\${p.variant_title}</small></td>
          <td><code>\${p.variant_id}</code></td>
          <td>
            <span class="badge badge--email">\${p.button_text}</span>
            <small style="display:block;color:var(--brand-muted)">\${p.badge_text}</small>
          </td>
          <td>\${p.estimated_shipping_date || 'Belirtilmedi'}</td>
          <td>\${p.reserved_count} / \${p.max_quantity > 0 ? p.max_quantity : '∞'}</td>
          <td>
            <button class="btn btn--danger btn--sm" onclick="deletePreorder('\${p.variant_id}', '\${p.shop}')">Kaldır</button>
          </td>
        </tr>
      \`
        )
        .join('');
    }

    async function loadSettingsAndStudio() {
      const targetShop = activeShop === 'all' ? 'organikkal.myshopify.com' : activeShop;
      const res = await fetch('/api/admin/settings?shop=' + encodeURIComponent(targetShop));
      const data = await res.json();
      const settings = data.settings || {};
      const form = document.getElementById('settings-form');
      Object.entries(settings).forEach(([k, v]) => {
        const field = form.elements.namedItem(k);
        if (field && typeof v !== 'object') field.value = String(v ?? '');
      });

      const studioForm = document.getElementById('studio-form');
      studioForm.elements.namedItem('brand_name').value = settings.brand_name || '';
      studioForm.elements.namedItem('storefront_url').value = settings.storefront_url || '';
      const wt = settings.widget_theme || {};
      ['primary_color', 'background_color', 'accent_color', 'notify_button_text', 'preorder_button_text', 'modal_eyebrow', 'modal_title'].forEach((k) => {
        const field = studioForm.elements.namedItem(k);
        if (field) field.value = wt[k] || '';
      });

      document.getElementById('SdkEmbedCode').textContent =
        \`<script src="\${window.location.origin}/widget/notify-sdk.js?shop=\${targetShop}" defer></script>\`;
    }

    async function loadLogs() {
      const res = await fetch('/api/admin/logs?shop=' + encodeURIComponent(activeShop));
      const data = await res.json();
      const tbody = document.getElementById('logs-tbody');
      if (!data.logs.length) {
        tbody.innerHTML = '<tr><td colspan="7">Henüz gönderim kaydı yok.</td></tr>';
        return;
      }
      tbody.innerHTML = data.logs
        .map(
          (l) => \`
        <tr>
          <td><small>\${l.created_at}</small></td>
          <td><small>\${l.shop}</small></td>
          <td><strong>\${l.customer_name || '-'}</strong><br/><small>\${l.product_title || ''} (\${l.variant_title || ''})</small></td>
          <td><span class="badge badge--\${l.channel}">\${l.channel.toUpperCase()}</span></td>
          <td>\${l.recipient}</td>
          <td>\${l.provider} · <strong>\${l.status}</strong></td>
          <td><small style="color:var(--brand-muted)">\${(l.payload_preview || l.error_message || '').slice(0, 100)}</small></td>
        </tr>
      \`
        )
        .join('');
    }

    window.notifySingle = async (id) => {
      const res = await fetch(\`/api/admin/subscriptions/\${id}/notify\`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        showToast('Bildirim başarıyla tetiklendi!');
        refreshAll();
      }
    };

    window.notifyVariantAll = async (variantId, shop) => {
      const res = await fetch('/api/admin/notify-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId, shop: shop || activeShop })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(\`\${data.notified_count} müşteriye stok bildirimi gönderildi!\`);
        refreshAll();
      }
    };

    window.deleteSub = async (id) => {
      await fetch(\`/api/admin/subscriptions/\${id}\`, { method: 'DELETE' });
      showToast('Kayıt silindi.');
      refreshAll();
    };

    window.deletePreorder = async (variantId, shop) => {
      await fetch(\`/api/admin/preorders/\${encodeURIComponent(variantId)}?shop=\${encodeURIComponent(shop || activeShop)}\`, { method: 'DELETE' });
      showToast('Ön sipariş kuralı kaldırıldı.');
      refreshAll();
    };

    document.getElementById('BtnRefreshSubscribers').addEventListener('click', loadSubscribers);
    document.getElementById('filter-search').addEventListener('input', loadSubscribers);
    document.getElementById('filter-status').addEventListener('change', loadSubscribers);
    document.getElementById('filter-channel').addEventListener('change', loadSubscribers);

    document.getElementById('preorder-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      body.shop = activeShop === 'all' ? 'organikkal.myshopify.com' : activeShop;
      const res = await fetch('/api/admin/preorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if ((await res.json()).ok) {
        showToast('Ön sipariş kuralı kaydedildi!');
        e.target.reset();
        refreshAll();
      }
    });

    document.getElementById('studio-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const targetShop = activeShop === 'all' ? 'organikkal.myshopify.com' : activeShop;
      const body = {
        shop: targetShop,
        brand_name: fd.get('brand_name'),
        storefront_url: fd.get('storefront_url'),
        widget_theme: {
          primary_color: fd.get('primary_color'),
          background_color: fd.get('background_color'),
          accent_color: fd.get('accent_color'),
          notify_button_text: fd.get('notify_button_text'),
          preorder_button_text: fd.get('preorder_button_text'),
          modal_eyebrow: fd.get('modal_eyebrow'),
          modal_title: fd.get('modal_title')
        }
      };
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if ((await res.json()).ok) {
        showToast('Marka ve widget tasarımı güncellendi!');
        loadTenants();
      }
    });

    document.getElementById('settings-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      body.shop = activeShop === 'all' ? 'organikkal.myshopify.com' : activeShop;
      body.email_enabled = Number(body.email_enabled);
      body.whatsapp_enabled = Number(body.whatsapp_enabled);
      body.sms_enabled = Number(body.sms_enabled);
      body.auto_notify_on_restock = Number(body.auto_notify_on_restock);
      body.min_stock_threshold = Number(body.min_stock_threshold || 1);

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if ((await res.json()).ok) {
        showToast('Kanal ayarları kaydedildi!');
      }
    });

    // Add Tenant Modal
    const tenantModal = document.getElementById('ModalAddTenant');
    document.getElementById('BtnOpenAddTenant').addEventListener('click', () => tenantModal.showModal());
    document.getElementById('BtnCloseAddTenant').addEventListener('click', () => tenantModal.close());
    document.getElementById('add-tenant-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: fd.get('shop'),
          brand_name: fd.get('brand_name'),
          storefront_url: fd.get('storefront_url'),
          widget_theme: { primary_color: fd.get('primary_color') }
        })
      });
      const data = await res.json();
      if (data.ok) {
        activeShop = data.tenant.shop;
        tenantModal.close();
        e.target.reset();
        await loadTenants();
        refreshAll();
        loadSettingsAndStudio();
        showToast(\`\${data.tenant.brand_name} mağazası eklendi!\`);
      }
    });

    // Add Subscriber Modal
    const addModal = document.getElementById('ModalAddSubscriber');
    document.getElementById('BtnOpenAddSubscriber').addEventListener('click', () => addModal.showModal());
    document.getElementById('BtnCloseAddSubscriber').addEventListener('click', () => addModal.close());
    document.getElementById('add-subscriber-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const channels = [];
      if (fd.get('ch_email')) channels.push('email');
      if (fd.get('ch_whatsapp')) channels.push('whatsapp');
      if (fd.get('ch_sms')) channels.push('sms');
      const payload = {
        shop: activeShop === 'all' ? 'organikkal.myshopify.com' : activeShop,
        customer_name: fd.get('customer_name'),
        customer_email: fd.get('customer_email'),
        customer_phone: fd.get('customer_phone'),
        product_title: fd.get('product_title'),
        variant_title: fd.get('variant_title'),
        product_handle: fd.get('product_handle'),
        product_id: fd.get('product_id'),
        variant_id: fd.get('variant_id'),
        price_cents: Math.round(Number(fd.get('price_tl') || 0) * 100),
        channels
      };
      const res = await fetch('/apps/ok-notify/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        addModal.close();
        showToast('Abone başarıyla eklendi!');
        refreshAll();
      } else {
        showToast(data.error || 'Hata oluştu');
      }
    });

    // Import CSV Modal
    const importModal = document.getElementById('ModalImportCsv');
    document.getElementById('BtnOpenImportCsv').addEventListener('click', () => importModal.showModal());
    document.getElementById('BtnCloseImportCsv').addEventListener('click', () => importModal.close());
    document.getElementById('ImportCsvFile').addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      document.getElementById('ImportCsvText').value = await file.text();
    });
    document.getElementById('import-csv-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const csv = document.getElementById('ImportCsvText').value;
      const res = await fetch('/api/admin/subscriptions/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: activeShop === 'all' ? 'organikkal.myshopify.com' : activeShop,
          csv
        })
      });
      const data = await res.json();
      if (data.ok) {
        importModal.close();
        showToast(\`\${data.imported_count} abone başarıyla içe aktarıldı!\`);
        refreshAll();
      } else {
        showToast(data.error || 'CSV içe aktarılamadı');
      }
    });

    function refreshAll() {
      loadDashboard();
      loadSubscribers();
      loadPreorders();
      loadLogs();
    }

    loadTenants().then(() => {
      refreshAll();
      loadSettingsAndStudio();
    });
  </script>
</body>
</html>`;
}

module.exports = { renderAdminHtml };
