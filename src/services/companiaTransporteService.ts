import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

// API URL
const API_URL = import.meta.env.VITE_API_URL;

// Métodos
const getCompaniasTransporte = async () => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/delivery`, {
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
    throw error;
  }
};

const getAllCompaniasTransporte = async (page: number = 1) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(`${API_URL}/delivery/allDeliverys`, {
      headers: {
        "x-token": token,
      },
      params: { page },
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
const agregarCompaniaTransporte = async (delivery: { empresa: string }) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.post(`${API_URL}/delivery`, delivery, {
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

const actualizarCompaniaTransporte = async (
  id: number,
  delivery: { empresa: string }
) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);
  try {
    const response = await axios.put(`${API_URL}/delivery/${id}`, delivery, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al actualizar Delivery:", error.message);
      throw error;
    } else {
      console.error("Error desconocido al actualizar:", error);
      throw new Error("Error desconocido al actualizar Delivery");
    }
  }
};

// Método DELETE: Para eliminar una Delivery
const eliminarCompaniaTransporte = async (id: number) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);
  try {
    const response = await axios.delete(`${API_URL}/delivery/${id}`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al eliminar Delivery:", error.message);
      throw error;
    } else {
      console.error("Error desconocido al eliminar:", error);
      throw new Error("Error desconocido al eliminar Delivery");
    }
  }
};

const guardarInformacionEnvio = async (infoEnvio: {
  comprobanteVentaId: number;
  companiaTransporte: string;
  numeroSeguimiento: string;
  fechaEnvio: string;
}) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);
  try {
    const response = await axios.post(
      `${API_URL}/delivery/comprobante`,
      infoEnvio,
      {
        headers: {
          "x-token": token,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
    throw error;
  }
};

const getInformacionEnvioByComprobanteId = async (
  comprobanteVentaId: number
) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);
  try {
    const response = await axios.get(
      `${API_URL}/delivery/comprobante/${comprobanteVentaId}`,
      {
        headers: {
          "x-token": token,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
    throw error;
  }
};

export default {
  getCompaniasTransporte,
  guardarInformacionEnvio,
  getInformacionEnvioByComprobanteId,
  agregarCompaniaTransporte,
  actualizarCompaniaTransporte,
  eliminarCompaniaTransporte,
  getAllCompaniasTransporte,
};
