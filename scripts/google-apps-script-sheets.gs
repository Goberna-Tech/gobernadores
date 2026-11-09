/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — REGISTRO FORO DE ALCALDES Y GOBERNADORES 2026 (GOBERNA)
 * ============================================================================
 * INSTRUCCIONES PASO A PASO:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. En el menú superior, haz clic en "Extensiones" > "Apps Script".
 * 3. Borra cualquier código que aparezca y pega TODO este archivo.
 * 4. Haz clic en el ícono de Guardar (💾) y luego ejecuta la función
 *    "inicializarEncabezados" una vez (o deja que se cree sola al primer envío).
 * 5. Haz clic en el botón azul "Implementar" > "Nueva implementación".
 * 6. En "Selecciona el tipo" (⚙️), elige "Aplicación web".
 * 7. Configura:
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquier persona" (Importante para recibir del formulario)
 * 8. Haz clic en "Implementar", copia la URL de la aplicación web (termina en /exec)
 *    y pégala en GOOGLE_SHEETS_WEBHOOK_URL dentro de tu archivo .env o en index.html.
 * ============================================================================
 */

const SHEET_NAME = 'Registros Foro 2026';

const HEADERS = [
  'ID Registro',
  'Fecha y Hora (Perú)',
  'Nombre',
  'Apellido',
  'Whatsapp',
  'Correo',
  'Distrito',
  'Provincia o Departamento',
  'Cargo',
  'Estado'
];

/**
 * Ejecuta esta función manualmente desde el editor de Apps Script para crear
 * y dar formato a los encabezados inmediatamente, o se ejecutará sola al
 * recibir el primer registro desde "RESERVAR MI CUPO".
 */
function inicializarEncabezados() {
  const sheet = obtenerOCrearHojaConEncabezados();
  return 'Encabezados inicializados correctamente en la hoja: ' + sheet.getName();
}

function obtenerOCrearHojaConEncabezados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const lastRow = sheet.getLastRow();
  let needsHeaders = false;

  if (lastRow === 0) {
    needsHeaders = true;
  } else {
    const firstRowValues = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    const hasFirstHeader = String(firstRowValues[0] || '').trim() !== '';
    if (!hasFirstHeader) {
      needsHeaders = true;
    }
  }

  if (needsHeaders) {
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS]);
    headerRange
      .setBackground('#081229')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontFamily('Arial')
      .setFontSize(11)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    sheet.setRowHeight(1, 34);
    sheet.setFrozenRows(1);

    for (let i = 1; i <= HEADERS.length; i++) {
      sheet.setColumnWidth(i, 190);
    }
  }

  return sheet;
}

/**
 * Recibe los datos enviados desde el botón "RESERVAR MI CUPO" (POST)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = obtenerOCrearHojaConEncabezados();

    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const idRegistro = payload.id || ('REG-' + new Date().getTime().toString(36).toUpperCase());
    const fechaPeru = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
    const nuevoCorreo = String(payload.correo || '').trim().toLowerCase();
    const nuevoWhatsapp = String(payload.whatsapp || '').replace(/\D/g, '');

    // Verificación directa en la hoja de cálculo: si ya existe la fila en Google Sheets
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
      for (let i = 0; i < data.length; i++) {
        const rowWhatsapp = String(data[i][4] || '').replace(/\D/g, '');
        const rowCorreo = String(data[i][5] || '').trim().toLowerCase();
        if ((nuevoCorreo && rowCorreo === nuevoCorreo) || (nuevoWhatsapp && rowWhatsapp === nuevoWhatsapp)) {
          return ContentService
            .createTextOutput(JSON.stringify({
              success: true,
              alreadyRegistered: true,
              message: 'Ya cuentas con un cupo registrado en la lista oficial. ¡Nos vemos en el Foro!',
              id: data[i][0]
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    const rowData = [
      idRegistro,
      fechaPeru,
      String(payload.nombre || '').trim(),
      String(payload.apellido || '').trim(),
      "'" + String(payload.whatsapp || '').trim(), // Prefijo ' para conservar el + o ceros iniciales
      String(payload.correo || '').trim(),
      String(payload.distrito || '').trim(),
      String(payload.provincia || '').trim(),
      String(payload.cargo || '').trim(),
      'RESERVADO'
    ];

    sheet.appendRow(rowData);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '¡Tu cupo ha sido reservado y guardado en Google Sheets con éxito!',
        id: idRegistro
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error al guardar en Google Sheets: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Permite verificar el estado del Web App e inicializar encabezados al abrir la URL en el navegador
 */
function doGet() {
  const sheet = obtenerOCrearHojaConEncabezados();
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Webhook de Google Sheets activo y encabezados listos en la hoja: ' + sheet.getName(),
      headers: HEADERS
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

