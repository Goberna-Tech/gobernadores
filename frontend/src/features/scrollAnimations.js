/**
 * Motor de Animaciones, Coreografía de Scroll y Micro-interacciones (120 FPS)
 * Basado en los repositorios de E:\GUIA\REPOSITORIOS:
 * - skills-main (Emil Kowalski: animate, choreograph, apple-design, animation-performance)
 * - motion (WAAPI & Hardware-Accelerated Composite Animations)
 * - scroll-world-main (Scroll Progress & Scrubbing Engine)
 * - animate.css-main & design-taste-frontend (motion layer)
 */

const EASE_OUT_STRONG = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Inyectar Barra de Progreso Superior (estilo scroll-world) si no existe
  let progressWrap = document.getElementById('gob-scroll-progress');
  if (!progressWrap) {
    progressWrap = document.createElement('div');
    progressWrap.id = 'gob-scroll-progress';
    progressWrap.className = 'gob-scroll-progress';
    progressWrap.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('span');
    bar.className = 'gob-scroll-progress__bar';
    progressWrap.appendChild(bar);
    document.body.prepend(progressWrap);
  }
  const progressBar = progressWrap.querySelector('.gob-scroll-progress__bar');

  // 2. Configurar coreografía automática por sección (Roles: Lead, Support, Stagger, Bar)
  const choreoGroups = [
    {
      container: '.publico-section',
      items: [
        { selector: '.xd-section-tag', effect: 'fade-right', delay: 0 },
        { selector: '.publico-heading', effect: 'lead-up', delay: 70 },
        { selector: '.publico-item', effect: 'card-up', stagger: [140, 230, 310] }
      ]
    },
    {
      container: '.presentacion-section',
      items: [
        { selector: '.xd-section-tag', effect: 'fade-right', delay: 0 },
        { selector: '.xd-heading-light', effect: 'lead-up', delay: 60 },
        { selector: '.xd-title-bar', effect: 'bar-grow', delay: 130 },
        { selector: '.presentacion-sub', effect: 'support-up', delay: 160 },
        { selector: '.presentacion-pill', effect: 'pill-pop', stagger: [210, 280, 340] },
        { selector: '.presentacion-divider', effect: 'divider-grow', delay: 180 },
        { selector: '.presentacion-right', effect: 'fade-left', delay: 220 }
      ]
    },
    {
      container: '.beneficios-section',
      items: [
        { selector: '.xd-section-tag', effect: 'fade-right', delay: 0 },
        { selector: '.xd-heading-light', effect: 'lead-up', delay: 60 },
        { selector: '.xd-title-bar', effect: 'bar-grow', delay: 130 },
        { selector: '.beneficios-sub', effect: 'support-up', delay: 170 },
        { selector: '.beneficios-timeline-line', effect: 'timeline-grow', delay: 140 },
        { selector: '.beneficio-row', effect: 'row-slide', stagger: [180, 360, 540, 720] }
      ]
    },
    {
      container: '.ponentes-section',
      items: [
        { selector: '.xd-section-tag', effect: 'fade-up', delay: 0 },
        { selector: '.ponentes-heading', effect: 'lead-up', delay: 70 },
        { selector: '.xd-title-bar', effect: 'bar-grow', delay: 140 },
        { selector: '.speakers-carousel-wrapper', effect: 'scale-up', delay: 200 }
      ]
    },
    {
      container: '.ejes-section',
      items: [
        { selector: '.xd-section-tag', effect: 'fade-right', delay: 0 },
        { selector: '.ejes-heading', effect: 'lead-up', delay: 60 },
        { selector: '.xd-title-bar', effect: 'bar-grow', delay: 130 },
        { selector: '.eje-accordion-card', effect: 'card-left', stagger: [120, 210, 290] }
      ]
    },
    {
      container: '.financiamiento-banner',
      items: [
        { selector: '.fin-banner-line:first-of-type', effect: 'support-up', delay: 0 },
        { selector: '.fin-banner-badge-wrap', effect: 'badge-skew-pop', delay: 90 },
        { selector: '.fin-banner-line:last-of-type', effect: 'support-up', delay: 170 }
      ]
    },
    {
      container: '.ruta-section',
      items: [
        { selector: '.xd-section-tag', effect: 'fade-right', delay: 0 },
        { selector: '.xd-heading-light', effect: 'lead-up', delay: 60 },
        { selector: '.xd-title-bar', effect: 'bar-grow', delay: 130 },
        { selector: '.ruta-intro-text', effect: 'support-up', delay: 170 },
        { selector: '.ruta-featured-card', effect: 'fade-left', delay: 320 },
        { selector: '.ruta-bottom-callout-card', effect: 'support-up', delay: 420 }
      ]
    },
    {
      container: '.venue-section',
      items: [
        { selector: '.venue-floating-card', effect: 'card-up', delay: 0 },
        { selector: '.venue-asterisk-icon', effect: 'asterisk-spin', delay: 120 },
        { selector: '.venue-detail-row', effect: 'row-slide', stagger: [180, 310, 440] }
      ]
    },
    {
      container: '.registro-section',
      items: [
        { selector: '.registro-card', effect: 'scale-up', delay: 0 },
        { selector: '.registro-field', effect: 'support-up', stagger: [80, 120, 160, 200, 240, 280, 310] },
        { selector: '.registro-outside-text', effect: 'support-up', delay: 260 }
      ]
    },
    {
      container: '.footer-xd',
      items: [
        { selector: '.footer-xd-brand', effect: 'fade-right', delay: 0 },
        { selector: '.footer-xd-nav a', effect: 'support-up', stagger: [60, 100, 140, 175, 205, 230] }
      ]
    }
  ];

  // 3. Animación de Entrada del Hero (choreographed wave)
  const hero = document.querySelector('.hero');
  if (hero && !prefersReducedMotion) {
    const heroTag = hero.querySelector('.hero-edition-row');
    const heroTitle = hero.querySelector('.hero-title');
    const heroBtns = hero.querySelectorAll('.hero-cta-row > *');

    const playHeroEntrance = () => {
      if (hero.dataset.heroAnimated === 'true') return;
      hero.dataset.heroAnimated = 'true';

      if (heroTag && heroTag.animate) {
        const a1 = heroTag.animate(
          [
            { opacity: 0, transform: 'translate3d(-18px, 0, 0)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0)' }
          ],
          { duration: 650, delay: 60, easing: EASE_OUT_STRONG }
        );
        a1.onfinish = () => a1.cancel();
      }
      if (heroTitle && heroTitle.animate) {
        const a2 = heroTitle.animate(
          [
            { opacity: 0, transform: 'translate3d(0, 26px, 0)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0)' }
          ],
          { duration: 750, delay: 130, easing: EASE_OUT_STRONG }
        );
        a2.onfinish = () => a2.cancel();
      }
      heroBtns.forEach((btn, idx) => {
        if (btn.animate) {
          const a3 = btn.animate(
            [
              { opacity: 0, transform: 'translate3d(0, 18px, 0)' },
              { opacity: 1, transform: 'translate3d(0, 0, 0)' }
            ],
            { duration: 600, delay: 240 + idx * 85, easing: EASE_OUT_STRONG }
          );
          a3.onfinish = () => a3.cancel();
        }
      });
    };

    // Ejecutar cuando el preloader termine o de inmediato si ya se cerró
    const preloader = document.getElementById('c3-preloader-overlay');
    if (preloader && !preloader.classList.contains('fade-out')) {
      setTimeout(playHeroEntrance, 750);
    } else {
      playHeroEntrance();
    }
  }

  // 4. Registrar elementos para Scroll Reveal Bidireccional Suave
  const revealTargets = [];

  choreoGroups.forEach((group) => {
    const section = document.querySelector(group.container);
    if (!section) return;

    group.items.forEach((itemDef) => {
      const nodes = section.querySelectorAll(itemDef.selector);
      nodes.forEach((node, idx) => {
        node.classList.add('gob-reveal');
        node.setAttribute('data-gob-effect', itemDef.effect);
        const delayMs = itemDef.stagger
          ? (itemDef.stagger[idx] !== undefined ? itemDef.stagger[idx] : itemDef.stagger[itemDef.stagger.length - 1])
          : (itemDef.delay || 0);
        node.style.setProperty('--gob-delay', `${delayMs}ms`);
        revealTargets.push(node);
      });
    });
  });

  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-inview'));
  } else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add('is-inview');
          } else {
            // Re-armar suavemente cuando sale por debajo del viewport para que al volver a bajar vuelva a animar
            const rect = entry.boundingClientRect;
            if (rect.top > window.innerHeight * 0.85) {
              el.classList.remove('is-inview');
            }
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px'
      }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-inview'));
  }

  // 5. Scroll Spy de Navegación + Parallax GPU de Marcas de Agua, Fondos Profundos y Word-Highlight
  const watermarks = document.querySelectorAll('.section-watermark');
  const venueBg = document.querySelector('.venue-map-bg');
  const registroBg = document.querySelector('.registro-bg-speaker');
  const finBanner = document.querySelector('.financiamiento-banner');
  const footerCapitol = document.querySelector('.footer-capitol-img');
  const highlightWords = initWordHighlightOnScroll(prefersReducedMotion);
  const navLinks = document.querySelectorAll('.nav-links .nav-link[href^="#"]');
  const trackedSections = Array.from(navLinks)
    .map((link) => {
      const id = link.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      return sec ? { id, sec, link } : null;
    })
    .filter(Boolean);

  let ticking = false;

  function onScrollFrame() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const progress = Math.min(1, Math.max(0, scrollY / docHeight));

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }

    // Parallax ligero en marcas de agua y fondos de sección (Composite-only transform)
    if (!prefersReducedMotion) {
      watermarks.forEach((wm, i) => {
        if (wm.classList.contains('watermark-ruta')) return;
        const parent = wm.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
          const centerOffset = (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5));
          const shiftY = centerOffset * (i % 2 === 0 ? 0.08 : -0.06);
          const baseTransform = wm.classList.contains('watermark-publico') || wm.classList.contains('watermark-ejes')
            ? `translate3d(0, calc(-50% + ${shiftY.toFixed(1)}px), 0)`
            : `translate3d(0, ${shiftY.toFixed(1)}px, 0)`;
          wm.style.transform = baseTransform;
        }
      });

      // Parallax de profundidad en Sede (T Tower)
      if (venueBg && venueBg.parentElement) {
        const r = venueBg.parentElement.getBoundingClientRect();
        if (r.bottom > -100 && r.top < window.innerHeight + 100) {
          const shift = (window.innerHeight * 0.5 - (r.top + r.height * 0.5)) * 0.055;
          venueBg.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.06)`;
        }
      }

      // Parallax de profundidad en Registro ( conservando su scaleX(-1) original )
      if (registroBg && registroBg.parentElement) {
        const r = registroBg.parentElement.getBoundingClientRect();
        if (r.bottom > -100 && r.top < window.innerHeight + 100) {
          const shift = (window.innerHeight * 0.5 - (r.top + r.height * 0.5)) * 0.05;
          registroBg.style.transform = `scaleX(-1) translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.05)`;
        }
      }

      // Emergencia Parallax de la Cúpula del Capitolio en el Footer (.footer-capitol-img)
      if (footerCapitol && footerCapitol.parentElement) {
        const r = footerCapitol.parentElement.getBoundingClientRect();
        if (r.top < window.innerHeight + 80) {
          const progressFooter = Math.min(1, Math.max(0, (window.innerHeight - r.top) / Math.max(r.height, 260)));
          const offsetY = (1 - progressFooter) * 26;
          footerCapitol.style.transform = `translate3d(0, ${offsetY.toFixed(1)}px, 0)`;
        }
      }

      // Iluminación progresiva de lectura palabra por palabra en Presentación
      if (highlightWords && highlightWords.container && highlightWords.spans.length) {
        const r = highlightWords.container.getBoundingClientRect();
        const startY = window.innerHeight * 0.82;
        const endY = window.innerHeight * 0.36;
        const rawProgress = (startY - r.top) / Math.max(startY - endY, 1);
        const clamped = Math.min(1, Math.max(0, rawProgress));
        const activeCount = Math.floor(clamped * highlightWords.spans.length);
        highlightWords.spans.forEach((sp, idx) => {
          sp.classList.toggle('is-lit', idx <= activeCount);
        });
      }
    }

    // Activar enlace de la sección actual en el Navbar
    const triggerLine = window.innerHeight * 0.36;
    let currentId = '';
    for (const item of trackedSections) {
      const r = item.sec.getBoundingClientRect();
      if (r.top <= triggerLine && r.bottom >= triggerLine * 0.5) {
        currentId = item.id;
      }
    }
    trackedSections.forEach((item) => {
      item.link.classList.toggle('is-active-section', item.id === currentId);
    });

    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScrollFrame);
      }
    },
    { passive: true }
  );

  onScrollFrame();
  initRutaPointByPoint(prefersReducedMotion);
  initFinanciamientoPlanetNodes(prefersReducedMotion);
  initSvgStrokeDraw(prefersReducedMotion);
  initFormFocusMicroInteractions();
  initSplitLineHeadings(prefersReducedMotion);
  initHeroAmbientSpotlight(prefersReducedMotion);
  initSmoothAnchorScroll(prefersReducedMotion);
}

/**
 * 12. Foco Ambiental Dinámico en el Hero (#inicio) y Registro (#registro) al mover el cursor
 *     Agrega profundidad 3D muy sutil siguiendo el puntero con interpolación en GPU sin tocar textos ni botones.
 */
function attachAmbientSpotlight(container, prefersReducedMotion) {
  if (!container || container.querySelector('.hero-ambient-spotlight')) return;

  const spot = document.createElement('div');
  spot.className = 'hero-ambient-spotlight';
  spot.setAttribute('aria-hidden', 'true');
  container.prepend(spot);

  container.addEventListener('pointermove', (e) => {
    const zoom = parseFloat(document.documentElement.style.zoom) || 1;
    const factor = 1 + (1 / zoom - 1) * 0.55;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) * factor;
    const y = (e.clientY - rect.top) * factor;
    spot.style.transform = `translate3d(${(x - 320).toFixed(1)}px, ${(y - 320).toFixed(1)}px, 0)`;
    spot.classList.add('is-active');
  });

  container.addEventListener('pointerleave', () => {
    spot.classList.remove('is-active');
  });
}

function initHeroAmbientSpotlight(prefersReducedMotion) {
  if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }
  attachAmbientSpotlight(document.getElementById('inicio'), prefersReducedMotion);
  attachAmbientSpotlight(document.getElementById('registro'), prefersReducedMotion);
}

/**
 * 13. Transición de Desplazamiento Cinemático en Enlaces de Navegación + Destello de Llegada en la Etiqueta de Sección
 */
function initSmoothAnchorScroll(prefersReducedMotion) {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navbar = document.getElementById('navbar');
      const navH = navbar ? navbar.offsetHeight || 74 : 74;
      const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - (href === '#inicio' ? 0 : navH - 6));

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      const sectionTag = target.querySelector('.xd-section-tag');
      if (sectionTag) {
        sectionTag.classList.remove('is-target-arrived');
        setTimeout(() => {
          sectionTag.classList.add('is-target-arrived');
          setTimeout(() => sectionTag.classList.remove('is-target-arrived'), 1600);
        }, 420);
      }
    });
  });
}

function whenPreloaderReady(cb) {
  const preloader = document.getElementById('c3-preloader-overlay');
  if (!preloader) {
    requestAnimationFrame(() => cb());
    return;
  }
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    obs.disconnect();
    // Esperar un frame después de que preloader.remove() haya disparado su evento 'resize'
    requestAnimationFrame(() => {
      setTimeout(cb, 60);
    });
  };
  const obs = new MutationObserver(() => {
    if (!document.getElementById('c3-preloader-overlay')) {
      finish();
    }
  });
  obs.observe(document.body, {
    childList: true,
    subtree: true
  });
  setTimeout(finish, 3600);
}

/**
 * 11. Movimiento vivo de los puntos y arcos orbitales en el Planeta del Banner
 *     "Conectando oportunidades de FINANCIAMIENTO Internacional con tu gestión"
 *     Usa las coordenadas exactas medidas al píxel sobre banner-financiamiento.webp (2172x724):
 *     - Punto 1: (1777, 200)
 *     - Punto 2: (2009, 256)
 *     - Punto 3: (1894, 350)
 *     - Punto 4: (1742, 452)
 *     y proyecta tanto los 4 puntos como las curvas orbitales del planeta con la misma fórmula
 *     matemática de `background: center / cover no-repeat`.
 */
function initFinanciamientoPlanetNodes(prefersReducedMotion) {
  const banner = document.querySelector('.financiamiento-banner');
  if (!banner || banner.querySelector('.fin-planet-svg')) return;

  const IMG_W = 2172;
  const IMG_H = 724;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'fin-planet-svg');
  svg.setAttribute('aria-hidden', 'true');

  // Coordenadas exactas medidas al píxel de los 4 círculos blancos del planeta en 2172x724
  const PLANET_DOTS = [
    { x: 1777, y: 200 }, // Punto 1: Norteamérica
    { x: 2009, y: 256 }, // Punto 2: Atlántico Norte / Cruce Principal
    { x: 1894, y: 350 }, // Punto 3: Sudamérica
    { x: 1742, y: 452 }  // Punto 4: Pacífico Sur
  ];

  // Extremos y puntos de control cuadráticos exactos medidos al píxel para los 8 tramos reales de las curvas predeterminadas del planeta en 2172x724
  const PLANET_GEOM = {
    // Órbita Superior (1 -> 2 -> 3: Extremo Izq -> Punto 1 -> Punto 2 -> Extremo Inf-Derecho)
    s1Start: { x: 1628, y: 355 },
    c01:     { x: 1678, y: 228 }, // Control Extremo Izq -> P1
    c12:     { x: 1902, y: 170 }, // Control P1 -> P2
    c2e1:    { x: 2064, y: 306 }, // Control P2 -> Extremo Inf-Derecho
    s1End:   { x: 2106, y: 394 },

    // Órbita Inferior (4 -> 5 -> 6 -> 7 -> 8: Extremo Inf-Izq -> Punto 4 -> Punto 3 + Pequeña línea inferior -> Punto 2 -> Extremo Derecho)
    s2Start:       { x: 1698, y: 542 },
    c04:           { x: 1715, y: 494 }, // Control Extremo Inf-Izq -> P4
    c43:           { x: 1807, y: 372 }, // Control P4 -> P3
    p3BottomStart: { x: 1873, y: 412 }, // Inicio de la pequeña línea debajo de P3
    cBottom3:      { x: 1881, y: 380 }, // Control Pequeña línea inferior -> P3
    c32:           { x: 1945, y: 290 }, // Control P3 -> P2
    c2e2:          { x: 2085, y: 221 }, // Control P2 -> Extremo Derecho
    s2End:         { x: 2170, y: 227 }
  };

  function projectCoverPoint(pt, boxW, boxH) {
    const scale = Math.max(boxW / IMG_W, boxH / IMG_H);
    const renderedW = IMG_W * scale;
    const renderedH = IMG_H * scale;
    const offsetX = (boxW - renderedW) * 0.5;
    const offsetY = (boxH - renderedH) * 0.5;
    return {
      x: +(offsetX + pt.x * scale).toFixed(1),
      y: +(offsetY + pt.y * scale).toFixed(1)
    };
  }

  // Construir el DOM del SVG UNA SOLA VEZ (jamás reasignar svg.innerHTML en 'resize',
  // porque eso destruye y recrea los <path>, haciendo que la primera línea se reinicie y duplique al cargar)
  svg.innerHTML = `
    <defs>
      <filter id="finNodeGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id="finHaloGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#A8C5FF" stop-opacity="0.95" />
        <stop offset="55%" stop-color="#5E82E2" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#235CE8" stop-opacity="0" />
      </radialGradient>
    </defs>

    <path class="fin-hop-beam fin-hop-1" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" filter="url(#finNodeGlow)" />
    <path class="fin-hop-beam fin-hop-2" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" filter="url(#finNodeGlow)" />
    <path class="fin-hop-beam fin-hop-3" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" filter="url(#finNodeGlow)" />
    <path class="fin-hop-beam fin-hop-4" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" filter="url(#finNodeGlow)" />
    <path class="fin-hop-beam fin-hop-5" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" filter="url(#finNodeGlow)" />
    <path class="fin-hop-beam fin-hop-6" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" filter="url(#finNodeGlow)" />
    <path class="fin-hop-beam fin-hop-7" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" filter="url(#finNodeGlow)" />
    <path class="fin-hop-beam fin-hop-8" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" filter="url(#finNodeGlow)" />

    <g class="fin-planet-node fin-planet-node-1">
      <circle class="fin-node-ring" r="16" fill="url(#finHaloGrad)" />
      <circle class="fin-node-wave" r="11" fill="none" stroke="#9CC0FF" stroke-width="1.5" />
      <circle class="fin-node-dot" r="4.2" fill="#FFFFFF" filter="url(#finNodeGlow)" />
    </g>
    <g class="fin-planet-node fin-planet-node-2">
      <circle class="fin-node-ring" r="18" fill="url(#finHaloGrad)" />
      <circle class="fin-node-wave" r="12" fill="none" stroke="#B4D0FF" stroke-width="1.7" />
      <circle class="fin-node-dot" r="4.8" fill="#FFFFFF" filter="url(#finNodeGlow)" />
    </g>
    <g class="fin-planet-node fin-planet-node-3">
      <circle class="fin-node-ring" r="16" fill="url(#finHaloGrad)" />
      <circle class="fin-node-wave" r="11" fill="none" stroke="#9CC0FF" stroke-width="1.5" />
      <circle class="fin-node-dot" r="4.2" fill="#FFFFFF" filter="url(#finNodeGlow)" />
    </g>
    <g class="fin-planet-node fin-planet-node-4">
      <circle class="fin-node-ring" r="16" fill="url(#finHaloGrad)" />
      <circle class="fin-node-wave" r="11" fill="none" stroke="#9CC0FF" stroke-width="1.5" />
      <circle class="fin-node-dot" r="4.2" fill="#FFFFFF" filter="url(#finNodeGlow)" />
    </g>
  `;

  const hopEls = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => svg.querySelector(`.fin-hop-${n}`));
  const nodeEls = [1, 2, 3, 4].map((n) => svg.querySelector(`.fin-planet-node-${n}`));
  let lastBoxW = 0;
  let lastBoxH = 0;

  function updatePlanetGeometry() {
    const rect = banner.getBoundingClientRect();
    const boxW = Math.round(Math.max(rect.width || banner.offsetWidth || 1920, 320));
    const boxH = Math.round(Math.max(rect.height || banner.offsetHeight || 520, 200));

    if (boxW === lastBoxW && boxH === lastBoxH) return;
    lastBoxW = boxW;
    lastBoxH = boxH;

    svg.setAttribute('viewBox', `0 0 ${boxW} ${boxH}`);

    const [p1, p2, p3, p4] = PLANET_DOTS.map((pt) => projectCoverPoint(pt, boxW, boxH));
    const g = {};
    Object.keys(PLANET_GEOM).forEach((k) => {
      g[k] = projectCoverPoint(PLANET_GEOM[k], boxW, boxH);
    });

    const segments = [
      `M ${g.s1Start.x} ${g.s1Start.y} Q ${g.c01.x} ${g.c01.y} ${p1.x} ${p1.y}`,
      `M ${p1.x} ${p1.y} Q ${g.c12.x} ${g.c12.y} ${p2.x} ${p2.y}`,
      `M ${p2.x} ${p2.y} Q ${g.c2e1.x} ${g.c2e1.y} ${g.s1End.x} ${g.s1End.y}`,
      `M ${g.s2Start.x} ${g.s2Start.y} Q ${g.c04.x} ${g.c04.y} ${p4.x} ${p4.y}`,
      `M ${p4.x} ${p4.y} Q ${g.c43.x} ${g.c43.y} ${p3.x} ${p3.y}`,
      `M ${g.p3BottomStart.x} ${g.p3BottomStart.y} Q ${g.cBottom3.x} ${g.cBottom3.y} ${p3.x} ${p3.y}`,
      `M ${p3.x} ${p3.y} Q ${g.c32.x} ${g.c32.y} ${p2.x} ${p2.y}`,
      `M ${p2.x} ${p2.y} Q ${g.c2e2.x} ${g.c2e2.y} ${g.s2End.x} ${g.s2End.y}`
    ];

    segments.forEach((dStr, idx) => {
      if (hopEls[idx]) hopEls[idx].setAttribute('d', dStr);
    });

    [p1, p2, p3, p4].forEach((pt, idx) => {
      if (nodeEls[idx]) nodeEls[idx].setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
    });
  }

  banner.prepend(svg);
  updatePlanetGeometry();
  window.addEventListener('resize', updatePlanetGeometry, { passive: true });

  // Iniciar la animación del planeta recién cuando el preloader se haya eliminado del DOM (y ya haya disparado su 'resize'),
  // para que al actualizar (F5) la línea #1 salga UNA SOLA VEZ limpia sin reiniciarse ni duplicarse
  whenPreloaderReady(() => {
    updatePlanetGeometry();
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      banner.classList.add('is-planet-active');
      return;
    }
    const planetObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            banner.classList.add('is-planet-active');
          } else {
            banner.classList.remove('is-planet-active');
          }
        });
      },
      { threshold: 0.15 }
    );
    planetObserver.observe(banner);
  });
}

/**
 * 8. Revelado Cinematográfico por Renglones (`Split-Line Mask Reveal`) en los Títulos h2
 *    Envuelve cada renglón separado por <br> en su propia máscara para que emerjan con 75ms de diferencia
 *    sin cambiar ni una fuente, color, degradado ni tamaño del diseño original.
 */
function initSplitLineHeadings(prefersReducedMotion) {
  if (prefersReducedMotion) return;

  const headings = document.querySelectorAll(
    '.publico-heading, .presentacion-section .xd-heading-light, .beneficios-section .xd-heading-light, .ponentes-heading, .ejes-heading, .ruta-section .xd-heading-light, .venue-card-title'
  );

  headings.forEach((h2) => {
    if (h2.dataset.splitLinesDone === 'true') return;
    const rawHtml = h2.innerHTML;
    if (!rawHtml.includes('<br')) return;

    const parts = rawHtml.split(/<br\s*\/?>/i);
    if (parts.length < 2) return;

    h2.dataset.splitLinesDone = 'true';
    h2.innerHTML = parts
      .map(
        (lineHtml, idx) =>
          `<span class="gob-line-mask"><span class="gob-line-inner" style="--line-delay: ${idx * 85}ms">${lineHtml.trim()}</span></span>`
      )
      .join('');
  });
}

/**
 * 9. Iluminación Progresiva de Lectura (`Scroll Word-Highlight`) en el Párrafo de Presentación
 *    Envuelve las palabras posteriores al título en negrita para que se iluminen suavemente al hacer scroll.
 */
function initWordHighlightOnScroll(prefersReducedMotion) {
  const leadP = document.querySelector('.presentacion-lead-paragraph');
  if (!leadP || prefersReducedMotion || leadP.dataset.wordLitDone === 'true') {
    return null;
  }

  leadP.dataset.wordLitDone = 'true';
  const spans = [];

  Array.from(leadP.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(token));
        } else {
          const sp = document.createElement('span');
          sp.className = 'gob-lit-word';
          sp.textContent = token;
          frag.appendChild(sp);
          spans.push(sp);
        }
      });
      node.replaceWith(frag);
    }
  });

  return { container: leadP, spans };
}

/**
 * 10. Física Magnética Sutil (`Micro-Magnetic Pull`) en botones circulares y flechas
 *     Al acercar el puntero en desktop, el botón acompaña suavemente al cursor 3-4px y regresa con resorte.
 */
function initMicroMagneticButtons(prefersReducedMotion) {
  if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }

  const magneticTargets = document.querySelectorAll(
    '.whatsapp-float, .eje-circle-btn'
  );

  magneticTargets.forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width * 0.5)) * 0.22;
      const dy = (e.clientY - (rect.top + rect.height * 0.5)) * 0.22;
      btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(1.06)`;
    });

    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });
}

/**
 * 6. Dibujo en vivo trazo por trazo (`stroke-dashoffset`) de los íconos SVG existentes
 *    en 01 • Público Objetivo y 06 • Sede (T Tower) cuando sus contenedores entran al viewport.
 */
function initSvgStrokeDraw(prefersReducedMotion) {
  if (prefersReducedMotion) return;

  const svgIcons = document.querySelectorAll('.publico-svg-icon, .venue-detail-icon svg');
  svgIcons.forEach((svg) => {
    const shapes = svg.querySelectorAll('path, line, polyline, polygon, rect, circle');
    shapes.forEach((shape, i) => {
      try {
        shape.setAttribute('pathLength', '100');
        shape.classList.add('gob-svg-stroke');
        shape.style.setProperty('--stroke-delay', `${120 + i * 95}ms`);
      } catch (e) {
        // Ignorar si no soporta pathLength
      }
    });
  });
}

/**
 * 7. Micro-interacciones reactivas en los campos del formulario de 07 • Registro
 *    Sin alterar el diseño: al hacer focus/input, el ícono existente cobra vida con un micro-salto elástico
 *    y marca confirmación visual en vivo cuando el campo tiene contenido válido.
 */
function initFormFocusMicroInteractions() {
  const fields = document.querySelectorAll('.registro-field');
  fields.forEach((field) => {
    const input = field.querySelector('.registro-input');
    if (!input) return;

    const syncFieldState = () => {
      const val = (input.value || '').trim();
      const hasVal = val.length > 0;
      field.classList.toggle('has-value', hasVal);
      let isValid = hasVal && val.length >= 2;
      if (input.type === 'email') {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      } else if (input.type === 'tel') {
        isValid = /^9\d{8}$/.test(val.replace(/\s+/g, ''));
      }
      field.classList.toggle('is-valid-live', isValid);
    };

    input.addEventListener('focus', () => {
      field.classList.add('is-focused');
    });

    input.addEventListener('blur', () => {
      field.classList.remove('is-focused');
      syncFieldState();
    });

    input.addEventListener('input', syncFieldState);
  });
}

/**
 * Coreografía Punto por Punto del Mapa Mundial en "Conectando oportunidades..."
 * Mantiene intactas las líneas azules predeterminadas de ruta-mapa-vector.webp (1672x941)
 * y desliza una única línea brillante por cada pasada exactamente encima de las curvas predeterminadas:
 *   Miami (212.7, 273.8) -> Ámsterdam (461.1, 194.6) -> Abu Dabi (627.4, 285.6) -> Corea del Sur (819.9, 239.2)
 */
function initRutaPointByPoint(prefersReducedMotion) {
  const mapCanvas = document.querySelector('.ruta-map-canvas');
  if (!mapCanvas) return;

  const pins = [
    mapCanvas.querySelector('.pin-miami'),
    mapCanvas.querySelector('.pin-amsterdam'),
    mapCanvas.querySelector('.pin-abudabi'),
    mapCanvas.querySelector('.pin-corea')
  ].filter(Boolean);

  // Asignar índice secuencial a cada tarjeta del mapa (0, 1, 2, 3)
  pins.forEach((pin, idx) => {
    pin.classList.add('ruta-seq-pin');
    pin.style.setProperty('--pin-seq-delay', `${260 + idx * 440}ms`);
  });

  let imgWrap = mapCanvas.querySelector('.ruta-map-img-wrap');
  const mapImg = mapCanvas.querySelector('.ruta-map-img');

  if (mapImg && !imgWrap) {
    imgWrap = document.createElement('div');
    imgWrap.className = 'ruta-map-img-wrap';
    mapImg.parentNode.insertBefore(imgWrap, mapImg);
    imgWrap.appendChild(mapImg);

    const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgOverlay.setAttribute('class', 'ruta-route-svg');
    svgOverlay.setAttribute('viewBox', '0 0 1000 562');
    svgOverlay.setAttribute('aria-hidden', 'true');
    svgOverlay.innerHTML = `
      <defs>
        <filter id="rutaGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="rutaBeamGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="glow1" />
          <feGaussianBlur stdDeviation="6" result="glow2" />
          <feMerge>
            <feMergeNode in="glow2" />
            <feMergeNode in="glow1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Líneas brillantes en reposo que se deslizan UNA SOLA VEZ por pasada (punto a punto, sin duplicarse)
           exactamente encima de las líneas azules predeterminadas del mapa:
           Tramo 1 (Miami -> Ámsterdam), Tramo 2 (Ámsterdam -> Abu Dabi), Tramo 3 (Abu Dabi -> Corea) -->
      <g class="ruta-idle-hops">
        <path class="ruta-hop-beam ruta-hop-1" pathLength="100"
          d="M 212.7 273.8 Q 312 162 461.1 194.6"
          fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" filter="url(#rutaBeamGlow)" />
        <path class="ruta-hop-beam ruta-hop-2" pathLength="100"
          d="M 461.1 194.6 Q 558 194 627.4 285.6"
          fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" filter="url(#rutaBeamGlow)" />
        <path class="ruta-hop-beam ruta-hop-3" pathLength="100"
          d="M 627.4 285.6 Q 716 182 819.9 239.2"
          fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" filter="url(#rutaBeamGlow)" />
      </g>

      <!-- Única Línea Brillante Dirigida al hacer clic en un país (100% encima de la línea predeterminada) -->
      <path id="ruta-directed-beam" class="ruta-directed-beam" pathLength="100"
        d="M 212.7 273.8 Q 312 162 461.1 194.6 Q 558 194 627.4 285.6"
        fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" filter="url(#rutaBeamGlow)" />

      <!-- Punto 1: Miami (exactamente sobre el nodo predeterminado 212.7, 273.8) -->
      <g class="ruta-node ruta-node-1" data-node-mission="miami" transform="translate(212.7, 273.8)">
        <circle class="ruta-node-pulse" r="16" fill="rgba(94, 130, 226, 0.28)" />
        <circle class="ruta-node-core" r="7.5" fill="#4662F2" stroke="#FFFFFF" stroke-width="2.5" filter="url(#rutaGlow)" />
        <g class="ruta-node-tag">
          <rect class="ruta-node-tag-bg" x="-64" y="-66" width="128" height="40" rx="14" />
          <text class="ruta-node-tag-text" x="0" y="-40" text-anchor="middle">Miami</text>
        </g>
      </g>

      <!-- Punto 2: Ámsterdam (exactamente sobre el nodo predeterminado 461.1, 194.6) -->
      <g class="ruta-node ruta-node-2" data-node-mission="amsterdam" transform="translate(461.1, 194.6)">
        <circle class="ruta-node-pulse" r="16" fill="rgba(94, 130, 226, 0.28)" />
        <circle class="ruta-node-core" r="7.5" fill="#4662F2" stroke="#FFFFFF" stroke-width="2.5" filter="url(#rutaGlow)" />
        <g class="ruta-node-tag">
          <rect class="ruta-node-tag-bg" x="-88" y="-66" width="176" height="40" rx="14" />
          <text class="ruta-node-tag-text" x="0" y="-40" text-anchor="middle">Ámsterdam</text>
        </g>
      </g>

      <!-- Punto 3: Abu Dabi (exactamente sobre el nodo predeterminado 627.4, 285.6) -->
      <g class="ruta-node ruta-node-3 is-selected-node" data-node-mission="abudabi" transform="translate(627.4, 285.6)">
        <circle class="ruta-node-pulse" r="22" fill="rgba(94, 130, 226, 0.32)" />
        <circle class="ruta-node-core" r="10" fill="#3B5BF0" stroke="#FFFFFF" stroke-width="2.8" filter="url(#rutaGlow)" />
        <g class="ruta-node-tag">
          <rect class="ruta-node-tag-bg" x="-78" y="28" width="156" height="40" rx="14" />
          <text class="ruta-node-tag-text" x="0" y="54" text-anchor="middle">Abu Dabi</text>
        </g>
      </g>

      <!-- Punto 4: Corea del Sur (exactamente sobre el nodo predeterminado 819.9, 239.2) -->
      <g class="ruta-node ruta-node-4" data-node-mission="corea" transform="translate(819.9, 239.2)">
        <circle class="ruta-node-pulse" r="16" fill="rgba(94, 130, 226, 0.28)" />
        <circle class="ruta-node-core" r="7.5" fill="#4662F2" stroke="#FFFFFF" stroke-width="2.5" filter="url(#rutaGlow)" />
        <g class="ruta-node-tag">
          <rect class="ruta-node-tag-bg" x="-96" y="-66" width="192" height="40" rx="14" />
          <text class="ruta-node-tag-text" x="0" y="-40" text-anchor="middle">Corea del Sur</text>
        </g>
      </g>
    `;
    imgWrap.appendChild(svgOverlay);
  }

  // Sincronización viva entre las 4 tarjetas y su respectivo punto luminoso en el mapa (hover + click)
  pins.forEach((pin) => {
    const key = pin.getAttribute('data-mission');
    pin.addEventListener('mouseenter', () => {
      const targetNode = mapCanvas.querySelector(`.ruta-node[data-node-mission="${key}"]`);
      if (targetNode) targetNode.classList.add('is-hovered-node');
    });
    pin.addEventListener('mouseleave', () => {
      const targetNode = mapCanvas.querySelector(`.ruta-node[data-node-mission="${key}"]`);
      if (targetNode) targetNode.classList.remove('is-hovered-node');
    });
  });

  mapCanvas.querySelectorAll('.ruta-node[data-node-mission]').forEach((node) => {
    node.addEventListener('click', () => {
      const key = node.getAttribute('data-node-mission');
      const targetPin = mapCanvas.querySelector(`.ruta-pin-card[data-mission="${key}"]`);
      if (targetPin) targetPin.click();
    });
  });

  whenPreloaderReady(() => {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      mapCanvas.classList.add('is-route-active');
      return;
    }

    const mapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mapCanvas.classList.add('is-route-active');
          } else {
            const rect = entry.boundingClientRect;
            if (rect.top > window.innerHeight * 0.85 || rect.bottom < 0) {
              mapCanvas.classList.remove('is-route-active');
              const b1 = document.getElementById('ruta-directed-beam');
              if (b1) {
                const fullPath = 'M 212.7 273.8 Q 312 162 461.1 194.6 Q 558 194 627.4 285.6 Q 716 182 819.9 239.2';
                b1.setAttribute('d', fullPath);
                b1.classList.remove('is-travelling');
              }
            }
          }
        });
      },
      {
        threshold: 0.22,
        rootMargin: '0px 0px -8% 0px'
      }
    );
    mapObserver.observe(mapCanvas);
  });
}

/**
 * Trayectorias exactas sobre las curvas predeterminadas del mapa desde el extremo / país más lejano hacia el país seleccionado:
 * - Abu Dabi (por defecto): viene desde el extremo izquierdo (Miami -> Ámsterdam -> Abu Dabi)
 * - Corea del Sur: viene desde el extremo más lejano (Miami -> Ámsterdam -> Abu Dabi -> Corea del Sur)
 * - Miami: viene desde el extremo derecho más lejano (Corea del Sur -> Abu Dabi -> Ámsterdam -> Miami)
 * - Ámsterdam: viene desde el extremo derecho más lejano (Corea del Sur -> Abu Dabi -> Ámsterdam)
 */
const DIRECTED_BEAM_PATHS = {
  abudabi: 'M 212.7 273.8 Q 312 162 461.1 194.6 Q 558 194 627.4 285.6',
  corea: 'M 212.7 273.8 Q 312 162 461.1 194.6 Q 558 194 627.4 285.6 Q 716 182 819.9 239.2',
  miami: 'M 819.9 239.2 Q 716 182 627.4 285.6 Q 558 194 461.1 194.6 Q 312 162 212.7 273.8',
  amsterdam: 'M 819.9 239.2 Q 716 182 627.4 285.6 Q 558 194 461.1 194.6'
};

let beamCooldownTimer = null;

export function triggerDirectedMapBeam(targetMissionKey) {
  const pathData = DIRECTED_BEAM_PATHS[targetMissionKey];
  if (!pathData) return;

  const mapCanvas = document.querySelector('.ruta-map-canvas');
  const beam = document.getElementById('ruta-directed-beam');
  if (!beam) return;

  // Pausar la animación de punto a punto en reposo mientras se desliza la única línea del país seleccionado
  // y mantener una pausa tranquila después de que termine para que no salga de inmediato
  if (mapCanvas) {
    mapCanvas.classList.add('is-user-selecting');
  }
  if (beamCooldownTimer) {
    clearTimeout(beamCooldownTimer);
  }

  beam.setAttribute('d', pathData);
  beam.classList.remove('is-travelling');
  void beam.getBoundingClientRect();
  beam.classList.add('is-travelling');

  beamCooldownTimer = setTimeout(() => {
    beam.classList.remove('is-travelling');
    if (mapCanvas) {
      mapCanvas.classList.remove('is-user-selecting');
    }
  }, 5500);
}

/**
 * Transición fluida estilo WAAPI al cambiar de misión en Ruta Internacional
 * + Zoom-out nítido (sin ningún blur/borrosidad) + línea brillante viajando hacia el país elegido
 */
export function animateMissionCrossfade(elements, selectedMissionKey) {
  if (selectedMissionKey) {
    document.querySelectorAll('.ruta-node[data-node-mission]').forEach((node) => {
      node.classList.toggle(
        'is-selected-node',
        node.getAttribute('data-node-mission') === selectedMissionKey
      );
    });
    triggerDirectedMapBeam(selectedMissionKey);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Redibujar trazo por trazo el ícono del edificio institucional en la tarjeta destacada al cambiar de país
  const featIconPath = document.querySelector('.ruta-featured-icon-box svg path');
  if (featIconPath && featIconPath.animate) {
    try {
      featIconPath.setAttribute('pathLength', '100');
      featIconPath.animate(
        [
          { strokeDasharray: '100', strokeDashoffset: 100 },
          { strokeDasharray: '100', strokeDashoffset: 0 }
        ],
        {
          duration: 620,
          easing: EASE_OUT_STRONG,
          fill: 'both'
        }
      );
    } catch (e) {
      // Ignorar si no soporta pathLength
    }
  }

  elements.forEach((el, idx) => {
    if (!el || !el.animate) return;
    let anim = null;
    if (el.id === 'ruta-featured-img') {
      anim = el.animate(
        [
          { opacity: 0.4, transform: 'scale(1.05)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        {
          duration: 420,
          easing: EASE_OUT_STRONG
        }
      );
    } else if (el.id === 'ruta-featured-month') {
      anim = el.animate(
        [
          { opacity: 0, transform: 'translate3d(0, -10px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' }
        ],
        {
          duration: 340,
          easing: EASE_OUT_STRONG
        }
      );
    } else if (el.id === 'ruta-featured-city') {
      anim = el.animate(
        [
          { opacity: 0, transform: 'translate3d(-12px, 0, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' }
        ],
        {
          duration: 360,
          delay: 35,
          easing: EASE_OUT_STRONG
        }
      );
    } else {
      anim = el.animate(
        [
          { opacity: 0, transform: 'translate3d(0, 8px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' }
        ],
        {
          duration: 360,
          delay: idx * 30,
          easing: EASE_OUT_STRONG
        }
      );
    }
    if (anim) {
      anim.onfinish = () => anim.cancel();
    }
  });
}
