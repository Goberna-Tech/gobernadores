import { app } from '../src/app.js';
import assert from 'node:assert';
import test from 'node:test';

test('Test de Integración de Endpoints del Foro', async () => {
  const server = app.listen(3002);
  try {
    // 1. Test GET /api/info
    const resInfo = await fetch('http://localhost:3002/api/info');
    assert.strictEqual(resInfo.status, 200);
    const dataInfo = await resInfo.json();
    assert.strictEqual(dataInfo.success, true);
    assert.strictEqual(dataInfo.data.info.whatsapp.number, '907772155');

    // 2. Test GET /api/ponentes
    const resPonentes = await fetch('http://localhost:3002/api/ponentes');
    assert.strictEqual(resPonentes.status, 200);
    const dataPonentes = await resPonentes.json();
    assert.strictEqual(dataPonentes.data.length, 4);

    // 3. Test GET / (HTML shell)
    const resHtml = await fetch('http://localhost:3002/');
    assert.strictEqual(resHtml.status, 200);
    const html = await resHtml.text();
    assert.ok(html.includes('907772155'), 'HTML must contain whatsapp 907772155');
    assert.ok(html.includes('FORO DE') && html.includes('ALCALDES') && html.includes('GOBERNADORES'), 'HTML must contain title');
  } finally {
    server.close();
  }
});
