import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

//APL URL
const API_URL = import.meta.env.VITE_API_URL;

//Metodos
// const getPedido = async() =>{
//     const loginStore = useLoginStore(); // Obtén el store de login
//     const token = String(loginStore.token); // Obtén el token actualizado
//     try {
//         const response = await axios.get(`${API_URL}/pedido`,{
//             headers:{
//                 "x-token":token
//             }
//         });
//         return response.data;
//     } catch (error) {
//         if(error instanceof Error){
//             console.error("Error:",error.message);
//         }else{
//             console.error("Error desconocido:",error);
//         }
//     }
// } 

const getPedidos = async (
    page: number,
    clienteId: number,
    search: string,
    fecha_desde: string,  
    fecha_hasta: string,    
    estadoId: number,       
    regionId: number        
  ) => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    console.log(
      `page ${page}, clienteId ${clienteId}, search ${search}, fecha desde ${fecha_desde}, fecha hasta ${fecha_hasta}, estadoId ${estadoId}, regionId ${regionId}`
    );
  
    try {
      const response = await axios.get(`${API_URL}/pedido`, {
        headers: { "x-token": token },
        params: {
          page,
          clienteId,
          search,
          fecha_desde,
          fecha_hasta,        
          estadoId,         
          regionId,
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
  

const postPedido = async(pedido: any) =>{
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    console.log("desde service",pedido);

    try {
        const response = await axios.post(`${API_URL}/pedido`,pedido,{
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
    getPedidos,
    postPedido
}
