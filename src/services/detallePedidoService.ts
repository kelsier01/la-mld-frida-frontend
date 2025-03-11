import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

//APL URL
const API_URL = import.meta.env.VITE_API_URL;

//Metodos
const getDetallePedidoByPedido_Id = async(pedido_id: string) =>{
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/detallePedido/pedido/${pedido_id}`,{
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

const postDetallePedido = async(detallePedido: any) =>{
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado

    try {
        const response = await axios.post(`${API_URL}/detallePedido`,detallePedido,{
            headers:{
                "x-token":token
            }
        });
        console.log(response.data);
    } catch (error) {
        if(error instanceof Error){
            console.error("Error:",error.message);
        }else{
            console.error("Error desconocido:",error);
        }
    }
}

export default {
    getDetallePedidoByPedido_Id,
    postDetallePedido
}
