import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useLoginStore } from './loginStore'; // Importa el store de autenticación

const API_URL = import.meta.env.VITE_API_URL;

export const useCategoriaStore = defineStore('categoria', () => {
  // Estados
  const isLoading = ref(false);
  const error = ref(null);
  const categorias = ref([]);

  // Store de autenticación
  const loginStore = useLoginStore();

  // Acción para obtener las categorías
  const getCategorias = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Accede al token desde loginStore
      const token = loginStore.token;

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Realiza la solicitud HTTP con el token
      const response = await axios.get(`${API_URL}/categoria`, {
        headers: {
          "x-token": token,
        },
      });

      // Actualiza el estado con las categorías obtenidas
      categorias.value = response.data;
      console.log('Categorías:', categorias.value);
    } catch (err) {
      console.error('Error al obtener las categorías:', err);
      error.value = err.response?.data?.message || 'Error al obtener las categorías';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    categorias,
    getCategorias,
  };
});