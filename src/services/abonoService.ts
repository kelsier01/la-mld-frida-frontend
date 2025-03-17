import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";

//APL URL
const API_URL = import.meta.env.VITE_API_URL;

//Metodos
const getAbonoByPedidoId = async(pedido_id: string) =>{
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    try {
        const response = await axios.get(`${API_URL}/abono/pedido/${pedido_id}`,{
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

const postAbono = async (pedidoId: string, metodoPago: number, monto: number, pago_parcializado: number) => {
    const loginStore = useLoginStore(); // Obtén el store de login
    const token = String(loginStore.token); // Obtén el token actualizado
    const empleados_id = loginStore.user?.empleados[0].id;

    console.log("Pedido ID:", pedidoId);
    console.log("Método de pago:", metodoPago);
    console.log("Monto:", monto);
    console.log("Token:", token);
    console.log("Empleado ID:", empleados_id);

    const nuevoPago = {
        "pedidos_id": pedidoId,
        "monto": monto,
        "pago_parcializado": pago_parcializado,
        "metodos_pago_id": metodoPago,
    }

    try {
        // Crear el pago
        const pagoResponse = await axios.post(
            `${API_URL}/pago`,
            nuevoPago,
            {
                headers: {
                    "x-token": token,
                },
            }
        );
        console.log("Pago creado:", pagoResponse.data);
        const { id: pagoId } = pagoResponse.data; // Extrae el ID del pago creado

        // Crear el abono asociado al pago
        const nuevoAbono = {
            "pagos_id": pagoId,
            "monto": monto,
            "metodos_pago_id": metodoPago,
            "empleados_id": empleados_id, 
        };

        const abonoResponse = await axios.post(
            `${API_URL}/abono`,
            nuevoAbono,
            {
                headers: {
                    "x-token": token,
                },
            }
        );

        console.log("Abono creado:", abonoResponse.data);

        return abonoResponse.data; // Devuelve los datos del abono creado
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear el abono:", error.message);
        } else {
            console.error("Error desconocido al crear el abono:", error);
        }
        throw error; // Relanza el error para que el llamador lo maneje
    }
};

export default {
    getAbonoByPedidoId,
    postAbono
}
