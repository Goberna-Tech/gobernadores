/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — REGISTRO FORO DE ALCALDES Y GOBERNADORES 2026 (GOBERNA)
 * ============================================================================
 * INSTRUCCIONES:
 * 1. En tu hoja de Google Sheets, ve a "Extensiones" > "Apps Script".
 * 2. Borra el código actual y pega TODO este archivo.
 * 3. Haz clic en Guardar (💾).
 * 4. Haz clic en "Implementar" > "Gestionar implementaciones" > Edita (icono lápiz)
 *    - Versión: "Nueva versión"
 *    - Clic en "Implementar".
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

function inicializarEncabezados() {
  const sheet = obtenerOCrearHojaConEncabezados();
  return 'Encabezados inicializados correctamente en: ' + sheet.getName();
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
 * Recibe y procesa los registros con PREVENCIÓN ESTRICTA DE DUPLICADOS
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {}

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
    const whatsappClean = String(payload.whatsapp || '').trim();
    const whatsappDigits = whatsappClean.replace(/\D/g, '');
    const correoNorm = String(payload.correo || '').trim().toLowerCase();

    // ========================================================================
    // CONTROL ANTI-DUPLICADOS: Si el WhatsApp o Correo ya existen, NO duplicar
    // ========================================================================
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();

      for (let i = 0; i < data.length; i++) {
        const rowWhatsapp = String(data[i][4] || '').replace(/\D/g, '');
        const rowCorreo = String(data[i][5] || '').trim().toLowerCase();

        const matchWhatsapp = whatsappDigits && rowWhatsapp && (whatsappDigits === rowWhatsapp);
        const matchCorreo = correoNorm && rowCorreo && (correoNorm === rowCorreo);

        if (matchWhatsapp || matchCorreo) {
          // Registro duplicado detectado: Se actualiza la fila existente en lugar de crear una nueva
          const filaExistente = i + 2;
          sheet.getRange(filaExistente, 2).setValue(fechaPeru); // Actualiza última interacción
          sheet.getRange(filaExistente, 7).setValue(String(payload.distrito || '').trim());
          sheet.getRange(filaExistente, 8).setValue(String(payload.provincia || '').trim());
          sheet.getRange(filaExistente, 9).setValue(String(payload.cargo || '').trim());

          return ContentService
            .createTextOutput(JSON.stringify({
              success: true,
              alreadyRegistered: true,
              message: '¡Tu registro ya se encontraba en la lista oficial y fue actualizado!',
              id: data[i][0]
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Si no está duplicado, se inserta la nueva fila
    const rowData = [
      idRegistro,
      fechaPeru,
      String(payload.nombre || '').trim(),
      String(payload.apellido || '').trim(),
      "'" + whatsappClean,
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
        message: 'Error al procesar registro: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

function doGet() {
  const sheet = obtenerOCrearHojaConEncabezados();
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Webhook de Google Sheets activo y encabezados listos en: ' + sheet.getName(),
      headers: HEADERS
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
