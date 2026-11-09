import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env de backend o de la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = {
  PORT: process.env.PORT || 5236,
  NODE_ENV: process.env.NODE_ENV || 'development',
  WHATSAPP_PHONE: process.env.WHATSAPP_PHONE || '907772155',
  WHATSAPP_COUNTRY_CODE: process.env.WHATSAPP_COUNTRY_CODE || '51',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  GOOGLE_SHEETS_WEBHOOK_URL: process.env.GOOGLE_SHEETS_WEBHOOK_URL || ''
};

