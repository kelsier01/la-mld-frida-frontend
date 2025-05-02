import { defineStore } from "pinia";

export const useNavigationStore = defineStore("navigation", {
  state: () => ({
    shouldRefreshUsers: false,
  }),
  actions: {
    setShouldRefresh(value: boolean): void {
      this.shouldRefreshUsers = value;
    },
  },
});
