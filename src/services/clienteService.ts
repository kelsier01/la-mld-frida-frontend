import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todos los productos
const getAllClientes = async (page: number, region: number, search: string) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.get(`${API_URL}/cliente`, {
      headers: { "x-token": token },
      params: { page, region, search },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes", error);
    throw new Error("No se pudo cargar la lista de clientes");
  }
};

// Obtener un producto por ID
const getClienteById = async (id: string) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
};

// Crear un nuevo producto
const postCliente = async () => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
};

// Exportar todos los métodos
export default {
  getAllClientes,
  getClienteById,
  postCliente,
};
