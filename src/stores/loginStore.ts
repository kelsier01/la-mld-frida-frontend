import axios, { AxiosError } from "axios";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { Storage } from "@ionic/storage";
import { jwtDecode } from "jwt-decode";
import usuarioService from "../services/usuarioService";
import { Usuario } from "../interfaces/interfaces";


const API_URL = import.meta.env.VITE_API_URL;
const storage = new Storage();
storage.create(); // Inicializa Ionic Storage

export const useLoginStore = defineStore("login", () => {
  // Estado (refs)
  const isLoading = ref<boolean>(false);
  const error = ref<AxiosError | null>(null);
  const token = ref<string | undefined>('');
  const user = ref<Usuario | undefined>();

  // Función para verificar la expiración del token
  const isTokenExpired = (token: string) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp ? decoded.exp < currentTime : true;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return true;
    }
  };

  // Acción para realizar el login
  const login = async (n_identificacion:string, password:string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: n_identificacion,
        password: password,
      });

      // Actualiza el estado con la respuesta
      const { id } = response.data.user;
      const userResponse = await usuarioService.getUsuarioById(id);

      token.value = response.data.token;
      console.log("token desde el login",token.value);
      console.log("user desde el login en LoginStore", userResponse);


      await storage.set("authToken", token.value);
      await storage.set("user", userResponse);

      const userStore = await storage.get("user");
      console.log("userStore", userStore);

    } catch (err) {
      console.error("Error en el login:", err);
      error.value = (err as any).response?.data?.message || "Error de autenticación";
    } finally {
      isLoading.value = false;
    }
  };

  // Acción para cerrar sesión
  const logout = async () => {
    token.value = '';
    user.value = undefined;
    await storage.remove("authToken"); // Elimina el token del almacenamiento
    await storage.remove("user"); // Elimina el usuario del almacenamiento
  };

  // Acción para inicializar la autenticación
  const initializeAuth = async () => {
    const storedToken = await storage.get("authToken");
    const storedUser = await storage.get("user");
    if (storedToken && !isTokenExpired(storedToken)) {
      token.value = storedToken;
      user.value = storedUser;
      console.log("Token valido y no expirado", token.value);
      console.log("Usuario", user.value);
      return true;
    } else {
      console.log("Token expirado o no encontrado");
      await logout(); // Cierra la sesión si el token ha expirado
      return false;
    }
  };

  // Getter para verificar si el usuario está autenticado
  const isAuthenticated = computed(
    () => !!token.value && !isTokenExpired(token.value)
  );

  // Retorna el estado, acciones y getters
  return {
    isLoading,
    error,
    token,
    user,
    login,
    logout,
    initializeAuth,
    isAuthenticated,
  };
});
