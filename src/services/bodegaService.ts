import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL;

// Método GET (ya proporcionado)
const getBodegas = async () => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/bodega`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

const getBodegaById = async (id: number) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/bodega/${id}`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

// Método POST: Para agregar una nueva bodega
const agregarBodega = async (nuevaBodega: {
  nombre: string;
  ubicacion: string;
}) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.post(`${API_URL}/bodega`, nuevaBodega, {
      headers: {
        "x-token": token,
      },
    });
    return response.data; // Devuelve la respuesta de la API
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

// Método PUT: Para actualizar una bodega existente
const actualizarBodega = async (
  id: number,
  bodegaActualizada: { nombre: string; ubicacion: string }
) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.put(
      `${API_URL}/bodega/${id}`,
      bodegaActualizada,
      {
        headers: {
          "x-token": token,
        },
      }
    );
    return response.data; // Devuelve la respuesta de la API
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

// Método DELETE: Para eliminar una bodega
const eliminarBodega = async (id: number) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.delete(`${API_URL}/bodega/${id}`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data; // Devuelve la respuesta de la API
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

export default {
  getBodegas,
  getBodegaById,
  agregarBodega,
  actualizarBodega,
  eliminarBodega,
};
