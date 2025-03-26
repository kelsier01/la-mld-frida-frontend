import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL;

// Método GET: Para obtener todos los productos de bodegas
const getProductosBodega = async () => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/productoBodega`, {
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

// Método POST: Para agregar un nuevo producto a una bodega
const agregarProductoBodega = async (nuevoProductoBodega: {
  productos_id: number;
  bodegas_id: number;
  stock: number;
}) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.post(`${API_URL}/productoBodega`, nuevoProductoBodega, {
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

// Método PUT: Para actualizar un producto en una bodega
const actualizarProductoBodega = async (
  id: number,
  productoActualizado: { 
    productos_id?: number;
    bodegas_id?: number;
    stock?: number;
  }
) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.put(
      `${API_URL}/productoBodega/${id}`,
      productoActualizado,
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

// Método DELETE: Para eliminar un producto de una bodega
const eliminarProductoBodega = async (id: number) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.delete(`${API_URL}/productoBodega/${id}`, {
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
  getProductosBodega,
  agregarProductoBodega,
  actualizarProductoBodega,
  eliminarProductoBodega,
};