import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todos los productos
const getAllUsuarios = async () => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.get(`${API_URL}/usuario`, {
      headers: { "x-token": token },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes", error);
    throw new Error("No se pudo cargar la lista de clientes");
  }
};

// Obtener un producto por ID
const getUsuarioById = async (id: number) => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado

    try {
        const response = await axios.get(`${API_URL}/usuario/${id}`, {
        headers: {
            "x-token": token, // Usa el token actualizado
        },
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener el usuario", error);
        throw new Error("No se pudo cargar el usuario");
    }
};


// Exportar todos los métodos
export default {
  getAllUsuarios,
  getUsuarioById,
};
