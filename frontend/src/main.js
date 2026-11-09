/**
 * Entry Point del Frontend
 * Foro de Alcaldes y Gobernadores 2026
 */
import { store } from './store.js';
import { ApiClient } from './apiClient.js';
import { initPreloader } from './features/preloader.js';
import { initWhatsApp } from './features/whatsapp.js';
import { initSpeakers } from './features/speakers.js';
import { initRegistroForm } from './features/registroForm.js';

const MISSIONS_DATA = {
  miami: {
    month: 'MARZO',
    city: 'Miami',
    country: 'Estados Unidos',
    img: './assets/img/mision-miami.png',
    desc: 'Seguridad ciudadana, gestión de emergencias y modelos de desarrollo urbano.'
  },
  amsterdam: {
    month: 'JUNIO',
    city: 'Ámsterdam',
    country: 'Países Bajos',
    img: './assets/img/mision-amsterdam.png',
    desc: 'Sostenibilidad territorial, movilidad inteligente y planificación resiliente.'
  },
  abudabi: {
    month: 'OCTUBRE',
    city: 'Abu Dabi',
    country: 'Emiratos Árabes Unidos',
    img: './assets/img/mision-abudabi.png',
    desc: 'Modernización del Estado, innovación y desarrollo estratégico.'
  },
  corea: {
    month: 'SEPTIEMBRE',
    city: 'Corea del Sur',
    country: 'Seúl • República de Corea',
    img: './assets/img/mision-corea.png',
    desc: 'Gobierno digital, Smart Cities e inteligencia artificial aplicada a la gestión pública.'
  }
};

function initEjesAccordion() {
  const cards = document.querySelectorAll('.eje-accordion-card');
  if (!cards.length) return;

  const rightArrow = `<svg viewBox="0 0 18 18" width="16" height="16"><path d="M 3 9 L 15 9 M 10 4 L 15 9 L 10 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  cards.forEach((card) => {
    const header = card.querySelector('.eje-accordion-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isAlreadyOpen = card.classList.contains('is-open');

      cards.forEach((c) => {
        c.classList.remove('is-open');
        const h = c.querySelector('.eje-accordion-header');
        const btn = c.querySelector('.eje-circle-btn');
        if (h) h.setAttribute('aria-expanded', 'false');
        if (btn) btn.innerHTML = rightArrow;
      });

      if (!isAlreadyOpen) {
        card.classList.add('is-open');
        header.setAttribute('aria-expanded', 'true');
        const btn = card.querySelector('.eje-circle-btn');
        if (btn) btn.innerHTML = rightArrow;
      }
    });
  });
}

function initRutaMissions() {
  const pinCards = document.querySelectorAll('.ruta-pin-card');
  const photoPins = document.querySelectorAll('.ruta-map-photo-pin');
  const featImg = document.getElementById('ruta-featured-img');
  const featMonth = document.getElementById('ruta-featured-month');
  const featCity = document.getElementById('ruta-featured-city');
  const featCountry = document.getElementById('ruta-featured-country');
  const featDesc = document.getElementById('ruta-featured-desc');

  if (!pinCards.length) return;

  function selectMission(key) {
    const data = MISSIONS_DATA[key];
    if (!data) return;

    pinCards.forEach((b) => {
      if (b.getAttribute('data-mission') === key) {
        b.classList.add('is-active');
      } else {
        b.classList.remove('is-active');
      }
    });

    if (featImg) {
      featImg.src = data.img;
      featImg.alt = `${data.city} - ${data.country}`;
    }
    if (featMonth) featMonth.textContent = data.month;
    if (featCity) featCity.textContent = data.city;
    if (featCountry) featCountry.textContent = data.country;
    if (featDesc) featDesc.textContent = data.desc;
  }

  pinCards.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-mission');
      selectMission(key);
    });
  });

  photoPins.forEach((pin) => {
    pin.addEventListener('click', () => {
      const key = pin.getAttribute('data-mission');
      selectMission(key);
    });
  });
}

function initSpeakersCarousel() {
  const grid = document.getElementById('speakers-grid');
  const prevBtn = document.getElementById('speakers-prev');
  const nextBtn = document.getElementById('speakers-next');
  if (!grid || !prevBtn || !nextBtn) return;

  let isAnimating = false;
  const DURATION = 550;
  const EASING = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';

  function getStepSize() {
    const firstCard = grid.querySelector('.speaker-card-xd');
    if (!firstCard) return 368;
    const style = window.getComputedStyle(grid);
    const gap = parseFloat(style.columnGap || style.gap || '28') || 28;
    return firstCard.offsetWidth + gap;
  }

  function slideNext() {
    if (isAnimating) return;
    isAnimating = true;
    const step = getStepSize();

    grid.style.transition = EASING;
    grid.style.transform = `translate3d(-${step}px, 0, 0)`;

    setTimeout(() => {
      grid.style.transition = 'none';
      const first = grid.firstElementChild;
      if (first) grid.appendChild(first);
      grid.style.transform = 'translate3d(0, 0, 0)';
      isAnimating = false;
    }, DURATION);
  }

  function slidePrev() {
    if (isAnimating) return;
    isAnimating = true;
    const step = getStepSize();

    grid.style.transition = 'none';
    const last = grid.lastElementChild;
    if (last) grid.insertBefore(last, grid.firstElementChild);
    grid.style.transform = `translate3d(-${step}px, 0, 0)`;

    // Force reflow so browser registers the initial offset before animating to 0
    void grid.offsetWidth;

    grid.style.transition = EASING;
    grid.style.transform = 'translate3d(0, 0, 0)';

    setTimeout(() => {
      grid.style.transition = 'none';
      isAnimating = false;
    }, DURATION);
  }

  nextBtn.addEventListener('click', slideNext);
  prevBtn.addEventListener('click', slidePrev);

  // Soporte táctil (swipe de derecha a izquierda y viceversa)
  let touchStartX = 0;
  grid.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  grid.addEventListener('touchend', (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        slideNext();
      } else {
        slidePrev();
      }
    }
  }, { passive: true });

  // Movimiento automático cada 30 segundos (derecha e izquierda)
  let autoDirection = 'next';
  let autoInterval = null;

  function startAutoplay() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(() => {
      if (autoDirection === 'next') {
        slideNext();
        autoDirection = 'prev';
      } else {
        slidePrev();
        autoDirection = 'next';
      }
    }, 30000);
  }

  function pauseAutoplay() {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  }

  startAutoplay();

  const carouselWrap = grid.closest('.ponentes-section') || grid.parentElement || grid;
  carouselWrap.addEventListener('mouseenter', pauseAutoplay);
  carouselWrap.addEventListener('mouseleave', startAutoplay);
}

function initVideoBox() {
  const videoBox = document.getElementById('video-preview-box');
  if (!videoBox) return;
  videoBox.addEventListener('click', () => {
    videoBox.classList.toggle('show-preview');
  });
}

async function bootstrap() {
  initPreloader();
  initWhatsApp();
  initSpeakers();
  initRegistroForm();
  initEjesAccordion();
  initRutaMissions();
  initSpeakersCarousel();
  initVideoBox();

  // Header transparente sobre Hero, con blur al hacer scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Mobile menu toggle con bloqueo de scroll y accesibilidad
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.textContent = isOpen ? '✕' : '☰';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // Carga inicial de datos desde API
  try {
    const [ponentesRes, infoRes] = await Promise.all([
      ApiClient.get('/api/ponentes'),
      ApiClient.get('/api/info')
    ]);

    if (ponentesRes && ponentesRes.data) {
      store.setState({ ponentes: ponentesRes.data });
    }
    if (infoRes && infoRes.data) {
      store.setState({
        eventInfo: infoRes.data.info,
        ejes: infoRes.data.ejes,
        ruta: infoRes.data.ruta
      });
    }
  } catch (e) {
    console.warn('Fallback a datos locales integrados:', e);
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
