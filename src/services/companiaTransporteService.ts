import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";


// API URL
const API_URL = import.meta.env.VITE_API_URL;

// Métodos
const getCompaniasTransporte = async() => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/delivery`, {
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
        throw error;
    }
};

const guardarInformacionEnvio = async(infoEnvio: {
    comprobanteVentaId: number,
    companiaTransporte: string,
    numeroSeguimiento: string,
    fechaEnvio: string
}) => {
    const loginStore = useLoginStore();
    const token = String(loginStore.token);
    try {
        const response = await axios.post(`${API_URL}/delivery/comprobante`, infoEnvio, {
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
        throw error;
    }
};

const getInformacionEnvioByComprobanteId = async(comprobanteVentaId: number) => {
    const loginStore = useLoginStore();
    const token = String(loginStore.token);
    try {
        const response = await axios.get(`${API_URL}/delivery/comprobante/${comprobanteVentaId}`, {
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
        throw error;
    }
};

export default {
    getCompaniasTransporte,
    guardarInformacionEnvio,
    getInformacionEnvioByComprobanteId
};