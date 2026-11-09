/**
 * Utilidades de formateo
 */

export function formatWhatsAppUrl(phoneNumber, customMessage) {
  const cleanPhone = String(phoneNumber).replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
  const defaultMsg = 'Hola Goberna, deseo más información sobre el Foro de Alcaldes y Gobernadores 2026.';
  const msg = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${phoneWithCountry}?text=${msg}`;
}

export function formatDateString(date) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Lima'
  }).format(date);
}

