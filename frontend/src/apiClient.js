/**
 * Cliente API desacoplado con Cero Exposición Técnica
 */

export class ApiClient {
  static async get(endpoint) {
    try {
      const res = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] Failed to fetch ${endpoint}:`, err.message);
      return null;
    }
  }

  static async post(endpoint, data) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(json.message || 'Error en el servidor');
      err.errors = json.errors;
      throw err;
    }
    return json;
  }
}

