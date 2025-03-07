import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

//APL URL
const API_URL = import.meta.env.VITE_API_URL;

//Metodos
const getLogEstadoPedido = async(pedido_id: string) =>{
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/logEstadoPedido/pedido/${pedido_id}`,{
            headers:{
                "x-token":token
            }
        });
        return response.data;
    } catch (error) {
        if(error instanceof Error){
            console.error("Error:",error.message);
        }else{
            console.error("Error desconocido:",error);
        }
    }
} 

export default {
    getLogEstadoPedido
}
