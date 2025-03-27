<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Pedidos</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar 
                    placeholder="Buscar pedidos" 
                    debounce="500"
                    v-model="search"
                    @ionInput="resetPedidosYBuscar"
                />
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar 
                    placeholder="Buscar cliente" 
                    debounce="500"
                />
            </ion-toolbar>
            <ion-toolbar>
                <ion-item lines="none">
                    <ion-grid>
                        <ion-row>
                            <ion-col size="6">
                                <ion-item>
                                    <ion-label>Desde</ion-label>
                                    <ion-datetime-button datetime="desde"/>
                                </ion-item>
                            </ion-col>
                            <ion-col size="6">
                                <ion-item>
                                    <ion-label>Hasta</ion-label>
                                    <ion-datetime-button datetime="hasta"/>
                                </ion-item>
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col size="6">
                                <ion-item>
                                    <ion-select 
                                        placeholder="Estado" 
                                        label="Estado del pedido" 
                                        label-placement="stacked"
                                        v-model="estadoId"
                                        interface="action-sheet"
                                        >
                                        <ion-select-option 
                                            value="0"
                                            >Todos los estados
                                        </ion-select-option>
                                        <ion-select-option 
                                            v-for="estado in estadoPedido" 
                                            :key="estado.id" 
                                            :value="estado.id">
                                            {{ estado.estado_pedido }}
                                        </ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-col>
                            <ion-col>
                                <ion-item>
                                    <ion-select 
                                        placeholder="Region" 
                                        label="Región" 
                                        label-placement="stacked"
                                        v-model="regionId"
                                        interface="modal"
                                        >
                                            <ion-select-option 
                                                value="0"
                                                >Todas las regiones
                                            </ion-select-option>
                                            <ion-select-option 
                                                v-for="region in regiones" 
                                                :key="region.id" 
                                                :value="region.id">
                                                {{ region.nombre }}
                                            </ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-item>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" @ionInfinite="loadMorePedidos">
            <!-- Spinner de carga -->
            <div v-if="isLoading" class="loading-container">
                <ion-spinner name="circular"/>
                <p>Cargando pedidos...</p>
            </div>

            <!-- Contenido principal (se muestra cuando no está cargando) -->
            <div v-else>
                <!-- Mensaje cuando no hay pedidos -->
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
                                    :conCheckBox="false"
                                    :pedido="pedido"
                                />
                        </ion-col>
                    </ion-row>
                </ion-grid>

                <ion-infinite-scroll @ionInfinite="loadMorePedidos" threshold="50px">
                <ion-infinite-scroll-content
                    loading-spinner="bubbles"
                    loading-text="Cargando más datos..."
                ></ion-infinite-scroll-content>
                </ion-infinite-scroll>
            </div>

            <ion-fab
                vertical="bottom"
                horizontal="end"
                slot="fixed"
            >
                <ion-fab-button 
                    color="primary"
                    @click="NavegarACrearPedido"
                    >
                    <IonIcon :icon="add" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>

            <!-- Modal Desde -->
        <ion-modal :keep-contents-mounted="true">
            <ion-datetime 
                id="desde"
                presentation="date"
                v-model="fecha_desde"
                >
                <span slot="title">Selecciona una fecha de inicio</span>
            </ion-datetime>
        </ion-modal>

        <!-- Modal Hasta -->
        <ion-modal :keep-contents-mounted="true">
            <ion-datetime 
                id="hasta"
                presentation="date"
                v-model="fecha_hasta"
                >
                <span slot="title">Selecciona una fecha de fin</span>
            </ion-datetime>
        </ion-modal>
    </ion-page>
</template>

<script setup lang="ts">
import PedidoCard from '@/components/PedidoCard.vue';
import estadoPedidoService from '@/services/estadoPedidoService';
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { EstadoPedido, Pedido, Region } from '@/interfaces/interfaces';
import pedidoService from '@/services/pedidoService';
import { InfiniteScrollCustomEvent } from '@ionic/vue';
import regionService from '@/services/regionService';
import { useRouter } from 'vue-router'
import { add, alertCircleOutline } from 'ionicons/icons';

// Variables
const regiones = ref<Region[]>([]);
const estadoPedido = ref<EstadoPedido[]>([]);
const pedidos = ref<Pedido[]>([]);
const router = useRouter();

//Varialbes para el infinite scroll
const totalPedidos = ref<number>(0);
const page = ref<number>(1);
const loading = ref<boolean>(false);
const isLoading = ref<boolean>(true); // Nueva variable para el spinner de carga

// Variables para el filtro
const search = ref<string>('');
const clienteId = ref<number>(0);
const estadoId = ref<number>(0);
const regionId = ref<number>(0);
const fecha_desde = ref<string>(new Date().toISOString())
const fecha_hasta = ref<string>(new Date().toISOString());


// Funciones
const NavegarACrearPedido = () => {
    router.push({ name: 'NuevoPedido' });
};

// Función para resetear pedidos y buscar con el filtro de texto
const resetPedidosYBuscar = async () => {
    page.value = 1;
    pedidos.value = [];
    loading.value = true;
    await obtenerPedidos();
};

//Funcion para obtener los pedidos
const obtenerPedidos = async () => {
    try {
        const response = await pedidoService.getPedidos(
            page.value,
            clienteId.value,
            search.value,
            fecha_desde.value,
            fecha_hasta.value, 
            estadoId.value,  
            regionId.value,
        );
        console.log("Respuesta de la API:", response.pedidos);
        if (response.pedidos) {
            pedidos.value.push(...response.pedidos);
            console.log("Pedidos cargados:", pedidos.value);
        }
        totalPedidos.value = response.total || 0;
        console.log("Total de pedidos:", totalPedidos.value);
    } catch (error) {
        console.error("Error al cargar pedidos", error);
    } finally {
        loading.value = false;
    }
};

//Funcion para cargar más pedidos
const loadMorePedidos = async (event: InfiniteScrollCustomEvent) => {
    console.log("loadMorePedidos productos.value.length", pedidos.value.length);
    console.log("loadMorePedidos totalProductos.value", totalPedidos.value);

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
        console.error("Error al cargar más pedidos", error);
    } finally {
        event.target.complete();
        loading.value = false;
    }
};

// const resetFiltros = () => {
//     // Resetear todos los filtros a sus valores iniciales
//     search.value = '';
//     clienteId.value = 0;
//     estadoId.value = 0;
//     regionId.value = 0;
    
//     // Establecer las fechas al rango por defecto (último mes)
//     const hoy = new Date();
//     fecha_hasta.value = hoy.toISOString();
    
//     const mesAnterior = new Date();
//     mesAnterior.setMonth(mesAnterior.getMonth() - 1);
//     fecha_desde.value = mesAnterior.toISOString();
// };

// Watch para cambios en los filtros
watch([fecha_desde, fecha_hasta, estadoId, regionId], async () => {
    console.log("fecha desde", fecha_desde.value);
    console.log("fecha hasta", fecha_hasta.value);
    console.log("estadoId", estadoId.value);
    console.log("regionId", regionId.value);

    page.value = 1;
    pedidos.value = [];
    loading.value = true;
    isLoading.value = true; // Mostrar spinner cuando cambian los filtros
    await obtenerPedidos();
});

onBeforeMount(async () => {
    isLoading.value = true; // Mostrar spinner al iniciar
    await obtenerPedidos();
    isLoading.value = false; // Ocultar spinner al cargar los pedidos
});

onMounted(async () => {
    estadoPedido.value = await estadoPedidoService.getEstadosPedido();
    regiones.value = await regionService.getRegiones();
});

// onIonViewDidEnter(async () => {
//     console.log("onIonViewDidEnter");
//     page.value = 1;
//     pedidos.value = [];
//     loading.value = true;
//     resetFiltros();
//     try {
//         await obtenerPedidos();
//         console.log("Pedidos cargados en onIonViewDidEnter:", pedidos.value);
//     } catch (error) {
//         console.error("Error al cargar pedidos", error);
//     }
// });
</script>

<style scoped>
.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin: 3rem 0;
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
</style>

