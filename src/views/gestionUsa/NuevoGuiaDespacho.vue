<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        default-href="/gestionUsa"
                        text="Volver"
                    />
                </ion-buttons>
                <ion-title>Crear guia de despacho</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-alert
                :is-open="mostrarAlerta"
                header="Seleccionar pedidos"
                message="Por favor, seleccione al menos un pedido para crear la guía de despacho."
                @didDismiss="mostrarAlerta = false"
                :buttons="[{text: 
                    'ACEPTAR', 
                    handler: () => mostrarAlerta = false
                }]"
            />
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label>Fecha de creación</ion-label>
                            <ion-datetime-button datetime="desde"/>
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
                                interface="popover"
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

            <ion-fab
                vertical="bottom"
                horizontal="end"
                slot="fixed"
            >
                <ion-fab-button
                color="primary" 
                @click="crearGuiaDespacho"
                >
                    <ion-icon :icon="document"/>
                </ion-fab-button>
            </ion-fab>

            <ion-infinite-scroll 
                @ionInfinite="loadMorePedidos" 
                threshold="100px"
            >
            <ion-infinite-scroll-content
                loading-spinner="bubbles"
                loading-text="Cargando más datos..."
            />
            </ion-infinite-scroll>
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
import { onBeforeMount, ref, watch } from 'vue';
import { EstadoPedido, Pedido, Region } from '@/interfaces/interfaces';
import pedidoService from '@/services/pedidoService';
import { InfiniteScrollCustomEvent } from '@ionic/vue';
import regionService from '@/services/regionService';
import { document } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { Storage } from '@ionic/storage';

// Variables
const regiones = ref<Region[]>([]);
const estadoPedido = ref<EstadoPedido[]>([]);
const pedidos = ref<Pedido[]>([]);
const pedidosSeleccionados = ref<Pedido[]>([]);
const mostrarAlerta = ref<boolean>(false);
const router = useRouter();

//Varialbes para el infinite scroll
const totalPedidos = ref<number>(0);
const page = ref<number>(1);
const loading = ref<boolean>(false);

// Variables para el filtro
const search = ref<string>('');
const clienteId = ref<number>(0);
const estadoId = ref<number>(0);
const regionId = ref<number>(0);
const fecha_desde = ref<string>(new Date().toISOString())
const fecha_hasta = ref<string>(new Date().toISOString());

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
        console.log("Respuesta de la API:", response.pedidos); // Verifica la respuesta
        // Los pedidos tienen guia_despacho_id = null???? 
        if (response.pedidos) {
            const pedidosFiltrados = response.pedidos.filter((pedido: Pedido) => pedido.guia_despacho_id === null);
            pedidos.value.push(...pedidosFiltrados);
            console.log("Pedidos desde nueva guia de despacho", pedidos.value);
        }
        totalPedidos.value = response.total || 0;
    } catch (error) {
        console.error("Error al cargar clientes", error);
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
    console.error("Error al cargar más clientes", error);
  } finally {
    event.target.complete();
    loading.value = false;
  }
};

// Watch para cambios en los filtros
watch([fecha_desde, fecha_hasta, estadoId, regionId], async () => {

    console.log("fecha desde", fecha_desde.value);
    console.log("fecha hasta", fecha_hasta.value);

    console.log("estadoId", estadoId.value);
    console.log("regionId", regionId.value);

    page.value = 1;
    pedidos.value = [];

    await obtenerPedidos();
});

//Funcion para seleccionar un pedido
const seleccionarPedido = (pedido: Pedido) => {
    pedidosSeleccionados.value.push(pedido);
    console.log("Pedido seleccionado", pedido);
    console.log("Pedidos totales", pedidosSeleccionados.value);
};

//Funcion para deseleccionar un pedido
const deseleccionarPedido = (pedido: Pedido) => {
    pedidosSeleccionados.value = pedidosSeleccionados.value.filter((p) => p.id !== pedido.id);
    console.log("Pedido deseleccionado", pedido);
    console.log("Pedidos totales", pedidosSeleccionados.value);
};





//Funcion para crear la guia de despacho
const crearGuiaDespacho = async () => {

    if (pedidosSeleccionados.value.length === 0) {
        mostrarAlerta.value = true;
        return;
    }
    const storage = new Storage();
    storage.create();
    await storage.set('pedidosSeleccionados', JSON.stringify(pedidosSeleccionados.value));
    await router.push({ name: 'guia' });
    console.log("Pedidos seleccionados", pedidosSeleccionados.value);
};



onBeforeMount(async () => {
    estadoPedido.value = await estadoPedidoService.getEstadosPedido();
    regiones.value = await regionService.getRegiones();
    // pedidos.value = await pedidoService.getPedidos();
    await obtenerPedidos();
    console.log("Pedidos desde pedidoPage",pedidos.value);
    console.log("Estados desde pedidoPage",estadoPedido.value);
});
</script>

<style scoped>
</style>

