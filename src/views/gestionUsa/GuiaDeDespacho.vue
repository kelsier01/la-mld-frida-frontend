<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        text="Volver" 
                    />
                </ion-buttons>
                <ion-title>Detalles de la guía de despacho</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Spinner de carga inicial -->
            <div class="loading-container" v-if="isLoading">
                <ion-spinner name="circular" color="primary"></ion-spinner>
                <p>Cargando detalles de los pedidos...</p>
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
                                <ion-label><strong>Insurage (Seguro):</strong></ion-label>
                                <ion-label slot="end">
                                    <ion-input
                                        type="number"
                                        class="input-detalle" 
                                        placeholder="Insurage (USD)"
                                        v-model="insurage"
                                    />
                                </ion-label>
                            </ion-item>
                            <ion-item class="item-totales">
                                <ion-label><strong>Others (Otros):</strong></ion-label>
                                <ion-label slot="end">
                                    <ion-input
                                        type="number"
                                        class="input-detalle" 
                                        placeholder="Others (USD)"
                                        v-model="otros"
                                    />
                                </ion-label>
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

                        <BotonGenerarGuiaDespacho 
                            :detallePedido="detallePedido"
                            :subtotal="subtotal.toString()"
                            :insurage="insurage.toString()"
                            :otros="otros.toString()"
                            :total="total.toString()"
                            :guiaDespachoId="guiaDespachoId"
                            @actualizarPrecioGuia="actualizarPrecioCompraGuia"
                            @guiaGenerada="mostrarAlertaExito"
                            :disabled="procesandoGuia"
                        >
                            <template v-slot:content>
                                <span v-if="!procesandoGuia">Generar Guía de Despacho</span>
                                <ion-spinner v-else name="crescent" class="spinner-button"></ion-spinner>
                            </template>
                        </BotonGenerarGuiaDespacho>
                    </ion-card-content>
                </ion-card>
            </div>
            
            <!-- Overlay de carga durante el procesamiento de la guía -->
            <div class="processing-overlay" v-if="procesandoGuia">
                <div class="processing-container">
                    <ion-spinner name="circular" color="light"></ion-spinner>
                    <p>Generando guía de despacho...</p>
                </div>
            </div>
        </ion-content>
        
        <!-- Success Alert -->
        <ion-alert
            :is-open="showSuccessAlert"
            header="¡Éxito!"
            message="Guía de despacho generada correctamente."
            :buttons="[{
                text: 'Aceptar',
                handler: () => volverAGestionUsa()
            }]"
        />

        <!-- Error Alert -->
        <ion-alert
            :is-open="showErrorAlert"
            header="Error"
            message="Ocurrió un error al generar la guía de despacho. Por favor, inténtalo de nuevo."
            :buttons="[{
                text: 'Aceptar',
                handler: () => showErrorAlert = false
            }]"
        />
    </ion-page>
</template>

<script setup lang="ts">
import { DetallePedido, Pedido } from '@/interfaces/interfaces';
import detallePedidoService from '@/services/detallePedidoService';
import { Storage } from '@ionic/storage';
import { computed, onMounted, ref, watch } from 'vue';
import BotonGenerarGuiaDespacho from '@/components/BotonGenerarGuiaDespacho.vue';
import guiaDespachoService from '@/services/guiaDespachoService';
import pedidoService from '@/services/pedidoService';
import { useIonRouter } from '@ionic/vue';

const pedidos = ref<Pedido[]>([]);
const detallePedido = ref<DetallePedido[]>([]);
const isLoading = ref(true); // Estado de carga inicial
const procesandoGuia = ref(false); // Estado de procesamiento de la guía
const IMAGEN_URL = import.meta.env.VITE_IMAGES_URL;
const insurage = ref<number>(0);
const otros = ref<number>(0);
const codigo = ref<string>('');
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const guiaDespachoId = ref<number>(0);
const ionRouter = useIonRouter();

const getPedidos = async () => {
    try {
        const storage = new Storage();
        await storage.create(); // Asegúrate de que el Storage esté inicializado
        const pedidosStorage = await storage.get('pedidosSeleccionados');
        if (pedidosStorage) {
            pedidos.value = JSON.parse(pedidosStorage);
        }
    } catch (error) {
        console.error("Error al obtener pedidos del storage:", error);
    }
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await getPedidos();

        // Lógica para obtener el detalle de cada pedido
        const detallePedidoPromises = pedidos.value.map(pedido => 
            detallePedidoService.getDetallePedidoByPedido_Id(String(pedido.id))
        );
        
        const detallesPedidos = await Promise.all(detallePedidoPromises);
        detallesPedidos.forEach(detalles => {
            detallePedido.value.push(...detalles);
        });
        
        console.log("detalle de los pedidos seleccionados", detallePedido.value);
    } catch (error) {
        console.error("Error al cargar los detalles de los pedidos:", error);
        showErrorAlert.value = true;
    } finally {
        isLoading.value = false;
    }
});

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


const actualizarPrecioCompraGuia = async (resolve?: () => void) => {
    procesandoGuia.value = true;
    try {
        // Crear un array con los detalles actualizados
        const detalles = detallePedido.value.map((detalle) => ({
            id: detalle.id,
            precio_compra_guia: detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd,
        }));

        // Enviar todas las actualizaciones en paralelo
        await Promise.all(detalles.map((detalle) => detallePedidoService.putDetallePedido(detalle)));

        // Crear la guía de despacho
        const response = await guiaDespachoService.postGuiaDespacho({
            codigo: codigo.value,
            estados_id: 1,
            subtotal: subtotal.value,
            insurage: insurage.value,
            other: otros.value,
            total: total.value,
        });

        // Guardar el ID de la guía en la variable reactiva
        guiaDespachoId.value = response.id;
        console.log("Guía de despacho generada con ID:", guiaDespachoId.value);

        // Asociar los pedidos a la guía de despacho
        const pedidosActualizados = pedidos.value.map(pedido => ({
            id: pedido.id,
            guia_despacho_id: guiaDespachoId.value,
        }));

        // Actualizar los pedidos con el ID de la guía de despacho
        await Promise.all(pedidosActualizados.map((pedido) => pedidoService.putPedido(pedido)));

        console.log("Pedidos actualizados con guía:", pedidosActualizados);
        console.log("DETALLES actualizados", detalles);
        
        // Si se proporcionó una función resolve, llamarla para indicar que la operación ha terminado
        if (resolve) resolve();
    } catch (error) {
        console.error("Error al actualizar los detalles o generar la guía de despacho:", error);
        showErrorAlert.value = true;
        if (resolve) resolve();
    } finally {
        procesandoGuia.value = false;
    }
};

// Nueva función para mostrar alerta de éxito después de completar todo el proceso
const mostrarAlertaExito = () => {
    showSuccessAlert.value = true;
};

// Función para volver a GestionUsa
const volverAGestionUsa = async() => {
    try {
        const storage = new Storage();
        await storage.create(); // Asegúrate de que el Storage esté inicializado
        await storage.remove('pedidosSeleccionados');
        // Usar el router de Ionic para navegar hacia atrás o redirigir
        ionRouter.navigate('/gestionUsa', 'root', 'replace');
    } catch (error) {
        console.error("Error al limpiar el storage:", error);
        ionRouter.navigate('/gestionUsa', 'root', 'replace');
    }
};
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

/* Overlay para mostrar durante el procesamiento de la guía */
.processing-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}

.processing-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 2rem;
    margin: 0 2rem;
    color: white;
    text-align: center;
}

.processing-container ion-spinner {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
}
</style>