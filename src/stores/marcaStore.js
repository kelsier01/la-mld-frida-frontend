import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useLoginStore } from './loginStore'; // Importa el store de autenticación

const API_URL = import.meta.env.VITE_API_URL;

export const useMarcaStore = defineStore('marca', () => {
  // Estados
  const isLoading = ref(false);
  const error = ref(null);
  const marcas = ref([]);

  // Store de autenticación
  const loginStore = useLoginStore();

  // Acción para obtener las marcas
  const getMarcas = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Accede al token desde loginStore
      const token = loginStore.token;

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Realiza la solicitud HTTP con el token
      const response = await axios.get(`${API_URL}/marca`, {
        headers: {
          "x-token": token,
        },
      });

      // Actualiza el estado con las marcas obtenidas
      marcas.value = response.data;
      console.log('Marcas:', marcas.value);
    } catch (err) {
      console.error('Error al obtener las marcas:', err);
      error.value = err.response?.data?.message || 'Error al obtener las marcas';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    marcas,
    getMarcas,
  };
});