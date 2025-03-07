import { defineStore } from 'pinia';
import { Cliente } from '@/interfaces/interfaces';

export const useClientesStore = defineStore('clientes', {
  state: () => ({
    cliente: null as Cliente | null,
  }),
  actions: {
    setCliente(cliente: Cliente) {
      this.cliente = cliente;
    },
    getCliente(): Cliente | null {
      return this.cliente;
    }
  }
});
