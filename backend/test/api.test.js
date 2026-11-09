import test from 'node:test';
import assert from 'node:assert';
import { validateRegistrationData, validatePeruPhone, validateEmail, hasCodeInjectionAttempt, validatePersonName } from '@mcdl/shared';

test('Validador de Teléfono Celular Perú', () => {
  assert.strictEqual(validatePeruPhone('907772155').valid, true);
  assert.strictEqual(validatePeruPhone('51907772155').valid, true);
  assert.strictEqual(validatePeruPhone('12345678').valid, false);
  // No debe permitir números de 10 dígitos como 9876543321
  assert.strictEqual(validatePeruPhone('9876543321').valid, false);
});

test('Validador de Correo Electrónico', () => {
  assert.strictEqual(validateEmail('contacto@goberna.pe').valid, true);
  assert.strictEqual(validateEmail('correo-invalido').valid, false);
});

test('Validador de Nombres y Apellidos (Solo Letras)', () => {
  assert.strictEqual(validatePersonName('Carlos Alberto').valid, true);
  assert.strictEqual(validatePersonName('María José').valid, true);
  assert.strictEqual(validatePersonName('O\'Connor').valid, true);
  assert.strictEqual(validatePersonName('Carlos123').valid, false);
  assert.strictEqual(validatePersonName('<script>alert(1)</script>').valid, false);
});

test('Blindaje C3: Detección y Bloqueo de Inyección de Código (Anti-XSS, Anti-SQLi)', () => {
  assert.strictEqual(hasCodeInjectionAttempt("<script>alert('xss')</script>"), true);
  assert.strictEqual(hasCodeInjectionAttempt("<img src=x onerror=alert(1)>"), true);
  assert.strictEqual(hasCodeInjectionAttempt("' OR '1'='1' --"), true);
  assert.strictEqual(hasCodeInjectionAttempt("admin'; DROP TABLE users; --"), true);
  assert.strictEqual(hasCodeInjectionAttempt("=cmd|'/C calc'!A0"), true);
  assert.strictEqual(hasCodeInjectionAttempt("Ricardo Alonso"), false);
  assert.strictEqual(hasCodeInjectionAttempt("San Miguel"), false);
});

test('Validador de Registro Completo de Participante', () => {
  const data = {
    nombre: 'Ricardo',
    apellido: 'Rodriguez',
    cargo: 'Alcalde Distrital Electo',
    provincia: 'Lima',
    distrito: 'San Isidro',
    whatsapp: '907772155',
    correo: 'ricardo@goberna.pe',
    aceptaTerminos: true
  };
  const res = validateRegistrationData(data);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.sanitized.whatsapp, '907772155');
});

test('Rechazo de Registro con Código Malicioso o Números Inválidos', () => {
  const maliciousData = {
    nombre: '<script>alert(1)</script>',
    apellido: 'Rodriguez',
    cargo: 'Alcalde',
    provincia: 'Lima',
    distrito: 'San Isidro',
    whatsapp: '9876543321', // 10 dígitos
    correo: 'ricardo@goberna.pe',
    aceptaTerminos: true
  };
  const res = validateRegistrationData(maliciousData);
  assert.strictEqual(res.valid, false);
  assert.ok(res.errors.nombre);
  assert.ok(res.errors.whatsapp);
});


