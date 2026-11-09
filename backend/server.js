// backend/server.js - Bootstrap del Servidor Oficial
import { exec } from 'child_process';
import { app } from './src/app.js';
import { env } from './src/core/config/env.js';

const PORT = env.PORT || 5236;

const server = app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`
============================================================
 🏛️  FORO DE ALCALDES Y GOBERNADORES 2026 INICIADO
 🚀  Plataforma Web & API: ${url}
 💬  WhatsApp Oficial: +51 ${env.WHATSAPP_PHONE}
============================================================
  Abriendo la plataforma en tu navegador web...
  Para detener el servidor presiona CTRL + C en esta ventana.
============================================================`);

  if (process.env.OPEN_BROWSER !== 'false') {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`;
    exec(cmd, () => {});
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const url = `http://localhost:${PORT}`;
    console.log(`
============================================================
 ℹ️  EL SERVIDOR YA ESTABA EN EJECUCIÓN
 🚀  Plataforma Web activa en: ${url}
 💬  WhatsApp Oficial: +51 ${env.WHATSAPP_PHONE}
============================================================
  Abriendo la plataforma en tu navegador web...
  Para apagar completamente el servidor, cierra todas las ventanas
  de comando activas de Goberna.
============================================================`);
    if (process.env.OPEN_BROWSER !== 'false') {
      const cmd = process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`;
      exec(cmd, () => {});
    }
  } else {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
