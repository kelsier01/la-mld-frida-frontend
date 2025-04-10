<template>
    <ion-content class="ion-padding" @ionInfinite="loadMorePedidos">
            <IonItem>
                <IonSelect 
                    label="Region" 
                    placeholder="Seleccionar"
                    v-model="regionSeleccion"
                    interface="modal"
                    @ionChange="resetPedidosYBuscar"
                >
                    <IonSelectOption value="0">
                        Todas las regiones
                    </IonSelectOption>
                    <IonSelectOption
                        v-for="region in regiones"
                        :key="region.id" 
                        :value="region.id"
                    >
                        {{ region.nombre }}
                    </IonSelectOption>
                </IonSelect>
            </IonItem>
            
            <!-- Spinner de carga -->
            <div v-if="isLoading" class="loading-container">
                <ion-spinner name="circular"/>
                <p>Cargando pedidos...</p>
            </div>
            
            <div v-else>
                <ion-card v-if="pedidos.length === 0 && !loading">
                    <ion-card-content class="ion-text-center">
                        <ion-icon :icon="alertCircleOutline" class="no-data-icon"></ion-icon>
                        <p>No se encontraron pedidos con los filtros seleccionados</p>
                    </ion-card-content>
                </ion-card>
                <ion-grid>
                    <ion-row>
                        <ion-col 
                            v-for="(pedido) in pedidos" 
                            :key="pedido.id" 
                            size="12" 
                            size-md="6" 
                            size-lg="4">
                                <PedidoCard
                                    v-if="loginStore.user"
                                    :key="`pedido-${pedido.id}-${pedido.estado_pedidos_id}`"
                                    :conCheckBox="true"
                                    :conBtnDeAlta="pedido.estado_pedidos_id == 3 ? true : false"
                                    :pedido="pedido"
                                    :rol_id="loginStore.user.roles_id"
                                    @seleccionarPedido="seleccionarPedido"
                                    @deseleccionarPedido="deseleccionarPedido"
                                    @darDeAlta="darDeAlta"
                                />
                        </ion-col>
                    </ion-row>
                </ion-grid>

                <ion-infinite-scroll 
                    @ionInfinite="loadMorePedidos" 
                    threshold="5px"
                >
                    <ion-infinite-scroll-content
                        loading-spinner="bubbles"
                        loading-text="Cargando más datos..."
                    />
                </ion-infinite-scroll>
            </div>
            
            <!-- FAB para Despachar pedidos -->
            <ion-fab 
                vertical="bottom" 
                horizontal="end" 
                slot="fixed"
            >
                <ion-fab-button 
                    color="primary"
                    @click="recepcionarPedidos"
                    :disabled="mostrarSpinnerRecepcion"
                >
                    <ion-icon v-if="!mostrarSpinnerRecepcion" :icon="arrowForwardOutline"/>
                    <ion-spinner v-else name="crescent"/>
                </ion-fab-button>
            </ion-fab>
            
            <!-- Alerta de confirmación de recepción -->
            <ion-alert
                :is-open="mostrarAlertaConfirmacion"
                header="Confirmar Despacho"
                :message="`¿Está seguro que desea despachar ${pedidosSeleccionados.length} pedido(s)?`"
                :buttons="[
                    {
                        text: 'Cancelar',
                        role: 'cancel',
                        handler: cancelarRecepcion
                    },
                    {
                        text: 'Despachar',
                        role: 'confirm',
                        handler: confirmarYRecepcionar
                    }
                ]"
            />
            
            <!-- Toast para mostrar mensajes -->
            <ion-toast
                :is-open="mostrarToast"
                :message="mensajeToast"
                :color="colorToast"
                :duration="2000"
                position="bottom"
                @didDismiss="mostrarToast = false"
            />
            
            <!-- Overlay de carga para toda la pantalla durante la recepción -->
            <ion-loading
                :is-open="mostrarSpinnerRecepcion"
                message="Despachando pedidos..."
                spinner="circular"
            />
            
    </ion-content>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import regionService from '@/services/regionService';
import { Region, Pedido } from '@/interfaces/interfaces';
import PedidoCard from '@/components/PedidoCard.vue';
import pedidoService from '@/services/pedidoService';
import { InfiniteScrollCustomEvent } from '@ionic/vue';
import { alertCircleOutline, arrowForwardOutline } from 'ionicons/icons';
import { useLoginStore } from '@/stores/loginStore';
import logEstadoPedidoService from '@/services/logEstadoPedidoService';
import comprobanteVentaService from '@/services/comprobanteVentaService';

// Variables básicas
const regiones = ref<Region[]>([]);
const pedidos = ref<Pedido[]>([]);
const regionSeleccion = ref<number>(0);
const pedidosSeleccionados = ref<Pedido[]>([]);

// Variables para el infinite scroll
const totalPedidos = ref<number>(0);
const page = ref<number>(1);
const loading = ref<boolean>(false);
const isLoading = ref<boolean>(true);

// Variables para la recepción
const mostrarSpinnerRecepcion = ref<boolean>(false);
const mostrarAlertaConfirmacion = ref<boolean>(false);
const mostrarToast = ref<boolean>(false);
const mensajeToast = ref<string>('');
const colorToast = ref<string>('success');
//Store
const loginStore = useLoginStore();


// Función para obtener regiones
const getRegiones = async () => {
    try {
        regiones.value = await regionService.getRegiones();
    } catch (error) {
        console.error("Error al cargar regiones:", error);
    }
};

// Función para obtener pedidos con paginación
const obtenerPedidos = async () => {
    try {
        loading.value = true;
        
        // Parámetros básicos para la API
        const response = await pedidoService.getPedidos(
            page.value,        // Página actual
            0,                 // clienteId (0 para todos)
            '',                // sin texto de búsqueda
            '',                // sin fecha desde
            '',                // sin fecha hasta
            0,                 // estadoId (0 para todos)
            regionSeleccion.value // Región seleccionada
        );

        console.log("Pedidos obtenidos:", response.pedidos);

        if (response.pedidos) {
            const pedidosFiltrados = response.pedidos
                .filter((pedido: Pedido) => 
                    pedido.guia_despacho_id !== null && (pedido.estado_pedidos_id === 3 || pedido.estado_pedidos_id === 9));
            
            console.log("Pedidos filtrados:", pedidosFiltrados);
            pedidos.value.push(...pedidosFiltrados);
            
            // Si no hay pedidos filtrados o son pocos, cargar más automáticamente
            if (pedidosFiltrados.length === 0 && response.pedidos.length > 0) {
                page.value++;
                await obtenerPedidos(); // Cargar más pedidos si no hay resultados filtrados
            }
            
            // Actualizar el total de pedidos con el total real de la API
            totalPedidos.value = response.length || 0;
        }

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    } finally {
        loading.value = false;
        isLoading.value = false;
    }
};

// Función para cargar más pedidos (infinite scroll)
const loadMorePedidos = async (event: InfiniteScrollCustomEvent) => {
    console.log("Loading more pedidos...", loading.value, page.value);
    
    // Si estamos cargando, completar evento
    if (loading.value) {
        event.target.complete();
        return;
    }
    
    loading.value = true;
    page.value++;
    
    try {
        const prevLength = pedidos.value.length;
        await obtenerPedidos();
        
        // Verificar si se añadieron nuevos pedidos
        if (pedidos.value.length === prevLength) {
            // No se añadieron nuevos pedidos, desactivar infinite scroll
            event.target.disabled = true;
        }
    } catch (error) {
        console.error("Error al cargar más pedidos:", error);
    } finally {
        event.target.complete();
        loading.value = false;
    }
};

// Función para resetear y buscar pedidos al cambiar filtros
const resetPedidosYBuscar = async () => {
    page.value = 1;
    pedidos.value = [];
    isLoading.value = true;
    await obtenerPedidos();
};

// Cargar datos iniciales
onMounted(async () => {
    isLoading.value = true;
    await getRegiones();
    await obtenerPedidos();
});

const seleccionarPedido = (pedido: Pedido) => {
    pedidosSeleccionados.value.push(pedido);
    console.log("Pedidos seleccionados:", pedidosSeleccionados.value);
};

const deseleccionarPedido = (pedido: Pedido) => {
    pedidosSeleccionados.value = pedidosSeleccionados.value.filter((p) => p.id !== pedido.id);
};

// Cambiar la función despacharPedidos
const recepcionarPedidos = async() => {
    // Verificar si hay pedidos seleccionados
    if (pedidosSeleccionados.value.length === 0) {
        mensajeToast.value = 'No hay pedidos seleccionados para despachar';
        colorToast.value = 'warning';
        mostrarToast.value = true;
        return;
    }

    // Mostrar confirmación
    mostrarAlertaConfirmacion.value = true;
};

// Función para confirmar y procesar la recepción
const confirmarYRecepcionar = async () => {
    mostrarAlertaConfirmacion.value = false;
    const loginStore = useLoginStore();

    try {
        // Mostrar spinner
        mostrarSpinnerRecepcion.value = true;

        // 1.0 Procesamos los pedidos de forma secuencial para evitar problemas de concurrencia
        for (const pedido of pedidosSeleccionados.value) {
            // Actualizamos el estado del pedido
            await pedidoService.putPedido({
                id: pedido.id,
                estado_pedidos_id: 4, // Cambiar a Despachado de Bodega
            });

            // Registramos el cambio de estado en el log
            await logEstadoPedidoService.postLogEstadoPedido({
                pedidos_id: pedido.id,
                estado_pedidos_id: 4, // Cambiar a Despachado de Bodega
                empleados_id: loginStore.user?.empleados[0].id,
            });
        }

        // 1.1 Filtramos pedidos por clientes y los agrupamos
        const pedidosPorCliente = pedidosSeleccionados.value.reduce<Record<number, Pedido[]>>((groups, pedido) => {
            const clienteId = pedido.clientes_id;
            if (!groups[clienteId]) {
                groups[clienteId] = [];
            }
            groups[clienteId].push(pedido);
            return groups;
        }, {});

        // 1.2 Para cada grupo de cliente, crear un comprobante de venta
        for (const clienteId in pedidosPorCliente) {
            const pedidosCliente = pedidosPorCliente[clienteId];

            //Generar codigo del comprobante de venta
            const codigoComprobante = await comprobanteVentaService.generarCodigo();
            console.log("Codigo comprobante generado:", codigoComprobante);

            // Crear el comprobante de venta para este cliente
            const comprobanteResponse = await comprobanteVentaService.postComprobanteVenta({
                codigo: codigoComprobante,
                estados_id: 1,
            });

            // Si se creó el comprobante correctamente, actualizar los pedidos con el id del comprobante
            if (comprobanteResponse && comprobanteResponse.id) {
                for (const pedido of pedidosCliente) {
                    await pedidoService.putPedido({
                        id: pedido.id,
                        comprobante_ventas_id: comprobanteResponse.id,
                    });
                }
            }
        }

        // Actualizar la lista de pedidos (quitar los recepcionados)
        const pedidosIds = pedidosSeleccionados.value.map((p) => p.id);
        pedidos.value = pedidos.value.filter((p) => !pedidosIds.includes(p.id));

        // Limpiar selección
        pedidosSeleccionados.value = [];

        // Mostrar mensaje de éxito
        mensajeToast.value = `${pedidosIds.length} pedido(s) despachado(s) correctamente`;
        colorToast.value = 'success';
        mostrarToast.value = true;
    } catch (error) {
        console.error('Error al despachar pedido(s):', error);

        // Mostrar mensaje de error
        mensajeToast.value = 'Error al despachar pedidos. Intente nuevamente.';
        colorToast.value = 'danger';
        mostrarToast.value = true;
    } finally {
        // Ocultar spinner
        mostrarSpinnerRecepcion.value = false;
    }
};

// Función para cancelar la recepción
const cancelarRecepcion = () => {
    mostrarAlertaConfirmacion.value = false;
};

const darDeAlta = async (pedido: Pedido) => {
    const loginStore = useLoginStore();
    try {
        const empleadoId = loginStore.user?.empleados[0].id;
        if (!empleadoId) {
            throw new Error("No se encontró información del empleado");
        }
        
        // Actualizar estado del pedido y registrar el cambio en paralelo
        await Promise.all([
            pedidoService.putPedido({
                id: pedido.id,
                estado_pedidos_id: 9, // Cambiar a Alta
            }),
            logEstadoPedidoService.postLogEstadoPedido({
                pedidos_id: pedido.id,
                estado_pedidos_id: 9, // Cambiar a Alta
                empleados_id: empleadoId,
            })
        ]);

        // Actualizar el estado del pedido en la lista local
        const index = pedidos.value.findIndex(p => p.id === pedido.id);
        if (index !== -1) {
            pedidos.value[index] = {
                ...pedidos.value[index],
                estado_pedidos_id: 9,
                EstadoPedido: {
                    ...pedidos.value[index].EstadoPedido,
                    id: 9,
                    estado_pedido: "Dado de alta",
                },
            };

            console.log("Pedido encontrado en la lista local:", pedidos.value[index]);
        }
        
        // Mostrar mensaje de éxito
        mensajeToast.value = "Pedido dado de alta correctamente";
        colorToast.value = "success";
        mostrarToast.value = true;
           
    } catch (error) {
        console.error("Error al dar de alta el pedido:", error);
        mensajeToast.value = "Error al dar de alta el pedido";
        colorToast.value = "danger";
        mostrarToast.value = true;
    }
};
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  margin: 2rem 0;
}

.loading-container ion-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 1rem;
  color: var(--ion-color-medium);
}

/* Asegurar que el ícono del FAB sea visible */
ion-fab-button ion-icon {
  font-size: 24px;
  color: rgb(0, 0, 0);
  --ionicon-stroke-width: 32px;
}

/* En caso de necesitar más especificidad */
ion-fab[vertical="bottom"][horizontal="end"] ion-fab-button ion-icon {
  display: block;
  visibility: visible;
}
</style>