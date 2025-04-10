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
                                                    :value="detalle.precio_venta"
                                                    @input="actualizarPrecioGuia(index, $event)"
                                                />
                                                <ion-label>CLP</ion-label>
                                            </ion-col>
                                            <ion-col size="12" size-md="3" class="col-total">
                                                <ion-label>
                                                    <strong>
                                                        Total: ${{ detalle.cantidad * (detalle.precio_venta) }} CLP
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
                                <ion-label slot="end"><strong>${{ subtotal }} CLP</strong></ion-label>
                            </ion-item>
                            <ion-item class="item-totales">
                                <ion-label><strong>Total:</strong></ion-label>
                                <ion-label slot="end"><strong>${{ total }} CLP</strong></ion-label>
                            </ion-item>
                            <ion-item class="item-totales">
                                <ion-label><strong>Código:</strong></ion-label>
                                <ion-label slot="end" color="primary"><strong>{{ codigo }}</strong></ion-label>
                            </ion-item>
                            <ion-item 
                                v-if="clienteComprobanteVenta && direccionComprobanteVenta">
                                <div class="button-container">
                                   <BotonGenerarComprobanteVenta
                                        :cliente="clienteComprobanteVenta"
                                        :direccion="direccionComprobanteVenta"
                                        :comprobanteId="comprobanteVentaId"
                                        :detallePedido="detallePedido"
                                        :subtotal="String(subtotal)"
                                        :total="String(total)"
                                        :fecha="comprobanteVenta?.createdAt"
                                        :codigo="codigo"
                                        @actualizarPrecioComprobante="actualizarPreciosComprobante"
                                        @success="mostrarAlertaExito"
                                        @error="mostrarError"
                                    /> 
                                </div>    
                            </ion-item>
                        </ion-list>
                    </ion-card-content>
                </ion-card>
                <!-- Informacion de envio -->
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Información de Envío</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <ion-list>
                            <ion-item>
                                <ion-label position="stacked">Compañía de Transporte</ion-label>
                                <ion-select 
                                    v-model="companiaTransporteSeleccionada" 
                                    placeholder="Seleccionar compañía" 
                                    interface="action-sheet"
                                >
                                    <ion-select-option 
                                        v-for="(transport, index) in companiaTransporte"
                                        :key="index"
                                        :value="transport.id"
                                    >
                                    {{ transport.empresa }}
                                    </ion-select-option>                                   
                                </ion-select>
                            </ion-item>                                                        
                            <ion-item>
                                <ion-label position="stacked">Número de Seguimiento</ion-label>
                                <ion-input 
                                    v-model="numeroSeguimiento" 
                                    placeholder="Ingrese el número de seguimiento"
                                    type="text"
                                />
                            </ion-item>

                            <ion-item lines="none">
                                <div class="button-container">
                                    <ion-button 
                                        expand="block"
                                        color="success"
                                        @click="guardarInformacionEnvio"
                                        :disabled="!datosEnvioValidos || isProcessingEnvio"
                                    >
                                        <ion-spinner v-if="isProcessingEnvio" name="crescent" class="spinner-button"/>
                                        <span v-else>Guardar Información de Envío</span>
                                    </ion-button>   
                                    </div>                                
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
import { DetallePedido, ComprobanteVenta, Pedido, Cliente, Direccion, Delivery } from '@/interfaces/interfaces';
import detallePedidoService from '@/services/detallePedidoService';
import comprobanteVentaService from '@/services/comprobanteVentaService';
import { computed, onMounted, ref, watch } from 'vue';
import { onIonViewDidLeave, useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router';
import pedidoService from '@/services/pedidoService';
import BotonGenerarComprobanteVenta from '@/components/BotonGenerarComprobanteVenta.vue';
import companiaTransporteService from '@/services/companiaTransporteService';

// Variables de datos
const pedidos = ref<Pedido[]>([]);
const detallePedido = ref<DetallePedido[]>([]);
const companiaTransporte = ref<Delivery[]>([]);
const comprobanteVenta = ref<ComprobanteVenta>();
const clienteComprobanteVenta = ref<Cliente>();
const direccionComprobanteVenta = ref<Direccion>();
const companiaTransporteSeleccionada = ref<number>(); 
const numeroSeguimiento = ref<string>('');
const isProcessingEnvio = ref<boolean>(false); // Estado de procesamiento de envío

// Variables de estado
const isLoading = ref(true); // Estado de carga inicial
const isProcessing = ref(false); // Estado de procesamiento
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);

// Variables de URL
const IMAGEN_URL = import.meta.env.VITE_IMAGES_URL;
const codigo = ref<string>('');

// Variables de navegación
const route = useRoute();
const comprobanteVentaId = ref<number>(Number(route.params.id));
const ionRouter = useIonRouter();

const datosEnvioValidos = computed(() => {
    if (!companiaTransporte.value) return false;
    if (!numeroSeguimiento.value.trim()) return false;
    return true;
});

// Función para obtener pedidos relacionados con el comprobante de venta
const getPedidos = async () => {
    try {
        pedidos.value = await pedidoService.getPedidosByComprobanteVentaId(comprobanteVentaId.value);
        clienteComprobanteVenta.value = pedidos.value[0].cliente;
        direccionComprobanteVenta.value = pedidos.value[0].Direccion;
        console.log("Direccion cargados:", direccionComprobanteVenta.value);
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

const getCompaniaTransporte = async () => {
    try {
        const response = await companiaTransporteService.getCompaniasTransporte();
        companiaTransporte.value = response;
        console.log("Compañías de transporte cargadas:", companiaTransporte.value);
    } catch (error) {
        console.error("Error al cargar compañía de transporte:", error);
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
            getPedidos(),
            getCompaniaTransporte()
        ]);

        // Cargar detalles de los pedidos
        await cargarDetallesPedidos();
        // Cargar Codigo de seguimiento si hay disponible
        if(pedidos.value[0].deliverys_id && pedidos.value[0].tracking_number) {
            numeroSeguimiento.value = pedidos.value[0].tracking_number;
            companiaTransporteSeleccionada.value = pedidos.value[0].deliverys_id;
        }
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
    let nuevoPrecio = parseFloat((event.target as HTMLInputElement).value);
    
    // Si el valor no es un número válido, establecerlo a 0 o mantener el valor anterior
    if (isNaN(nuevoPrecio)) {
        nuevoPrecio = 0; // O podrías conservar el valor anterior si prefieres
        // Opcional: Mostrar algún tipo de feedback visual para el campo con error
    }
    
    detallePedido.value[index].precio_venta = nuevoPrecio;
};

// Calcular subtotal
const subtotal = computed(() => {
    return detallePedido.value.reduce((acc, item) => {
        const precio = item.precio_venta;
        return acc + item.cantidad * precio;
    }, 0);
});

// Calcular total
const total = computed(() => {
    return subtotal.value
});

const guardarInformacionEnvio = async() => {
    if(!datosEnvioValidos.value) return; // Validar datos de envío
    isProcessingEnvio.value = true; // Cambiar estado a procesando
    
    try {
        // Verificar que tenemos una compañía de transporte seleccionada
        if (!companiaTransporteSeleccionada.value || numeroSeguimiento.value.trim() === '') {
            throw new Error("Información de envío incompleta");
        }
        
        // Procesar todos los pedidos con Promise.all para mayor eficiencia
        await Promise.all(pedidos.value.map(pedido => 
            pedidoService.putPedido({
                id: pedido.id,
                tracking_number: numeroSeguimiento.value,
                deliverys_id: companiaTransporteSeleccionada.value
            })
        ));
        
        // Mostrar alerta de éxito
        mostrarAlertaExito();
        
    } catch (error) {
        console.error("Error al guardar información de envío:", error);
        showErrorAlert.value = true;
    } finally {
        isProcessingEnvio.value = false; // Cambiar estado a no procesando
    }
}

const actualizarPreciosComprobante = async (resolve: () => void) => {
    try {
        // Validación más exhaustiva de los precios
        const productosProblematicos = detallePedido.value.filter(detalle => {
            // Verificar si el precio es undefined, null, vacío, NaN o menor o igual a cero
            const precio = detalle.precio_venta;
            return precio === undefined || 
                   precio === null || 
                   isNaN(precio) || 
                   precio <= 0;
        });
        
        if (productosProblematicos.length > 0) {
            // Mostrar detalles específicos de los productos con problemas
            const codigosConProblemas = productosProblematicos
                .map(p => p.Producto?.codigo || 'Sin código')
                .join(', ');
                
            throw new Error(`Algunos productos tienen precios inválidos (vacíos, cero o valores no numéricos). Por favor, revise los productos: ${codigosConProblemas}`);
        }
        
        // También podemos validar que el subtotal y total sean valores válidos
        if (isNaN(subtotal.value) || subtotal.value <= 0) {
            throw new Error('El subtotal calculado es inválido. Por favor, revise los precios de todos los productos.');
        }
        
        // Aquí puedes incluir una llamada al servicio para actualizar los precios si es necesario
        
        // Una vez terminado, resolver la promesa
        resolve();
    } catch (error) {
        console.error("Error al actualizar precios:", error);
        showErrorAlert.value = true;
        // Rechazar la promesa (esto hará que el proceso en el botón se cancele)
        throw error;
    }
};

// Método para mostrar mensajes de error
const mostrarError = (error: any) => {
    console.error("Error en el proceso:", error);
    let mensaje = "Ocurrió un error al generar el comprobante de venta.";
    
    // Si el error tiene un mensaje específico, usarlo
    if (error?.message) {
        mensaje = error.message;
    }
    
    // Actualizar el mensaje de error en la alerta
    showErrorAlert.value = true;
    
    // Opcional: Mostrar el mensaje en una alerta personalizada
    const alertaErrorElement = document.querySelector('ion-alert[is-open="true"]');
    if (alertaErrorElement) {
        const mensajeElement = alertaErrorElement.querySelector('.alert-message');
        if (mensajeElement) {
            mensajeElement.textContent = mensaje;
        }
    }
};

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
    border-bottom: 1px solid #e0e0e0;
    transition: background-color 0.2s ease;
}

.item-minimalista:hover {
    background-color: rgba(var(--ion-color-primary-rgb), 0.05);
}

ion-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    overflow: hidden;
}

ion-card-header {
    background-color: rgba(var(--ion-color-primary-rgb), 0.1);
    padding: 16px;
}

ion-card-title {
    font-weight: 600;
    font-size: 18px;
    color: var(--ion-color-primary);
}

.thumbnail {
    min-width: 90px;
    min-height: 90px;
    margin-right: 16px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
    width: 80px;
    max-width: 120px;
    text-align: center;
    margin-left: 4px;
    font-size: 14px;
    border: 1px solid rgba(var(--ion-color-primary-rgb), 0.3);
    border-radius: 6px;
    padding: 8px 4px;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.input-minimalista:focus {
    border-color: var(--ion-color-primary);
    box-shadow: 0 0 0 2px rgba(var(--ion-color-primary-rgb), 0.2);
    outline: none;
}

.input-detalle {
    width: 80px;
    max-width: 120px;
    text-align: center;
    margin-left: 4px;
    font-size: 14px;
    border: 1px solid rgba(var(--ion-color-primary-rgb), 0.3);
    border-radius: 6px;
    padding: 8px 4px;
}

/* Estilos para inputs con error */
.input-error {
    border-color: var(--ion-color-danger);
    box-shadow: 0 0 0 2px rgba(var(--ion-color-danger-rgb), 0.2);
}

/* Estilos para botones */
ion-button {
    --border-radius: 8px;
    --box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    font-weight: 600;
    text-transform: none;
    height: 44px;
    margin: 8px auto;
    display: block;
    width: 80%;
    max-width: 300px;
}

/* Contenedor para centrar botones */
.button-container {
    display: flex;
    justify-content: center;
    width: 100%;
    margin: 10px 0;
}

/* Estilo para items que contienen botones */
ion-item.button-item {
    --padding-start: 0;
    --inner-padding-end: 0;
    --min-height: auto;
    width: 100%;
    text-align: center;
}

ion-item.button-item::part(native) {
    justify-content: center;
    padding: 0;
}

/* Estilos para la tarjeta de totales */
.item-totales {
    --padding-start: 16px;
    --inner-padding-end: 16px;
    --min-height: 54px;
    margin-bottom: 4px;
}

.grid-totales {
    width: 100%;
}

.col-label {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 15px;
    color: #333;
}

.col-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 15px;
    color: #333;
    font-weight: 600;
}

/* Mejorar el select de compañía de transporte */
ion-select {
    --padding-start: 16px;
    --padding-end: 16px;
    --placeholder-color: #999;
    --placeholder-opacity: 0.8;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    margin-top: 8px;
    margin-bottom: 8px;
}

ion-label {
    font-weight: 500;
    margin-bottom: 4px;
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
    opacity: 0.8;
}

.loading-container p {
    color: var(--ion-color-medium);
    font-weight: 500;
    letter-spacing: 0.5px;
}

.spinner-button {
    width: 24px;
    height: 24px;
    opacity: 0.9;
}


/* Estilos responsivos para dispositivos móviles */
@media (max-width: 576px) {
    .col-input, .col-total {
        justify-content: flex-start;
        margin-top: 8px;
    }
    
    .thumbnail {
        min-width: 70px;
        min-height: 70px;
    }
}
</style>