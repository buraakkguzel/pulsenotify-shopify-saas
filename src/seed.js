'use strict';

const { createDatabase } = require('./db');

function seedSampleData(store = createDatabase()) {
  // 1. Marka: Organik Kal
  store.ensureTenant('organikkal.myshopify.com', {
    brand_name: 'Organik Kal',
    storefront_url: 'https://organikkal.com'
  });

  store.addSubscription({
    shop: 'organikkal.myshopify.com',
    product_id: '8901001',
    product_title: 'Organik Gezen Tavuk Yumurtası',
    product_handle: 'organik-yumurta',
    variant_id: '4901001',
    variant_title: '30 Adet (L Boy)',
    inventory_item_id: '7901001',
    price_cents: 34500,
    customer_name: 'Ayşe Yılmaz',
    customer_email: 'ayse.yilmaz@example.com',
    customer_phone: '0532 111 22 33',
    channels: ['email', 'whatsapp']
  });

  store.addSubscription({
    shop: 'organikkal.myshopify.com',
    product_id: '8901002',
    product_title: 'Sahiden Organik Çiçek Balı',
    product_handle: 'organik-cicek-bali',
    variant_id: '4901002',
    variant_title: '850g Cam Kavanoz',
    inventory_item_id: '7901002',
    price_cents: 69000,
    customer_name: 'Mehmet Kaya',
    customer_email: 'mehmet.kaya@example.com',
    customer_phone: '0544 222 33 44',
    channels: ['email', 'whatsapp', 'sms']
  });

  store.upsertPreorderConfig({
    shop: 'organikkal.myshopify.com',
    product_id: '8901003',
    variant_id: '4901003',
    product_title: 'Yeni Hasat Organik Ceviz İçi',
    product_handle: 'organik-ceviz-ici',
    variant_title: '500g',
    enabled: 1,
    button_text: 'Ön Sipariş Ver',
    badge_text: 'Yeni Hasat · Ön Sipariş',
    shipping_note: 'Yeni hasat partisinden öncelikli olarak kargoya teslim edilir.',
    estimated_shipping_date: '25 Kasım',
    max_quantity: 100
  });

  // 2. Marka: Lumi Cosmetics (Örnek 2. Müşteri Markası)
  store.ensureTenant('lumi-cosmetics.myshopify.com', {
    brand_name: 'Lumi Cosmetics',
    storefront_url: 'https://lumicosmetics.com',
    widget_theme: {
      primary_color: '#1e293b',
      background_color: '#ffffff',
      accent_color: '#e11d48',
      notify_button_text: 'Stoğa Gelince Haber Ver'
    }
  });

  store.addSubscription({
    shop: 'lumi-cosmetics.myshopify.com',
    product_id: '5501001',
    product_title: 'Hyaluronic Acid Glow Serum',
    product_handle: 'hyaluronic-glow-serum',
    variant_id: '6601001',
    variant_title: '50 ml',
    inventory_item_id: '7701001',
    price_cents: 125000,
    customer_name: 'Selin Demir',
    customer_email: 'selin@example.com',
    customer_phone: '0533 444 55 66',
    channels: ['email', 'whatsapp']
  });

  return store;
}

if (require.main === module) {
  seedSampleData();
  console.log('⚡ Çoklu marka (Organik Kal + Lumi Cosmetics) örnek verileri eklendi.');
}

module.exports = { seedSampleData };
