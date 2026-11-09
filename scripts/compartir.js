import os from 'os';
import { spawn, exec } from 'child_process';
import { startTunnel } from 'untun';
import localtunnel from 'localtunnel';
import { app } from '../backend/src/app.js';
import { env } from '../backend/src/core/config/env.js';

const PORT = env.PORT || 5236;

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

async function getPublicIp() {
  try {
    const res = await fetch('https://api.ipify.org', { signal: AbortSignal.timeout(2500) });
    if (res.ok) return (await res.text()).trim();
  } catch {}
  try {
    const res = await fetch('https://ipv4.icanhazip.com', { signal: AbortSignal.timeout(2500) });
    if (res.ok) return (await res.text()).trim();
  } catch {}
  return null;
}

function copyToClipboard(text) {
  try {
    if (process.platform === 'win32') {
      const proc = spawn('clip');
      proc.stdin.write(text);
      proc.stdin.end();
    }
  } catch {}
}

async function isServerRunning(port) {
  try {
    const res = await fetch(`http://localhost:${port}/api/info`, { signal: AbortSignal.timeout(1500) });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function main() {
  console.log('\n============================================================');
  console.log(' 🏛️   FORO DE ALCALDES Y GOBERNADORES 2026');
  console.log(' 🚀  Generador de Enlace Público para Compartir');
  console.log('============================================================');

  let server = null;
  const alreadyRunning = await isServerRunning(PORT);

  if (alreadyRunning) {
    console.log(` [✓] Servidor local detectado activo en http://localhost:${PORT}`);
  } else {
    console.log(` [*] Iniciando servidor local en puerto ${PORT}...`);
    try {
      server = await new Promise((resolve, reject) => {
        const s = app.listen(PORT, () => resolve(s));
        s.on('error', reject);
      });
      console.log(` [✓] Servidor local iniciado correctamente.`);
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.log(` [✓] Puerto ${PORT} en uso, conectando al servidor activo...`);
      } else {
        console.error(' [!] Error al iniciar el servidor local:', err.message);
      }
    }
  }

  const localIp = getLocalIp();
  const localUrl = `http://localhost:${PORT}`;
  const networkUrl = `http://${localIp}:${PORT}`;

  console.log(' [*] Estableciendo túnel público seguro...');

  let publicUrl = null;
  let tunnelProvider = '';
  let activeTunnel = null;
  let tunnelPassword = null;

  // 1. Intentar Cloudflare Quick Tunnel (acceso directo sin contraseñas)
  try {
    const cfTunnel = await startTunnel({ port: PORT });
    publicUrl = await cfTunnel.getURL();
    tunnelProvider = 'Cloudflare Quick Tunnel (Acceso directo mundial)';
    activeTunnel = cfTunnel;
  } catch (cfErr) {
    console.log(' [!] Cloudflare no disponible o bloqueado, intentando Localtunnel...');
  }

  // 2. Si Cloudflare no dio URL, intentar Localtunnel
  if (!publicUrl) {
    try {
      const sub = `goberna-${Math.floor(100000 + Math.random() * 900000)}`;
      const ltTunnel = await localtunnel({ port: PORT, subdomain: sub });
      publicUrl = ltTunnel.url;
      tunnelProvider = 'Localtunnel';
      activeTunnel = ltTunnel;
      tunnelPassword = await getPublicIp();
    } catch (ltErr) {
      console.warn(' [!] Localtunnel error:', ltErr.message);
    }
  }

  if (publicUrl) {
    copyToClipboard(publicUrl);
    if (process.env.OPEN_BROWSER !== 'false') {
      const cmd = process.platform === 'win32' ? `start "" "${publicUrl}"` : `open "${publicUrl}"`;
      exec(cmd, () => {});
    }
  }

  console.log(`
============================================================
  🌟  ¡ENLACE PÚBLICO LISTO PARA COMPARTIR!
============================================================

  📲 ENLACE PARA CELULARES Y CUALQUIER PERSONA EN EL MUNDO:
     👉  ${publicUrl || networkUrl}
     ${publicUrl ? '✅ ¡Copiado a tu portapapeles! Pégalo con CTRL + V en WhatsApp.' : '⚠️ No se pudo crear enlace exterior; usa el enlace Wi-Fi.'}
     Proveedor: ${tunnelProvider || 'Red Local'}
${tunnelPassword ? `     🔑 Contraseña de acceso para Localtunnel (si te la pide en el celular): ${tunnelPassword}\n` : ''}
  📶 ENLACE EN TU MISMA RED WI-FI (Mismo router/oficina):
     👉  ${networkUrl}

  💻 NAVEGADOR EN ESTA COMPUTADORA:
     👉  ${localUrl}

  💬 WHATSAPP OFICIAL ASOCIADO:
     👉  +51 907772155

============================================================
  Instrucciones:
  1. Comparte el enlace público por WhatsApp a las autoridades o invitados.
  2. Podrán abrirlo desde cualquier teléfono o laptop en cualquier país.
  3. Para apagar el servicio, presiona CTRL + C en esta ventana.
============================================================
`);

  if (activeTunnel && activeTunnel.on) {
    activeTunnel.on('close', () => console.log('Túnel público cerrado.'));
  }

  const cleanup = () => {
    if (activeTunnel && typeof activeTunnel.close === 'function') activeTunnel.close();
    if (server) server.close();
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

main().catch(err => {
  console.error('Error fatal al compartir enlace:', err);
});
