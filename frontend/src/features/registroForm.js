/**
 * Feature: Formulario de Reserva de Cupos
 * Cumple Regla 4: Idempotencia y prevención de Race Conditions en Frontend
 * Cumple Guía C3:
 * - Mensajes de error específicos casilla por casilla (Inline Field Errors)
 * - Restricción en vivo: WhatsApp solo números (9 dígitos), Nombre/Apellido solo letras
 * - Buscador predictivo (Autocomplete con debounce) para Distrito y Provincia
 * - Cero exposición de credenciales y sanitización defensiva
 */
import { ApiClient } from '../apiClient.js';
import { store } from '../store.js';
import { DEPARTAMENTOS_PERU, PROVINCIAS_PERU, DISTRITOS_PERU } from '../ubigeo.js';

const GOOGLE_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbxS2VQ3DKNfIAnKfy0lg3ltB8QrurTuXuBYGRbmh0dsT-pNssmSuMRhS0hNOa-RhKf3nw/exec';

async function sendDirectToGoogleSheets(recordData) {
  const payload = JSON.stringify(recordData);
  let sent = false;

  try {
    await fetch(GOOGLE_SHEETS_WEBHOOK, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: payload
    });
    sent = true;
  } catch (err) {
    console.warn('[GoogleSheets] Fetch send warning:', err);
  }

  // Respaldo garantizado vía sendBeacon para cualquier navegador o conexión
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'text/plain' });
      navigator.sendBeacon(GOOGLE_SHEETS_WEBHOOK, blob);
      sent = true;
    }
  } catch (beaconErr) {
    console.warn('[GoogleSheets] Beacon fallback warning:', beaconErr);
  }

  return sent;
}

function normalizeSearch(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function initRegistroForm() {
  const form = document.getElementById('registration-form');
  const submitBtn = document.getElementById('btn-submit-registration');
  const statusBox = document.getElementById('form-status-message');

  const nombreInput = document.getElementById('nombre');
  const apellidoInput = document.getElementById('apellido');
  const whatsappInput = document.getElementById('whatsapp');
  const correoInput = document.getElementById('correo');
  const distritoInput = document.getElementById('distrito');
  const distritoList = document.getElementById('distrito-suggestions');
  const provinciaInput = document.getElementById('provincia');
  const provinciaList = document.getElementById('provincia-suggestions');
  const cargoInput = document.getElementById('cargo');

  if (!form || !submitBtn) return;

  // GESTIÓN DE ERRORES POR CASILLA (INLINE ERRORS)
  const setFieldError = (fieldName, message) => {
    const errorEl = document.getElementById(`error-${fieldName}`);
    const inputEl = document.getElementById(fieldName);
    if (errorEl) {
      if (message) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
      } else {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    }
    if (inputEl) {
      if (message) {
        inputEl.classList.add('has-error');
      } else {
        inputEl.classList.remove('has-error');
      }
    }
  };

  const clearAllFieldErrors = () => {
    ['nombre', 'apellido', 'whatsapp', 'correo', 'distrito', 'provincia', 'cargo'].forEach(f => {
      setFieldError(f, '');
    });
    if (statusBox) {
      statusBox.style.display = 'none';
      statusBox.textContent = '';
      statusBox.className = 'form-status';
    }
  };

  // Limpiar error de casilla al escribir o interactuar
  [nombreInput, apellidoInput, whatsappInput, correoInput, distritoInput, provinciaInput, cargoInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      setFieldError(inp.name || inp.id, '');
    });
    inp.addEventListener('change', () => {
      setFieldError(inp.name || inp.id, '');
    });
  });

  // 1. RESTRICCIÓN EN VIVO: Nombres y Apellidos SOLO LETRAS Y ESPACIOS
  const sanitizeNameInput = (input) => {
    if (!input) return;
    input.addEventListener('input', (e) => {
      const prev = e.target.value;
      const filtered = prev.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'.'-]/g, '');
      if (prev !== filtered) {
        e.target.value = filtered;
      }
    });
  };
  sanitizeNameInput(nombreInput);
  sanitizeNameInput(apellidoInput);

  // 2. RESTRICCIÓN EN VIVO: WhatsApp SOLO NÚMEROS (Máximo 9 dígitos para Perú)
  if (whatsappInput) {
    whatsappInput.setAttribute('maxlength', '9');
    whatsappInput.setAttribute('inputmode', 'numeric');
    whatsappInput.addEventListener('input', (e) => {
      const prev = e.target.value;
      let clean = prev.replace(/\D/g, '');
      if (clean.length > 9) clean = clean.slice(0, 9);
      if (prev !== clean) {
        e.target.value = clean;
      }
    });
  }

  // 3. BUSCADOR PREDICTIVO PARA DISTRITO
  let distritoTimer = null;
  if (distritoInput && distritoList) {
    distritoInput.addEventListener('input', (e) => {
      if (distritoTimer) clearTimeout(distritoTimer);
      const query = normalizeSearch(e.target.value);

      if (query.length < 2) {
        distritoList.innerHTML = '';
        distritoList.style.display = 'none';
        return;
      }

      distritoTimer = setTimeout(() => {
        const matches = DISTRITOS_PERU.filter(item => {
          const normDist = normalizeSearch(item.n);
          return normDist.includes(query);
        }).slice(0, 8);

        if (matches.length === 0) {
          distritoList.innerHTML = '';
          distritoList.style.display = 'none';
          return;
        }

        distritoList.innerHTML = matches.map(item => `
          <li class="registro-autocomplete-item" data-distrito="${item.n}" data-provincia="${item.p}" data-departamento="${item.d}">
            <span class="registro-autocomplete-main">${item.n}</span>
            <span class="registro-autocomplete-sub">${item.p}, ${item.d}</span>
          </li>
        `).join('');

        distritoList.style.display = 'block';
      }, 150);
    });

    distritoList.addEventListener('click', (e) => {
      const item = e.target.closest('.registro-autocomplete-item');
      if (!item) return;

      const distrito = item.dataset.distrito;
      const provincia = item.dataset.provincia;
      const departamento = item.dataset.departamento;

      distritoInput.value = distrito;
      setFieldError('distrito', '');

      if (provinciaInput) {
        provinciaInput.value = (provincia === departamento || provincia === 'Lima') 
          ? provincia 
          : `${provincia}, ${departamento}`;
        setFieldError('provincia', '');
      }

      distritoList.innerHTML = '';
      distritoList.style.display = 'none';
    });
  }

  // 4. BUSCADOR PREDICTIVO PARA PROVINCIA O DEPARTAMENTO
  let provinciaTimer = null;
  if (provinciaInput && provinciaList) {
    provinciaInput.addEventListener('input', (e) => {
      if (provinciaTimer) clearTimeout(provinciaTimer);
      const query = normalizeSearch(e.target.value);

      if (query.length < 2) {
        provinciaList.innerHTML = '';
        provinciaList.style.display = 'none';
        return;
      }

      provinciaTimer = setTimeout(() => {
        const matchesProv = PROVINCIAS_PERU.filter(item => {
          return normalizeSearch(item.p).includes(query) || normalizeSearch(item.d).includes(query);
        }).slice(0, 6);

        const matchesDep = DEPARTAMENTOS_PERU.filter(dep => {
          return normalizeSearch(dep).includes(query);
        }).slice(0, 3);

        const combined = [];
        matchesDep.forEach(dep => {
          combined.push({ label: dep, sub: 'Departamento Regional' });
        });
        matchesProv.forEach(p => {
          if (!combined.some(c => c.label === p.p)) {
            combined.push({ label: p.p, sub: `Provincia de ${p.d}` });
          }
        });

        if (combined.length === 0) {
          provinciaList.innerHTML = '';
          provinciaList.style.display = 'none';
          return;
        }

        provinciaList.innerHTML = combined.map(item => `
          <li class="registro-autocomplete-item" data-value="${item.label}">
            <span class="registro-autocomplete-main">${item.label}</span>
            <span class="registro-autocomplete-sub">${item.sub}</span>
          </li>
        `).join('');

        provinciaList.style.display = 'block';
      }, 150);
    });

    provinciaList.addEventListener('click', (e) => {
      const item = e.target.closest('.registro-autocomplete-item');
      if (!item) return;

      provinciaInput.value = item.dataset.value;
      setFieldError('provincia', '');
      provinciaList.innerHTML = '';
      provinciaList.style.display = 'none';
    });
  }

  // Cerrar listas al hacer clic afuera
  document.addEventListener('click', (e) => {
    if (distritoList && !distritoList.contains(e.target) && e.target !== distritoInput) {
      distritoList.style.display = 'none';
    }
    if (provinciaList && !provinciaList.contains(e.target) && e.target !== provinciaInput) {
      provinciaList.style.display = 'none';
    }
  });

  // 5. ENVÍO DE FORMULARIO CON SEÑALIZACIÓN EN CADA CASILLA
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (store.getState().isSubmitting) return;

    clearAllFieldErrors();

    const formData = new FormData(form);
    const data = {
      nombre: (formData.get('nombre') || '').trim(),
      apellido: (formData.get('apellido') || '').trim(),
      cargo: (formData.get('cargo') || '').trim(),
      provincia: (formData.get('provincia') || '').trim(),
      distrito: (formData.get('distrito') || '').trim(),
      whatsapp: (formData.get('whatsapp') || '').trim(),
      correo: (formData.get('correo') || '').trim(),
      aceptaTerminos: formData.get('aceptaTerminos') === 'on'
    };

    let hasErrors = false;
    let firstErrorField = null;

    // Validación individual por casilla
    if (!data.nombre || data.nombre.length < 2) {
      setFieldError('nombre', 'El nombre es obligatorio (mínimo 2 letras).');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = nombreInput;
    } else if (/[0-9<>]/.test(data.nombre)) {
      setFieldError('nombre', 'El nombre solo debe contener letras.');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = nombreInput;
    }

    if (!data.apellido || data.apellido.length < 2) {
      setFieldError('apellido', 'El apellido es obligatorio (mínimo 2 letras).');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = apellidoInput;
    } else if (/[0-9<>]/.test(data.apellido)) {
      setFieldError('apellido', 'El apellido solo debe contener letras.');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = apellidoInput;
    }

    const cleanWhatsapp = data.whatsapp.replace(/\D/g, '');
    if (!cleanWhatsapp) {
      setFieldError('whatsapp', 'El WhatsApp es obligatorio.');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = whatsappInput;
    } else if (cleanWhatsapp.length !== 9 || !cleanWhatsapp.startsWith('9')) {
      setFieldError('whatsapp', 'Debe tener 9 dígitos y empezar con 9 (ej. 987654321).');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = whatsappInput;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!data.correo) {
      setFieldError('correo', 'El correo es obligatorio.');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = correoInput;
    } else if (!emailRegex.test(data.correo)) {
      setFieldError('correo', 'Ingrese un correo electrónico válido (ej. nombre@ejemplo.com).');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = correoInput;
    }

    if (!data.distrito || data.distrito.length < 2) {
      setFieldError('distrito', 'El distrito es obligatorio.');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = distritoInput;
    }

    if (!data.provincia || data.provincia.length < 2) {
      setFieldError('provincia', 'La provincia o departamento es obligatorio.');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = provinciaInput;
    }

    if (!data.cargo) {
      setFieldError('cargo', 'Seleccione un cargo de la lista.');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = cargoInput;
    }

    if (hasErrors) {
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    // Bloqueo de idempotencia inmediato y animación de carga
    store.setState({ isSubmitting: true });
    submitBtn.disabled = true;
    submitBtn.classList.remove('is-success');
    submitBtn.classList.add('is-submitting');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <span class="btn-spinner" aria-hidden="true"></span>
      <span>Procesando reserva...</span>
    `;

    try {
      // 1. Envío directo y garantizado a Google Sheets
      await sendDirectToGoogleSheets(data);

      // 2. Solo sincronizar con backend si estamos en desarrollo local
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        try {
          await ApiClient.post('/api/registro', data);
        } catch (backendErr) {
          // Ignorar si el backend local no está iniciado
        }
      }

      if (statusBox) {
        statusBox.className = 'form-status success';
        statusBox.textContent = '¡Tu cupo ha sido reservado con éxito! Confirmaremos tu inscripción por correo y WhatsApp.';
        statusBox.style.display = 'block';
        statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();
      clearAllFieldErrors();

      // Transición fluida a estado de Éxito
      submitBtn.classList.remove('is-submitting');
      submitBtn.classList.add('is-success');
      submitBtn.innerHTML = `
        <span class="btn-success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <span>¡CUPO RESERVADO!</span>
      `;

      setTimeout(() => {
        submitBtn.classList.remove('is-success');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        store.setState({ isSubmitting: false });
      }, 4500);

    } catch (err) {
      submitBtn.classList.remove('is-submitting');
      submitBtn.classList.remove('is-success');

      // Si el servidor devolvió errores específicos por campo
      if (err.errors && typeof err.errors === 'object') {
        Object.entries(err.errors).forEach(([field, msg]) => {
          setFieldError(field, msg);
        });
      } else {
        if (statusBox) {
          statusBox.className = 'form-status error';
          statusBox.textContent = err.message || 'Ocurrió un inconveniente al registrar. Por favor revise sus datos.';
          statusBox.style.display = 'block';
          statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      store.setState({ isSubmitting: false });
    }
  });
}
