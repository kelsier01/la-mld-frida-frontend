import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

// APL URL
const API_URL = import.meta.env.VITE_API_URL;

// Métodos
const getComprobantesVenta = async () => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/comprobanteVenta`, {
            headers: {
                "x-token": token
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", error);
        }
    }
}

const postComprobanteVenta = async (comprobanteVenta: any) => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.post(`${API_URL}/comprobanteVenta`, comprobanteVenta, {
            headers: {
                "x-token": token
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", error);
        }
    }
}

const getComprobanteVentaById = async (id: number) => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/comprobanteVenta/${id}`, {
            headers: {
                "x-token": token
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", error);
        }
    }
}

const actualizarComprobanteVenta = async (id: number, comprobanteVenta: any) => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.put(`${API_URL}/comprobanteVenta/${id}`, comprobanteVenta, {
            headers: {
                "x-token": token
            }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", error);
        }
    }
}

const generarCodigo = async () =>{
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/comprobanteVenta/generar/codigo`, {
            headers: {
                "x-token": token
            }
        });
        return response.data.codigo;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", error);
        }
    }
}

export default {
    getComprobantesVenta,
    postComprobanteVenta,
    getComprobanteVentaById,
    actualizarComprobanteVenta,
    generarCodigo
}