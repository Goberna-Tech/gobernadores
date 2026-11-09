/**
 * Integración Oficial con WhatsApp (+51 907772155)
 */

export const WHATSAPP_PHONE = '907772155';
export const WHATSAPP_COUNTRY = '51';

export function getWhatsAppUrl(customMessage) {
  const defaultMsg = 'Hola Goberna, deseo más información sobre el Foro de Alcaldes y Gobernadores 2026.';
  const message = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${WHATSAPP_COUNTRY}${WHATSAPP_PHONE}?text=${message}`;
}

export function initWhatsApp() {
  const defaultUrl = getWhatsAppUrl();

  // 1. Botón Flotante y Triggers de WhatsApp
  const floatingBtns = document.querySelectorAll(
    '#whatsapp-float-btn, #floating-whatsapp-link, .whatsapp-float, [data-wa-trigger="true"]'
  );
  floatingBtns.forEach((btn) => {
    btn.href = defaultUrl;
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
  });

  // 2. Botón WhatsApp en Header / Navbar y Mobile Drawer
  const headerBtn = document.getElementById('header-whatsapp-btn');
  if (headerBtn) {
    headerBtn.href = defaultUrl;
    headerBtn.setAttribute('target', '_blank');
    headerBtn.setAttribute('rel', 'noopener noreferrer');
  }

  const drawerBtn = document.querySelector('.btn-whatsapp-drawer');
  if (drawerBtn) {
    drawerBtn.href = defaultUrl;
    drawerBtn.setAttribute('target', '_blank');
    drawerBtn.setAttribute('rel', 'noopener noreferrer');
  }

  // 3. Botones contextuales en el cuerpo (ej. consultar por ponente o ruta)
  document.querySelectorAll('[data-whatsapp-query]').forEach((el) => {
    const query = el.getAttribute('data-whatsapp-query');
    el.href = getWhatsAppUrl(`Hola Goberna, deseo consultar sobre: ${query}`);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  console.log(`[WhatsApp] Inicializado con el número oficial: +${WHATSAPP_COUNTRY} ${WHATSAPP_PHONE}`);
}
