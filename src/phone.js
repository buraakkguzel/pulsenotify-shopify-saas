'use strict';

/**
 * Türkiye ve uluslararası telefon numaralarını E.164 (+905xxxxxxxxx) formatına dönüştürür.
 * Desteklenen örnek girdiler:
 *  - "0532 123 45 67" -> "+905321234567"
 *  - "5321234567"     -> "+905321234567"
 *  - "+90 532 123 4567" -> "+905321234567"
 *  - "905321234567"   -> "+905321234567"
 */
function normalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  const digits = rawPhone.replace(/[^\d+]/g, '');
  if (!digits) return '';

  const onlyNumbers = digits.replace(/\D/g, '');
  if (!onlyNumbers) return '';

  // Türkiye mobil numaraları (5xx xxx xx xx)
  if (onlyNumbers.length === 10 && onlyNumbers.startsWith('5')) {
    return `+90${onlyNumbers}`;
  }
  if (onlyNumbers.length === 11 && onlyNumbers.startsWith('05')) {
    return `+90${onlyNumbers.slice(1)}`;
  }
  if (onlyNumbers.length === 12 && onlyNumbers.startsWith('905')) {
    return `+${onlyNumbers}`;
  }
  if (onlyNumbers.length === 13 && onlyNumbers.startsWith('00905')) {
    return `+${onlyNumbers.slice(2)}`;
  }

  // Diğer uluslararası numaralar (10-15 hane)
  if (onlyNumbers.length >= 10 && onlyNumbers.length <= 15) {
    return `+${onlyNumbers}`;
  }

  return '';
}

function isValidPhone(rawPhone) {
  const normalized = normalizePhone(rawPhone);
  return /^\+\d{10,15}$/.test(normalized);
}

/**
 * NetGSM ve WhatsApp Cloud API için '+' işareti olmadan ülke kodlu numara döndürür (örn. 905321234567)
 */
function toDigitsOnlyPhone(rawPhone) {
  const normalized = normalizePhone(rawPhone);
  return normalized ? normalized.replace(/^\+/, '') : '';
}

/**
 * WhatsApp Web / Uygulama tek-tıkla mesaj gönderme bağlantısı üretir
 */
function buildWhatsAppDirectUrl(rawPhone, messageText) {
  const digits = toDigitsOnlyPhone(rawPhone);
  if (!digits) return '';
  const textParam = messageText ? `?text=${encodeURIComponent(messageText)}` : '';
  return `https://wa.me/${digits}${textParam}`;
}

/**
 * Kullanıcı arayüzünde okunaklı gösterim (örn. +90 532 123 45 67)
 */
function formatPhoneDisplay(rawPhone) {
  const normalized = normalizePhone(rawPhone);
  if (!normalized) return rawPhone || '';
  if (normalized.startsWith('+90') && normalized.length === 13) {
    const p = normalized.slice(3);
    return `+90 ${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 8)} ${p.slice(8, 10)}`;
  }
  return normalized;
}

module.exports = {
  normalizePhone,
  isValidPhone,
  toDigitsOnlyPhone,
  buildWhatsAppDirectUrl,
  formatPhoneDisplay
};
