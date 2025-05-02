import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

//APL URL
const API_URL = import.meta.env.VITE_API_URL;

//Metodos
const getMarcas = async (page: number = 1, search: string = "") => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/marca`, {
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

const getAllMarcas = async () => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/marca/all`, {
      headers: {
        "x-token": token,
      },
    });
    console.log("TODAS LAS MARCAS", response.data);
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
const agregarMarca = async (marca: { nombre: string }) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.post(`${API_URL}/marca`, marca, {
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

// Método PUT: Para actualizar una Marca existente
const actualizarMarca = async (
  id: number,
  marcaActualizada: { nombre: string }
) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.put(
      `${API_URL}/marca/${id}`,
      marcaActualizada,
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

// Método DELETE: Para eliminar una Marca
const eliminarMarca = async (id: number) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.delete(`${API_URL}/marca/${id}`, {
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
  getMarcas,
  agregarMarca,
  getAllMarcas,
  actualizarMarca,
  eliminarMarca,
};
