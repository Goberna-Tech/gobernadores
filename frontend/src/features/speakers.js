/**
 * Feature: Ponentes y Modal Interactivo de Trayectoria
 */
import { store } from '../store.js';

const FALLBACK_PONENTES = [
  {
    id: 'rogelio-rivas',
    name: 'Rogelio Rivas',
    country: 'El Salvador',
    role: 'Exministro de Justicia y Seguridad Pública del gobierno de Nayib Bukele',
    photo: './assets/img/speaker-rogelio-rivas.webp',
    bio: 'Lideró la implementación operativa de la estrategia nacional de seguridad pública y control territorial en El Salvador, articulando fuerzas del orden, tecnología de vigilancia y prevención.',
    trajectory: [
      { year: '2019 - 2021', role: 'Ministro de Justicia y Seguridad Pública', desc: 'Dirección del Plan Control Territorial y reducción histórica de índices delictivos.' },
      { year: '2018 - 2019', role: 'Presidente de la Administración Nacional', desc: 'Modernización institucional y gestión de infraestructura estratégica.' }
    ]
  },
  {
    id: 'yeon-soo-kim',
    name: 'Dr. Yeon Soo KIM',
    country: 'Corea del Sur',
    role: 'Experto internacional en ciudades inteligentes, transformación urbana y tecnología aplicada al gobierno',
    photo: './assets/img/speaker-yeon-soo-kim.webp',
    bio: 'Referente asiático en el diseño de políticas de Smart Cities, digitalización de servicios municipales e innovación tecnológica para gobiernos locales y regionales.',
    trajectory: [
      { year: '2020 - Actualidad', role: 'Consultor Senior en Smart Cities', desc: 'Asesoría internacional en transformación digital urbana y gobierno electrónico.' },
      { year: '2014 - 2020', role: 'Director de Programas de Innovación Pública', desc: 'Desarrollo de centros integrados de monitoreo y movilidad inteligente en Corea del Sur.' }
    ]
  },
  {
    id: 'roberth-bazan',
    name: 'Dr. Roberth Bazán',
    country: 'Perú',
    role: 'Asesor político • CEO de Grupo Goberna',
    photo: './assets/img/speaker-roberth-bazan.webp',
    bio: 'Asesor político. Ha acompañado campañas en toda América Latina y ha asesorado en uso de tecnologías a autoridades de alto nivel.',
    trajectory: [
      { year: 'Trayectoria Internacional', role: 'Asesor político', desc: 'Ha acompañado campañas en toda América Latina y ha asesorado en uso de tecnologías a autoridades de alto nivel.' },
      { year: 'Dirección Ejecutiva', role: 'CEO de Grupo Goberna', desc: 'Especialista en estrategia política y tecnología aplicada al poder.' }
    ]
  },
  {
    id: 'ronald-salazar',
    name: 'Ronald Salazar',
    country: 'Perú',
    role: 'Especialista en Cooperación Internacional y creación de Mesa de Cooperación Técnica',
    photo: './assets/img/speaker-ronald-salazar.webp',
    bio: 'Especialista en Cooperación Internacional y creación de Mesa de Cooperación Técnica. Maneja oportunidades de articulación entre gobiernos locales, organismos internacionales e instituciones extranjeras.',
    trajectory: [
      { year: 'Especialidad', role: 'Especialista en Cooperación Internacional y creación de Mesa de Cooperación Técnica', desc: 'Maneja oportunidades de articulación entre gobiernos locales, organismos internacionales e instituciones extranjeras.' }
    ]
  }
];

export function initSpeakers() {
  const modal = document.getElementById('trajectory-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  // Delegación de eventos para botones "VER TRAYECTORIA"
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-trajectory');
    if (!btn) return;

    const speakerId = btn.getAttribute('data-speaker-id');
    const { ponentes } = store.getState();
    const speaker = FALLBACK_PONENTES.find(p => p.id === speakerId) || ((ponentes && ponentes.length) ? ponentes.find(p => p.id === speakerId) : null);

    if (speaker) {
      openSpeakerTrajectory(speaker);
    }
  });
}

export function openSpeakerTrajectory(speaker) {
  const modal = document.getElementById('trajectory-modal');
  if (!modal) return;

  const photoEl = document.getElementById('modal-speaker-photo');
  const nameEl = document.getElementById('modal-speaker-name');
  const roleEl = document.getElementById('modal-speaker-role');
  const bioEl = document.getElementById('modal-speaker-bio');
  const timelineEl = document.getElementById('modal-speaker-timeline');

  if (photoEl) photoEl.src = speaker.photo;
  if (nameEl) nameEl.textContent = speaker.name;
  if (roleEl) roleEl.textContent = `${speaker.country} • ${speaker.role}`;
  if (bioEl) bioEl.textContent = speaker.bio;

  if (timelineEl) {
    timelineEl.innerHTML = (speaker.trajectory || []).map(t => `
      <div class="trajectory-item">
        <div class="trajectory-year">${t.year}</div>
        <div class="trajectory-role">${t.role}</div>
        <div class="trajectory-desc">${t.desc}</div>
      </div>
    `).join('');
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
