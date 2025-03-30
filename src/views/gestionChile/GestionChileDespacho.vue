<template>
    <ion-content class="ion-padding">
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
            
            <div v-else @ionInfinite="loadMorePedidos">
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
                                    :conCheckBox="true"
                                    :pedido="pedido"
                                    @seleccionarPedido="seleccionarPedido"
                                    @deseleccionarPedido="deseleccionarPedido"
                                />
                        </ion-col>
                    </ion-row>
                </ion-grid>

                <ion-infinite-scroll 
                    @ionInfinite="loadMorePedidos" 
                    threshold="50px"
                >
                    <ion-infinite-scroll-content
                        loading-spinner="bubbles"
                        loading-text="Cargando más datos..."
                    />
                </ion-infinite-scroll>
            </div>
            
            <!-- FAB para recepcionar pedidos -->
            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button 
                    color="primary"
                    @click="recepcionarPedidos"
                    :disabled="mostrarSpinnerRecepcion"
                >
                    <ion-icon v-if="!mostrarSpinnerRecepcion" :icon="arrowForwardOutline"/>
                    <ion-spinner v-else name="crescent"></ion-spinner>
                </ion-fab-button>
            </ion-fab>
            
            <!-- Alerta de confirmación de recepción -->
            <ion-alert
                :is-open="mostrarAlertaConfirmacion"
                header="Confirmar recepción"
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
            ></ion-alert>
            
            <!-- Toast para mostrar mensajes -->
            <ion-toast
                :is-open="mostrarToast"
                :message="mensajeToast"
                :color="colorToast"
                :duration="2000"
                position="bottom"
                @didDismiss="mostrarToast = false"
            ></ion-toast>
            
            <!-- Overlay de carga para toda la pantalla durante la recepción -->
            <ion-loading
                :is-open="mostrarSpinnerRecepcion"
                message="Despachando pedidos..."
                spinner="circular"
            ></ion-loading>
            
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
            3,                 // estadoId (0 para todos)
            regionSeleccion.value // Región seleccionada
        );

        if (response.pedidos) {
            const pedidosFiltrados = response.pedidos.filter((pedido: Pedido) => pedido.guia_despacho_id !== null);
            pedidos.value.push(...pedidosFiltrados);
            totalPedidos.value = response.total || 0;
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
    // Si estamos cargando o ya tenemos todos los pedidos, completar evento
    if (loading.value || pedidos.value.length >= totalPedidos.value) {
        event.target.complete();
        event.target.disabled = true;
        return;
    }
    
    loading.value = true;
    page.value++;
    
    try {
        await obtenerPedidos();
    } catch (error) {
        console.error("Error al cargar más pedidos:", error);
    }
    finally {
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

// Cambiar la función despacharPedidos a recepcionarPedidos
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
const confirmarYRecepcionar = async() => {
    mostrarAlertaConfirmacion.value = false;
    const loginStore = useLoginStore();
    
    try {
        // Mostrar spinner
        mostrarSpinnerRecepcion.value = true;
        
        // Procesamos los pedidos de forma secuencial para evitar problemas de concurrencia
        for (const pedido of pedidosSeleccionados.value) {
            // Primero actualizamos el estado del pedido
            await pedidoService.putPedido({
                id: pedido.id,
                estado_pedidos_id: 4 // Cambiar a "Despachao de Bodega en Chile"
            });
            
            // Luego registramos el cambio de estado en el log
            await logEstadoPedidoService.postLogEstadoPedido({
                pedidos_id: pedido.id,
                estado_pedidos_id: 4, // Cambiar a "Despachao de Bodega en Chile"
                empleados_id: loginStore.user?.empleados[0].id
            });
        }

        // Actualizar la lista de pedidos (quitar los recepcionados)
        const pedidosIds = pedidosSeleccionados.value.map(p => p.id);
        pedidos.value = pedidos.value.filter(p => !pedidosIds.includes(p.id));
        
        // Limpiar selección
        pedidosSeleccionados.value = [];
        
        // Mostrar mensaje de éxito
        mensajeToast.value = `${pedidosIds.length} pedido(s) despachado(s) correctamente`;
        colorToast.value = 'success';
        mostrarToast.value = true;
    } catch (error) {
        console.error("Error al despachar pedidos:", error);
        
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