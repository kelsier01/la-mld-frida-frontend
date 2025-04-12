import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

//APL URL
const API_URL = import.meta.env.VITE_API_URL;

const getPedidos = async (
  page: number = 1,
  searchCliente: string = "",
  search: string = "",
  fecha_desde: string = "",
  fecha_hasta: string = "",
  estadoId: number = 0,
  regionId: number = 0,
  limit: number = 10
) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado

  try {
    const response = await axios.get(`${API_URL}/pedido`, {
      headers: { "x-token": token },
      params: {
        page,
        searchCliente,
        search,
        fecha_desde,
        fecha_hasta,
        estadoId,
        regionId,
        limit,
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

const postPedido = async (pedido: any) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  console.log("desde service", pedido);

  try {
    const response = await axios.post(`${API_URL}/pedido`, pedido, {
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

const putPedido = async (pedido: any) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  const { id } = pedido;

  try {
    const response = await axios.put(`${API_URL}/pedido/${id}`, pedido, {
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

const getPedidosByGuiaDespachoId = async (guiaDespachoId: number) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(
      `${API_URL}/pedido/guia/${guiaDespachoId}`,
      {
        headers: { "x-token": token },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

const getPedidosByComprobanteVentaId = async (comprobanteVentaId: number) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  try {
    const response = await axios.get(
      `${API_URL}/pedido/comprobante/${comprobanteVentaId}`,
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
  }
};

export default {
  getPedidos,
  postPedido,
  putPedido,
  getPedidosByGuiaDespachoId,
  getPedidosByComprobanteVentaId,
};
