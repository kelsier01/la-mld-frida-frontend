import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

//APL URL
const API_URL = import.meta.env.VITE_API_URL;

//Metodos
const getCategoria = async (page: number = 1, search: string = "") => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/categoria`, {
      headers: {
        "x-token": token,
      },
      params: { page, search },
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

const getAllCategorias = async () => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/categoria/all`, {
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

// Método POST: Para agregar una nueva categoria
const agregarCategoria = async (categoria: { nombre: string }) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.post(`${API_URL}/categoria`, categoria, {
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

const actualizarCategoria = async (
  id: number,
  categoria: { nombre: string }
) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);
  try {
    const response = await axios.put(`${API_URL}/categoria/${id}`, categoria, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al actualizar categoría:", error.message);
      throw error;
    } else {
      console.error("Error desconocido al actualizar:", error);
      throw new Error("Error desconocido al actualizar categoría");
    }
  }
};

// Método DELETE: Para eliminar una categoría
const eliminarCategoria = async (id: number) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);
  try {
    const response = await axios.delete(`${API_URL}/categoria/${id}`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al eliminar categoría:", error.message);
      throw error;
    } else {
      console.error("Error desconocido al eliminar:", error);
      throw new Error("Error desconocido al eliminar categoría");
    }
  }
};

export default {
  getCategoria,
  agregarCategoria,
  getAllCategorias,
  actualizarCategoria,
  eliminarCategoria,
};
