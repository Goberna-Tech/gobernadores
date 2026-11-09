/**
 * Preloader Minimalista GPU-Accelerated
 * Cumple directiva 05_FRONTEND_DISENO_Y_UI_UX.md:
 * - Buffer de estabilización (~800ms)
 * - Fail-safe de seguridad a los 3.0s
 */

export function initPreloader() {
  const preloader = document.getElementById('c3-preloader-overlay');
  if (!preloader) return;

  function dismiss() {
    if (preloader.classList.contains('fade-out')) return;
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.remove();
      window.dispatchEvent(new Event('resize'));
    }, 450);
  }

  // Desvanecimiento suave tras estabilizar DOM
  window.addEventListener('load', () => {
    setTimeout(dismiss, 800);
  });

  // Fail-safe a los 3 segundos
  setTimeout(dismiss, 3000);
}

