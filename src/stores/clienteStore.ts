import { defineStore } from 'pinia';
import { Cliente } from '@/interfaces/interfaces';

export const useClientesStore = defineStore('clientes', {
  state: () => ({
    cliente: null as Cliente | null,
    clienteEliminado: false,
    ultimoClienteEliminadoId: null as string | number | null,
  }),
  actions: {
    setCliente(cliente: Cliente) {
      this.cliente = cliente;
    },
    getCliente(): Cliente | null {
      return this.cliente;
    },
    marcarClienteEliminado(clienteId: string | number) {
      this.clienteEliminado = true;
      this.ultimoClienteEliminadoId = clienteId;
      // Si el cliente eliminado es el actual, limpiamos la referencia
      if (this.cliente && this.cliente.id === clienteId) {
        this.cliente = null;
      }
    },
    resetClienteEliminado() {
      this.clienteEliminado = false;
      this.ultimoClienteEliminadoId = null;
    }
  }
});
