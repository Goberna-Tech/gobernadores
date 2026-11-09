/**
 * Reglas de Validación Puras (Single Source of Truth)
 * Cumple Ley N° 29733 (Protección de Datos Personales Perú) y Guía C3 de Ciberseguridad Defensiva
 */

/**
 * Detecta intentos de inyección de código (HTML/JS/XSS, SQL o comandos)
 */
export function hasCodeInjectionAttempt(str) {
  if (typeof str !== 'string') return false;
  // XSS y etiquetas HTML/SVG/XML
  if (/<[^>]*>|javascript:|data:\s*text\/html|vbscript:|on\w+\s*=/i.test(str)) {
    return true;
  }
  // Tautologías SQL e inyecciones comunes
  if (/(\b(union(\s+all)?|select|drop|insert|update|delete|truncate|exec|execute)\b|(--|\/\*|\*\/|;\s*$)|'\s*or\s*'1'\s*=\s*'1|"\s*or\s*"1"\s*=\s*"1)/i.test(str)) {
    return true;
  }
  // Formula injection para planillas / hojas de cálculo
  if (/^[=+@-]\s*[a-zA-Z0-9_]/.test(str)) {
    return true;
  }
  return false;
}

/**
 * Sanitiza texto eliminando etiquetas y neutralizando inyección de fórmulas
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  let sanitized = text
    .replace(/[<>]/g, '')
    .trim();
  // Neutralizar fórmula si empieza con = + - @
  if (/^[=+@-]/.test(sanitized)) {
    sanitized = `'${sanitized}`;
  }
  return sanitized;
}

/**
 * Valida nombres y apellidos permitiendo únicamente letras, tildes, ñ y espacios
 */
export function validatePersonName(name, fieldLabel = 'Nombre') {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldLabel} es obligatorio` };
  }
  if (hasCodeInjectionAttempt(name)) {
    return { valid: false, error: `${fieldLabel} contiene caracteres o patrones no permitidos` };
  }
  const clean = name.trim();
  if (clean.length < 2) {
    return { valid: false, error: `${fieldLabel} debe tener al menos 2 caracteres` };
  }
  if (clean.length > 60) {
    return { valid: false, error: `${fieldLabel} no debe exceder 60 caracteres` };
  }
  // Solo letras (incluye tildes, diéresis, ñ), apóstrofes y espacios
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'.'-]+$/;
  if (!nameRegex.test(clean)) {
    return { valid: false, error: `${fieldLabel} solo debe contener letras` };
  }
  return { valid: true, clean };
}

export function validatePeruPhone(phone) {
  if (!phone) return { valid: false, error: 'El número de WhatsApp es obligatorio' };
  if (typeof phone === 'string' && hasCodeInjectionAttempt(phone)) {
    return { valid: false, error: 'Número de WhatsApp inválido' };
  }
  const clean = String(phone).replace(/\D/g, '');
  // Teléfonos celulares en Perú tienen exactamente 9 dígitos y empiezan con 9
  if (/^9\d{8}$/.test(clean)) {
    return { valid: true, clean };
  }
  // Permitir con código de país 51 (519XXXXXXXX)
  if (/^519\d{8}$/.test(clean)) {
    return { valid: true, clean: clean.substring(2) };
  }
  return { valid: false, error: 'Ingrese un número celular válido de 9 dígitos que comience con 9 (ej. 907772155)' };
}

export function validateEmail(email) {
  if (!email) return { valid: false, error: 'El correo electrónico es obligatorio' };
  if (typeof email === 'string' && hasCodeInjectionAttempt(email)) {
    return { valid: false, error: 'Correo electrónico con caracteres inválidos' };
  }
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const str = String(email).trim().toLowerCase();
  if (!regex.test(str)) {
    return { valid: false, error: 'Ingrese un correo electrónico válido (ej. usuario@dominio.com)' };
  }
  return { valid: true, clean: str };
}

export function validateRegistrationData(data) {
  const errors = {};

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: { form: 'Datos de formulario inválidos' } };
  }

  // 1. Validar Nombre (solo letras, anti-inyección)
  const nombreRes = validatePersonName(data.nombre, 'El nombre');
  if (!nombreRes.valid) {
    errors.nombre = nombreRes.error;
  }

  // 2. Validar Apellido (solo letras, anti-inyección)
  const apellidoRes = validatePersonName(data.apellido, 'El apellido');
  if (!apellidoRes.valid) {
    errors.apellido = apellidoRes.error;
  }

  // 3. Validar Cargo
  if (!data.cargo || sanitizeText(data.cargo).length < 2) {
    errors.cargo = 'El cargo es obligatorio';
  } else if (hasCodeInjectionAttempt(data.cargo)) {
    errors.cargo = 'Cargo con formato no permitido';
  }

  // 4. Validar Provincia o Departamento
  if (!data.provincia || sanitizeText(data.provincia).length < 2) {
    errors.provincia = 'La provincia o departamento es obligatorio';
  } else if (hasCodeInjectionAttempt(data.provincia)) {
    errors.provincia = 'Provincia o departamento con formato no permitido';
  }

  // 5. Validar Distrito
  if (!data.distrito || sanitizeText(data.distrito).length < 2) {
    errors.distrito = 'El distrito es obligatorio';
  } else if (hasCodeInjectionAttempt(data.distrito)) {
    errors.distrito = 'Distrito con formato no permitido';
  }

  // 6. Validar WhatsApp (exactamente 9 dígitos iniciando en 9)
  const phoneRes = validatePeruPhone(data.whatsapp);
  if (!phoneRes.valid) {
    errors.whatsapp = phoneRes.error;
  }

  // 7. Validar Correo Electrónico
  const emailRes = validateEmail(data.correo);
  if (!emailRes.valid) {
    errors.correo = emailRes.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      nombre: nombreRes.clean || sanitizeText(data.nombre),
      apellido: apellidoRes.clean || sanitizeText(data.apellido),
      cargo: sanitizeText(data.cargo),
      provincia: sanitizeText(data.provincia),
      distrito: sanitizeText(data.distrito),
      whatsapp: phoneRes.clean || '',
      correo: emailRes.clean || '',
      aceptaTerminos: Boolean(data.aceptaTerminos)
    }
  };
}

