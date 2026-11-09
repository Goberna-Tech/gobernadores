/**
 * Store Reactivo Centralizado (Zero Uncontrolled Window Scope)
 * Cumple Regla de Oro 6: Desacoplamiento de window.*
 */

class ReactiveStore {
  constructor() {
    this.state = {
      eventInfo: null,
      ponentes: [],
      ejes: [],
      ruta: [],
      whatsappNumber: '907772155',
      selectedPonente: null,
      isSubmitting: false
    };
    this.listeners = new Set();
  }

  getState() {
    return { ...this.state };
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Error in store listener:', e);
      }
    }
  }
}

export const store = new ReactiveStore();

