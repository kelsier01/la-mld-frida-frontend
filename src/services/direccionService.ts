import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

// API URL desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL;

// 👉 Obtener todas las direcciones (opcional)
const getDirecciones = async () => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.get(`${API_URL}/direccion`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 👉 Obtener dirección por ID
const getDireccionById = async (direccion_id: string) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.get(`${API_URL}/direccion/${direccion_id}`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 👉 Crear una nueva dirección
const postDireccion = async (direccionData: any) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.post(`${API_URL}/direccion`, direccionData, {
      headers: {
        "x-token": token,
      },
    });
    console.log("Dirección creada:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 👉 Actualizar dirección por ID
const putDireccion = async (direccion_id: number, direccionData: any) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.put(
      `${API_URL}/direccion/${direccion_id}`,
      direccionData,
      {
        headers: {
          "x-token": token,
        },
      }
    );
    console.log("Dirección actualizada:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 👉 Eliminar dirección por ID
const deleteDireccion = async (direccion_id: string) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.delete(
      `${API_URL}/direccion/${direccion_id}`,
      {
        headers: {
          "x-token": token,
        },
      }
    );
    console.log("Dirección eliminada:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 👉 Manejo de errores
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Error desconocido:", error);
  }
};

export default {
  getDirecciones,
  getDireccionById,
  postDireccion,
  putDireccion,
  deleteDireccion,
};
