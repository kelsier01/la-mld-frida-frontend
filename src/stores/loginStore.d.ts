// src/stores/usuarioStore.d.ts

import { Ref } from "vue";
import { Storage } from "@ionic/storage";
import { defineStore } from "pinia";
import { Usuario } from "@/interfaces/interfaces";

interface LoginState {
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  token: Ref<string | null>;
  user: Ref<Usuario | null>;
}

interface LoginStore {
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  token: Ref<string | null>;
  user: Ref<Usuario | null>;
  login: (n_identificacion: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<boolean>;
  isAuthenticated: Ref<boolean>;
}

declare module "@/stores/loginStore" {
  export const useLoginStore: () => LoginStore;
}
