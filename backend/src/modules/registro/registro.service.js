import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../core/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ENV_PATH = path.resolve(__dirname, '../../../.env');
const ROOT_ENV_PATH = path.resolve(__dirname, '../../../../.env');

export class RegistroService {
  /**
   * Envía el registro directamente a Google Sheets
   */
  static async syncToGoogleSheets(record) {
    if (!record) return false;
    dotenv.config({ path: BACKEND_ENV_PATH, override: true });
    dotenv.config({ path: ROOT_ENV_PATH, override: true });
    const webhookUrl = (process.env.GOOGLE_SHEETS_WEBHOOK_URL || env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim();
    if (!webhookUrl) return false;

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(record),
        redirect: 'follow'
      });
      return res.ok;
    } catch (err) {
      console.warn('[RegistroService] Error al enviar a Google Sheets:', err.message);
      return false;
    }
  }

  /**
   * Genera el ID y metadatos en memoria (sin almacenar en archivos JSON locales)
   */
  static create(registration) {
    const newRecord = {
      id: `REG-${Date.now().toString(36).toUpperCase()}`,
      ...registration,
      fechaRegistro: new Date().toISOString()
    };

    return newRecord;
  }

  static getStats() {
    return {
      total: 0,
      porCargo: {}
    };
  }
}
