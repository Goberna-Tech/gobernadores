import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { env } from '../../core/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../../data/registros_store.json');
const BACKEND_ENV_PATH = path.resolve(__dirname, '../../../.env');
const ROOT_ENV_PATH = path.resolve(__dirname, '../../../../.env');

// Asegurar existencia del directorio data
const dataDir = path.dirname(STORE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(STORE_PATH)) {
  fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2), 'utf8');
}

export class RegistroService {
  static getAll() {
    try {
      const data = fs.readFileSync(STORE_PATH, 'utf8');
      return JSON.parse(data || '[]');
    } catch {
      return [];
    }
  }

  static markAsSynced(recordId) {
    try {
      const list = this.getAll();
      let updated = false;
      for (const item of list) {
        if (item.id === recordId && !item.syncedToSheets) {
          item.syncedToSheets = true;
          updated = true;
        }
      }
      if (updated) {
        const tempPath = `${STORE_PATH}.sync.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), 'utf8');
        fs.renameSync(tempPath, STORE_PATH);
      }
    } catch {
      // Ignorar colisiones menores de archivo
    }
  }

  static async syncToGoogleSheets(record) {
    if (!record || record.syncedToSheets) return true;
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
      if (res.ok) {
        this.markAsSynced(record.id);
      }
      return res.ok;
    } catch (err) {
      console.warn('[RegistroService] No se pudo sincronizar registro externo:', err.message);
      return false;
    }
  }

  static async syncPendingRecords() {
    const list = this.getAll();
    for (const item of list) {
      if (!item.syncedToSheets) {
        await this.syncToGoogleSheets(item);
      }
    }
  }

  static create(registration) {
    const list = this.getAll();

    const newRecord = {
      id: `REG-${Date.now().toString(36).toUpperCase()}`,
      ...registration,
      fechaRegistro: new Date().toISOString()
    };

    list.push(newRecord);

    // Escritura atómica
    const tempPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tempPath, STORE_PATH);

    return newRecord;
  }

  static getStats() {
    const list = this.getAll();
    const porCargo = {};
    list.forEach(r => {
      porCargo[r.cargo] = (porCargo[r.cargo] || 0) + 1;
    });

    return {
      total: list.length,
      porCargo
    };
  }
}

