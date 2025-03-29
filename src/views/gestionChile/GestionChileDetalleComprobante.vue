<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        text="Volver" 
                    />
                </ion-buttons>
                <ion-title>Detalles del comprobante de venta</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Spinner de carga -->
            <div class="loading-container" v-if="isLoading">
                <ion-spinner name="circular" color="primary"></ion-spinner>
                <p>Cargando detalles del comprobante...</p>
            </div>

            <div v-else>
                <!-- Tarjeta de detalles de productos -->
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Detalles de los productos</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-list>
                            <ion-item 
                                lines="none"
                                v-for="(detalle, index) in detallePedido" 
                                :key="index"
                                class="item-minimalista">
                                    <div>
                                        <ion-thumbnail slot="start" class="thumbnail">
                                            <ion-img :src="`${IMAGEN_URL}${detalle.Producto.ProductoImagens[0].url}`" />
                                        </ion-thumbnail>
                                    </div>
                                    <ion-grid class="grid">
                                        <ion-row>
                                            <ion-col size="12" size-md="6" class="col-info">
                                                <p class="codigo">{{ detalle.Producto.codigo }}</p>
                                                <p class="nombre">Pedido ID: {{ detalle.pedidos_id }}</p>
                                                <p class="nombre">{{ detalle.Producto.nombre }}</p>
                                                <p class="adicional">{{ detalle.adicional }}</p>
                                            </ion-col>
                                            <ion-col size="12" size-md="3" class="col-input">
                                                <ion-label>{{ detalle.cantidad }} x</ion-label>
                                                <ion-input
                                                    type="number"
                                                    class="input-minimalista" 
                                                    placeholder="Precio unit. (usd)"
                                                    :value="detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd"
                                                    @input="actualizarPrecioGuia(index, $event)"
                                                />
                                            </ion-col>
                                            <ion-col size="12" size-md="3" class="col-total">
                                                <ion-label>
                                                    <strong>
                                                        Total: ${{ detalle.cantidad * (detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd) }}
                                                    </strong>
                                                </ion-label>
                                            </ion-col>
                                        </ion-row>
                                    </ion-grid>
                            </ion-item>
                        </ion-list>
                    </ion-card-content>
                </ion-card>

                <!-- Tarjeta de totales -->
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Resumen de costos</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-list>
                            <ion-item class="item-totales">
                                <ion-label><strong>Subtotal:</strong></ion-label>
                                <ion-label slot="end"><strong>${{ subtotal }}</strong></ion-label>
                            </ion-item>
                            <ion-item class="item-totales">
                                <ion-label><strong>Total:</strong></ion-label>
                                <ion-label slot="end"><strong>${{ total }}</strong></ion-label>
                            </ion-item>
                            <ion-item class="item-totales">
                                <ion-label><strong>Codigo</strong></ion-label>
                                <ion-input 
                                    slot="end" 
                                    fill="solid"
                                    class="input-detalle" 
                                    placeholder="XM-01"
                                    v-model="codigo"
                                    />
                            </ion-item>
                        </ion-list>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>
        <!-- Success Alert -->
        <ion-alert
            :is-open="showSuccessAlert"
            header="¡Éxito!"
            message="Comprobante de venta generado correctamente."
            :buttons="[{
            text: 'Aceptar',
            handler: () => volverAGestionChile()
            }]"
        />

        <!-- Error Alert -->
        <ion-alert
            :is-open="showErrorAlert"
            header="Error"
            message="Ocurrió un error al generar el comprobante de venta. Por favor, inténtalo de nuevo."
            :buttons="[{
            text: 'Aceptar',
            handler: () => { showErrorAlert = false; }
            }]"
        />
    </ion-page>
</template>

<script setup lang="ts">
import { DetallePedido, ComprobanteVenta, Pedido } from '@/interfaces/interfaces';
import detallePedidoService from '@/services/detallePedidoService';
import comprobanteVentaService from '@/services/comprobanteVentaService';
import { computed, onMounted, ref, watch } from 'vue';
import { onIonViewDidLeave, useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router';
import pedidoService from '@/services/pedidoService';

// Variables de datos
const pedidos = ref<Pedido[]>([]);
const detallePedido = ref<DetallePedido[]>([]);
const comprobanteVenta = ref<ComprobanteVenta>();

// Variables de estado
const isLoading = ref(true); // Estado de carga inicial
const isProcessing = ref(false); // Estado de procesamiento
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);

// Variables de URL
const IMAGEN_URL = import.meta.env.VITE_IMAGES_URL;

// Variables de comprobante de venta
const insurage = ref<number>(0);
const otros = ref<number>(0);
const codigo = ref<string>('');

// Variables de navegación
const route = useRoute();
const comprobanteVentaId = ref<number>(Number(route.params.id));
const ionRouter = useIonRouter();

// Función para obtener pedidos relacionados con el comprobante de venta
const getPedidos = async () => {
    try {
        pedidos.value = await pedidoService.getPedidosByComprobanteVentaId(comprobanteVentaId.value);
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        showErrorAlert.value = true;
    }
};

// Función para cargar detalles de los pedidos
const cargarDetallesPedidos = async () => {
    if (pedidos.value.length > 0) {
        const detallesPromises = pedidos.value.map(pedido =>
            detallePedidoService.getDetallePedidoByPedido_Id(String(pedido.id))
        );
        const detalles = await Promise.all(detallesPromises);
        detalles.forEach(detalle => detallePedido.value.push(...detalle));
        console.log("Detalles de los pedidos cargados:", detallePedido.value);
    } else {
        console.log("No hay pedidos asociados a este comprobante de venta");
    }
};

// Función para cargar el comprobante de venta
const getComprobanteVentaById = async () => {
    try {
        comprobanteVenta.value = await comprobanteVentaService.getComprobanteVentaById(comprobanteVentaId.value);
        if (comprobanteVenta.value) {
            codigo.value = comprobanteVenta.value.codigo || '';
        }
    } catch (error) {
        console.error("Error al cargar comprobante de venta:", error);
        showErrorAlert.value = true;
    }
};

// Función para cargar todos los datos
const cargarTodosLosDatos = async () => {
    isLoading.value = true;
    try {
        // Cargar comprobante de venta y pedidos en paralelo
        await Promise.all([
            getComprobanteVentaById(),
            getPedidos()
        ]);

        // Cargar detalles de los pedidos
        await cargarDetallesPedidos();
    } catch (error) {
        console.error("Error al cargar datos:", error);
        showErrorAlert.value = true;
    } finally {
        isLoading.value = false;
    }
};

// Función para volver a la vista anterior
const volverAGestionChile = () => {
    ionRouter.navigate('/gestionChile', 'root', 'replace');
};

// Función para mostrar alerta de éxito
const mostrarAlertaExito = () => {
    showSuccessAlert.value = true;
};

// Función para actualizar el precio de la guía
const actualizarPrecioGuia = (index: number, event: Event) => {
    const nuevoPrecio = parseFloat((event.target as HTMLInputElement).value);
    detallePedido.value[index].precio_compra_guia = nuevoPrecio;
};

// Calcular subtotal
const subtotal = computed(() => {
    return detallePedido.value.reduce((acc, item) => {
        const precio = item.precio_compra_guia ?? item.Producto.Precio_compra_usd;
        return acc + item.cantidad * precio;
    }, 0);
});

// Calcular total
const total = computed(() => {
    return subtotal.value + Number(insurage.value) + Number(otros.value);
});

// Observar cambios en los precios
watch(detallePedido, () => {
    console.log("Precios actualizados:", detallePedido.value);
}, { deep: true });

// Montar la vista
onMounted(async () => {
    await cargarTodosLosDatos();
});

// Limpiar datos al salir de la vista
onIonViewDidLeave(() => {
    detallePedido.value = [];
    pedidos.value = [];
    isLoading.value = true;
    isProcessing.value = false;
    showSuccessAlert.value = false;
    showErrorAlert.value = false;
});
</script>

<style scoped>
/* Estilos generales */
.item-minimalista {
    --padding-start: 0;
    --inner-padding-end: 0;
    margin-bottom: 16px;
    border-bottom: 1px solid #e0e0e0; /* Línea divisoria entre items */
}

.thumbnail {
    min-width: 80px;
    min-height: 80px;
    margin-right: 16px;
    border-radius: 8px;
    overflow: hidden;
}

.grid {
    width: 100%;
}

.col-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.col-input {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.col-total {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.codigo {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.nombre {
    font-size: 12px;
    color: #666;
    margin: 4px 0;
}

.adicional {
    font-size: 12px;
    color: #999;
    margin: 0;
}

.input-minimalista {
    width: 60px;
    max-width: 120px;
    text-align: center;
    margin-left: 4px;
    font-size: 14px;
    border: #666 solid 1px;
    border-radius: 4px;
}

.input-detalle {
    width: 60px;
    max-width: 120px;
    text-align: center;
    margin-left: 4px;
    font-size: 14px;
    border: #666 solid 1px;
    border-radius: 4px;
}

/* Estilos para la tarjeta de totales */
.item-totales {
    --padding-start: 0;
    --inner-padding-end: 0;
}

.grid-totales {
    width: 100%;
}

.col-label {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 14px;
    color: #333;
}

.col-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 14px;
    color: #333;
}

/* Estilos para los estados de carga */
.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 300px;
    width: 100%;
    margin: 2rem 0;
}

.loading-container ion-spinner {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
}

.spinner-button {
    width: 24px;
    height: 24px;
}
</style>