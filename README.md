# PulseNotify ⚡ — Multi-Brand Shopify Back in Stock & Preorder SaaS

**PulseNotify**, birden fazla Shopify mağazasının/markasının (**Organik Kal** dahil) bağımsız olarak kullanabildiği çok kiracılı (multi-tenant) bir **Back in Stock (Stok Gelince Haber Ver)** ve **Preorder (Ön Sipariş)** SaaS platformudur.

---

## Mimari ve Çoklu Marka (Multi-Tenant) Özellikleri

1. **Çoklu Mağaza / Marka İzolasyonu (`tenants` tablosu)**
   - Her Shopify mağazası (`shop` domaini, örn. `organikkal.myshopify.com`, `lumi-cosmetics.myshopify.com`) kendi izole veritabanı kayıtlarına, abone listesine, ön sipariş kurallarına ve ciro raporlarına sahiptir.
   - Üst bardaki **Aktif Marka Seçici (Tenant Switcher)** ile markalar arasında geçiş yapılabilir veya **"+ Yeni Marka Ekle"** butonuyla saniyeler içinde yeni bir Shopify mağazası sisteme dahil edilebilir.

2. **🎨 Marka Kimliği & Vitrin Widget Stüdyosu (`/api/storefront/config`)**
   - Her marka kendi **Ana Rengini**, **Arka Plan Rengini**, **Vurgu Rengini**, **Buton Metinlerini** ve **Modal Başlıklarını** yönetim panelinden özelleştirir.
   - Gönderilen HTML stok bildirim e-postaları ve vitrin widget'ı otomatik olarak o markanın renklerine ve adına (`{{brand_name}}`) bürünür.

3. **🔌 Evrensel Vitrin Widget SDK'sı (`/widget/notify-sdk.js`)**
   - Herhangi bir Shopify temasına (Dawn, Horizon, Prestige, Impulse, Organik Kal vb.) tek satırlık script veya Theme App Extension ile entegre olur:
     ```html
     <script src="https://SUNUCU-ADRESINIZ/widget/notify-sdk.js?shop={{ shop.permanent_domain }}" defer></script>
     ```

4. **Çok Kanallı Bildirim Motoru (E-posta + WhatsApp + SMS)**
   - Her marka kendi **Resend / Brevo** e-posta anahtarını, **Meta WhatsApp Cloud API / Twilio** hesabını ve **NetGSM / Twilio SMS** başlığını bağımsız olarak tanımlayabilir.

---

## Hızlı Başlangıç

```bash
cd "shopify-notify-app"
npm run seed   # Organik Kal + Lumi Cosmetics (2 farklı marka) örnek verilerini yükler
npm start      # http://localhost:3456 adresinde SaaS Yönetim Panelini başlatır
npm test       # Çoklu marka izolasyonu ve webhook testlerini çalıştırır
```
