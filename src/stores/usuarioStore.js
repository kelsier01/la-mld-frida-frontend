import { defineStore } from "pinia";

export const useUsuarioStore = defineStore("usuario", {
  state: () => ({
    usuario: null,
  }),
  actions: {
    setUsuario(usuario) {
      this.usuario = usuario;
    },
  },
});
