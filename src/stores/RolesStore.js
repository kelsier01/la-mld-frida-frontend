import { defineStore } from "pinia";

export const useRolesStore = defineStore("roles", {
  state: () => ({
    roles: null,
  }),
  actions: {
    setRoles(roles) {
      this.roles = roles;
    },
  },
});
