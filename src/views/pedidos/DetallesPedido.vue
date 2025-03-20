<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        default-href="/pedidos"
                        text="Volver"
                    />
                </ion-buttons>
                <ion-title>Detalles del Pedido</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="abrirModalEditar">
                        <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="confirmarEliminarProducto" color="danger">
                        <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-segment v-model="segmentoActivo">
                <ion-segment-button value="detalles">
                    Detalles
                </ion-segment-button>
                <ion-segment-button value="abonos">
                    Abonos
                </ion-segment-button>
            </ion-segment>
            
            <div v-if="segmentoActivo === 'detalles'">
                <ion-list>
                    <ion-list-header>
                        Cliente
                    </ion-list-header>
                    <ion-item>
                        <ion-label>Cliente</ion-label>
                        <ion-text color="dark">{{ cliente?.persona?.nombre }}</ion-text>
                    </ion-item>
                    <ion-item>
                        <ion-label>Direccion</ion-label>
                        <ion-text color="dark">{{ direccion_pedido }}</ion-text>
                    </ion-item>
                    <ion-item>
                        <ion-label>Email</ion-label>
                        <ion-text color="dark">{{ cliente?.persona?.correo}}</ion-text>
                    </ion-item>
                    <ion-item>
                        <ion-label>Telefono</ion-label>
                        <ion-text color="dark">{{ cliente?.persona?.fono }}</ion-text>
                    </ion-item>
                    <ion-item>
                        <ion-label>Estado del Pedido</ion-label>
                        <ion-chip color="success" v-if="logEstadoPedido && logEstadoPedido.length > 0">{{ logEstadoPedido[logEstadoPedido.length - 1].estado.estado_pedido}}</ion-chip>
                    </ion-item>
                </ion-list>
                <ion-list>
                    <ion-list-header>
                        Historial del Pedido
                    </ion-list-header>
                    <ion-item v-for="log in logEstadoPedido" :key="log.id">
                        <ion-label>{{ formatDate(log.createdAt) }}</ion-label>
                        <ion-chip :color="getEstadoColor(log.estado_pedidos_id)">{{ log.estado.estado_pedido}}</ion-chip>
                    </ion-item>
                </ion-list>
                <ion-grid>
                    <ion-row>
                        <ion-col size="12" size-md="6" size-lg="4" v-for="(detallePedido, index) in detallePedido" :key="index">
                           <ProductoResumenCard 
                                :detallePedido="detallePedido" 
                            />
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>

            <div v-if="segmentoActivo === 'abonos'">
                <ion-card>
                    <ion-card-header>
                    <ion-card-title>
                        <ion-icon :icon="cardOutline"></ion-icon>
                        Total Pedido
                    </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                    <ion-text color="primary">
                        <h1>${{ totalValoresPedido.totalPedido }}</h1>
                    </ion-text>
                    </ion-card-content>
                </ion-card>

                <ion-card>
                    <ion-card-header>
                    <ion-card-title>
                        <ion-icon :icon="cardOutline"></ion-icon>
                        Total Abono
                    </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                    <ion-text color="primary">
                        <h1>${{ totalValoresPedido.totalAbono }}</h1>
                    </ion-text>
                    </ion-card-content>
                </ion-card>

                <ion-card>
                    <ion-card-header>
                    <ion-card-title>
                        <ion-icon :icon="cardOutline"></ion-icon>
                        Saldo Pendiente
                    </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                    <ion-text color="primary">
                        <h1>${{ totalValoresPedido.totalPedido -  totalValoresPedido.totalAbono}}</h1>
                    </ion-text>
                    </ion-card-content>
                </ion-card>

                <ion-grid>
                    <ion-row>
                        <ion-col size="12">
                            <ion-item>
                                <ion-select 
                                    label="Metodo de Pago"
                                    v-model="metodoPagoSeleccionado"
                                    >
                                    <ion-select-option 
                                        v-for="metodo in metodoPago"
                                        :key="metodo.id"
                                        :value="metodo.id"
                                        >{{ metodo.nombre}}
                                    </ion-select-option>
                                </ion-select>
                            </ion-item>
                        </ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="6">
                            <ion-item>
                                <ion-input 
                                    v-model="montoAbono"
                                    type="number" 
                                    label="Monto Abono" 
                                    label-placement="stacked"
                                />
                            </ion-item>
                        </ion-col>
                        <ion-col size="6">
                            <ion-button 
                            expand="full"
                            @click="registrarAbono"
                            >Abonar</ion-button>
                        </ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="12">
                            <ion-list>
                                <ion-list-header>
                                    Historial de Abonos
                                </ion-list-header>
                                <ion-item v-for="abono in abonos" :key="abono.id">
                                    <ion-label><strong>{{ formatDate(abono.createdAt) }}</strong></ion-label>
                                    <ion-text color="success">+${{ abono.monto }}</ion-text>
                                </ion-item>
                            </ion-list>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue';
import { cardOutline, pencil, trashOutline } from 'ionicons/icons';
import { useRouter, useRoute } from 'vue-router';
import ProductoResumenCard from '@/components/ProductoResumenCard.vue';
import { Abono, Cliente, LogEstadoPedido, MetodoPago } from '@/interfaces/interfaces';
import { useClientesStore } from '@/stores/clienteStore';
import logEstadoPedidoService from '@/services/logEstadoPedidoService';
import detallePedidoService from '@/services/detallePedidoService';
import abonoService from '@/services/abonoService';
import { DetallePedido } from '@/interfaces/interfaces';
import metodoPagoService from '@/services/metodoPagoService';


const router = useRouter();
const route = useRoute();
const pedidoId = ref<string>(String(route.params.id));
const clientesStore = useClientesStore();
const cliente = ref<Cliente>()
const logEstadoPedido = ref<LogEstadoPedido[]>();
const detallePedido = ref<DetallePedido[]>();
const abonos = ref<Abono[]>([]);
const metodoPago = ref<MetodoPago[]>();
const totalValoresPedido = ref<any>({
    totalPedido: 0,
    totalAbono: 0,
    saldoPendiente: 0
});
const segmentoActivo = ref('detalles'); // Control del segmento activo
const montoAbono = ref<number>(0); // Monto del abono
const metodoPagoSeleccionado = ref<number>(0); // Metodo de pago seleccionado
const direccion_pedido = ref<string>('');

const direccionPedido = () => {
    if (!detallePedido.value || detallePedido.value.length === 0) {
        direccion_pedido.value = 'N/D';
        return;
    }

    direccion_pedido.value = detallePedido.value[0]?.Pedido?.Direccion?.direccion ?? 'N/D';
};

// Datos del producto (simulados)
const producto = ref({
    codigo: "001",
    nombre: "Televisor 50 pulgadas",
    precioUSD: 500,
    stockPorBodega: { "Bodega 1": 10, "Bodega 2": 5 },
    tipo: "electrónica",
    marca: "Sony",
});

const getEstadoColor = (estado: number) => {
  return ['warning', 'success', 'danger', 'primary', 'secondary'][estado - 1] || 'primary';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const registrarAbono = async () =>{
    const nuevoAbono = ref<Abono>();
    console.log("pedidoId", pedidoId.value);
    if (montoAbono.value !== undefined) {
        nuevoAbono.value = await abonoService.postAbono(
            pedidoId.value,
            metodoPagoSeleccionado.value,
            montoAbono.value,
            1
        );

        if (nuevoAbono.value) {
            abonos.value.push(nuevoAbono.value);
        }

    } else {
        console.error("Monto Abono is undefined");
    }
}

// Método para calcular el total de abonos
const totalMontoAbonos = (abonos: Abono[]) => {
    return abonos.reduce((total, abono) => total + Number(abono.monto), 0);
};

// Método para calcular el total del pedido
const totalPrecioPedido = () => {
    return detallePedido.value?.reduce((total, detalle) => total + detalle.cantidad * detalle.precio_venta, 0) || 0;
};

// Watch para abonos
watch(abonos, (newAbonos) => {
    totalValoresPedido.value.totalAbono = totalMontoAbonos(newAbonos);
    totalValoresPedido.value.saldoPendiente = totalValoresPedido.value.totalPedido - totalValoresPedido.value.totalAbono;
}, { deep: true });

// Modal de edición
const modalEditarAbierto = ref(false);
const productoEditado = ref({ ...producto.value });

const abrirModalEditar = () => {
    productoEditado.value = { ...producto.value };
    modalEditarAbierto.value = true;
};

const cerrarModalEditar = () => {
    modalEditarAbierto.value = false;
};

const guardarCambios = () => {
    producto.value = { ...productoEditado.value };
    cerrarModalEditar();
};

// Modal de edición de stock
const modalEditarStockAbierto = ref(false);
const bodegaEditada = ref("");
const stockEditado = ref({ cantidad: 0 });

const abrirModalEditarStock = (bodega: string) => {
    bodegaEditada.value = bodega;
    stockEditado.value.cantidad = producto.value.stockPorBodega[bodega];
    modalEditarStockAbierto.value = true;
};

const cerrarModalEditarStock = () => {
    modalEditarStockAbierto.value = false;
};

const guardarCambiosStock = () => {
    producto.value.stockPorBodega[bodegaEditada.value] = stockEditado.value.cantidad;
    cerrarModalEditarStock();
};

// Confirmación y eliminación de stock
const confirmarEliminarStock = async (bodega: string) => {
    const alert = await alertController.create({
        header: 'Eliminar Stock',
        message: `¿Estás seguro de eliminar el stock de ${bodega}?`,
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', handler: () => eliminarStock(bodega) }
        ],
    });
    await alert.present();
};

const eliminarStock = (bodega: string) => {
    delete producto.value.stockPorBodega[bodega];
};

// Confirmación y eliminación del producto
const confirmarEliminarProducto = async () => {
    const alert = await alertController.create({
        header: 'Eliminar Producto',
        message: '¿Estás seguro de eliminar este producto?',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', handler: eliminarProducto }
        ],
    });
    await alert.present();
};

const eliminarProducto = () => {
    console.log("Producto eliminado:", producto.value);
    router.push({ name: 'Productos' });
};


onMounted(async ()=>{
    detallePedido.value = await detallePedidoService.getDetallePedidoByPedido_Id(pedidoId.value);
    console.log("detalle del pedido",detallePedido.value);
    abonos.value = await abonoService.getAbonoByPedidoId(pedidoId.value);
    metodoPago.value = await metodoPagoService.getMetodoPago() ?? undefined;
    logEstadoPedido.value = await logEstadoPedidoService.getLogEstadoPedido(pedidoId.value);
    console.log("estado del pedido",logEstadoPedido.value);
    console.log("route", pedidoId.value);
    cliente.value = clientesStore.getCliente() ?? undefined;
    totalValoresPedido.value.totalPedido = totalPrecioPedido();
    totalValoresPedido.value.totalAbono = totalMontoAbonos(abonos.value);
    totalValoresPedido.value.saldoPendiente = totalValoresPedido.value.totalPedido - totalValoresPedido.value.totalAbono;
    direccionPedido();
}); 
</script>

<style scoped>
/* Estilos personalizados si es necesario */
ion-card-header {
  padding-bottom: 8px; /* Reducir el espacio inferior del encabezado */
}

ion-card-title {
  display: flex;
  align-items: center;
  justify-content: left;
  font-size: 1.5rem;
  font-weight: bold;
  gap: 8px; /* Espacio entre el ícono y el texto */
}

ion-icon {
  font-size: 1.5rem;
  color: var(--ion-color-primary); /* Color del ícono */
}

ion-card-content {
  padding-top: 8px; /* Reducir el espacio superior del contenido */
}
</style>
