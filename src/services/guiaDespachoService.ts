import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

// APL URL
const API_URL = import.meta.env.VITE_API_URL;

// Métodos
const getGuiasDespacho = async (page: number = 1, regionId: number | null = null, search: string = '') => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/guiaDespacho`, {
            headers: {
                "x-token": token
            },
            params: { page, regionId, search }
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

const postGuiaDespacho = async (guiaDespacho: any) => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.post(`${API_URL}/guiaDespacho`, guiaDespacho, {
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

const getGuiaDespachoById = async (id: number) => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/guiaDespacho/${id}`, {
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

export default {
    getGuiasDespacho,
    postGuiaDespacho,
    getGuiaDespachoById
}
