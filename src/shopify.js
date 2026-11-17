'use strict';

const crypto = require('node:crypto');
const { dispatchSubscriptionNotifications } = require('./notifier');

function verifyShopifyWebhookHmac(rawBody, hmacHeader, secret) {
  if (!secret) return true;
  if (!hmacHeader || !rawBody) return false;

  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8'))
    .digest('base64');

  const a = Buffer.from(generatedHash, 'utf8');
  const b = Buffer.from(String(hmacHeader), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifyAppProxySignature(queryObject, secret) {
  if (!secret) return true;
  const { signature, ...rest } = queryObject || {};
  if (!signature) return false;

  const sortedParams = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${Array.isArray(rest[key]) ? rest[key].join(',') : rest[key]}`)
    .join('');

  const calculated = crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex');

  const a = Buffer.from(calculated, 'utf8');
  const b = Buffer.from(String(signature), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function handleInventoryLevelUpdate(payload, store, fetchImpl = globalThis.fetch, shop = null) {
  const settings = store.getSettings(shop || payload?.shop);
  if (!settings.auto_notify_on_restock) {
    return { triggered: false, reason: 'auto_notify_disabled', notified_count: 0 };
  }

  const available = Number(payload?.available ?? 0);
  const threshold = Math.max(1, Number(settings.min_stock_threshold || 1));
  if (available < threshold) {
    return { triggered: false, reason: 'below_threshold', available, threshold, notified_count: 0 };
  }

  const inventoryItemId = payload?.inventory_item_id ? String(payload.inventory_item_id) : '';
  const variantId = payload?.variant_id ? String(payload.variant_id) : '';
  const pendingList = store.findPendingForRestock({
    shop: shop || payload?.shop || null,
    variantId,
    inventoryItemId
  });

  const dispatches = [];
  for (const sub of pendingList) {
    const res = await dispatchSubscriptionNotifications(sub, store, fetchImpl);
    dispatches.push(res);
  }

  return {
    triggered: true,
    notified_count: dispatches.length,
    dispatches
  };
}

async function handleProductUpdate(payload, store, fetchImpl = globalThis.fetch, shop = null) {
  const settings = store.getSettings(shop || payload?.shop);
  if (!settings.auto_notify_on_restock) {
    return { triggered: false, reason: 'auto_notify_disabled', notified_count: 0 };
  }

  const threshold = Math.max(1, Number(settings.min_stock_threshold || 1));
  const variants = Array.isArray(payload?.variants) ? payload.variants : [];
  const dispatches = [];

  for (const variant of variants) {
    const qty = Number(variant.inventory_quantity ?? 0);
    const isAvailable = qty >= threshold || variant.inventory_policy === 'continue';
    if (!isAvailable || qty < threshold) continue;

    const pendingList = store.findPendingForRestock({
      shop: shop || payload?.shop || null,
      variantId: String(variant.id || ''),
      inventoryItemId: variant.inventory_item_id ? String(variant.inventory_item_id) : ''
    });

    for (const sub of pendingList) {
      const res = await dispatchSubscriptionNotifications(sub, store, fetchImpl);
      dispatches.push(res);
    }
  }

  return {
    triggered: true,
    notified_count: dispatches.length,
    dispatches
  };
}

function handleOrderCreate(payload, store, shop = null) {
  const orderId = String(payload?.id || payload?.order_number || '');
  const customerEmail = payload?.email || payload?.customer?.email || '';
  const customerPhone =
    payload?.phone ||
    payload?.customer?.phone ||
    payload?.shipping_address?.phone ||
    payload?.billing_address?.phone ||
    '';

  const lineItems = Array.isArray(payload?.line_items) ? payload.line_items : [];
  const conversions = [];
  const preordersRecorded = [];
  const resolvedShop = shop || payload?.shop || null;

  for (const item of lineItems) {
    const variantId = String(item.variant_id || '');
    if (!variantId) continue;

    const quantity = Math.max(1, Number(item.quantity || 1));
    const unitPriceCents = Math.round(parseFloat(item.price || '0') * 100);
    const lineRevenueCents = unitPriceCents * quantity;

    const converted = store.markSubscriptionConverted({
      shop: resolvedShop,
      variantId,
      customerEmail,
      customerPhone,
      orderId,
      revenueCents: lineRevenueCents
    });
    if (converted) {
      conversions.push(converted);
    }

    const props = Array.isArray(item.properties) ? item.properties : [];
    const hasPreorderProp = props.some(
      (p) =>
        (p.name === 'Sipariş Türü' && String(p.value).toLowerCase().includes('ön sipariş')) ||
        p.name === '_ok_preorder' ||
        p.name === '_pulsenotify_preorder'
    );
    const preorderRule = store.getPreorderByVariant(variantId, resolvedShop);

    if (hasPreorderProp || (preorderRule && preorderRule.enabled)) {
      const updatedRule = store.incrementPreorderReserved(variantId, quantity, resolvedShop);
      if (updatedRule) preordersRecorded.push(updatedRule);
    }
  }

  return {
    order_id: orderId,
    conversions_count: conversions.length,
    conversions,
    preorders_count: preordersRecorded.length,
    preorders: preordersRecorded
  };
}

module.exports = {
  verifyShopifyWebhookHmac,
  verifyAppProxySignature,
  handleInventoryLevelUpdate,
  handleProductUpdate,
  handleOrderCreate
};
