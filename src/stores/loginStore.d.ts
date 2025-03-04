// src/stores/usuarioStore.d.ts

import { Ref } from "vue";
import { Storage } from "@ionic/storage";
import { defineStore } from "pinia";

interface User {
  id: string;
  nombre: string;
  correo: string;
  // Puedes agregar más campos si es necesario
}

interface LoginState {
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  token: Ref<string | null>;
  user: Ref<User | null>;
}

interface LoginStore {
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  token: Ref<string | null>;
  user: Ref<User | null>;
  login: (n_identificacion: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<boolean>;
  isAuthenticated: Ref<boolean>;
}

declare module "@/stores/loginStore" {
  export const useLoginStore: () => LoginStore;
}
