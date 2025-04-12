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
          v-model="cliente"
          @ionInput="resetPedidosYBuscar"
        />
      </ion-toolbar>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-item>
                  <ion-label>Desde</ion-label>
                  <ion-datetime-button datetime="desde" />
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item>
                  <ion-label>Hasta</ion-label>
                  <ion-datetime-button datetime="hasta" />
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
                    <ion-select-option value="0"
                      >Todos los estados
                    </ion-select-option>
                    <ion-select-option
                      v-for="estado in estadoPedido"
                      :key="estado.id"
                      :value="estado.id"
                    >
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
                    <ion-select-option value="0"
                      >Todas las regiones
                    </ion-select-option>
                    <ion-select-option
                      v-for="region in regiones"
                      :key="region.id"
                      :value="region.id"
                    >
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
        <ion-spinner name="circular" />
        <p>Cargando pedidos...</p>
      </div>

      <!-- Contenido principal (se muestra cuando no está cargando) -->
      <div v-else>
        <!-- Mensaje cuando no hay pedidos -->
        <ion-card v-if="pedidos.length === 0 && !loading">
          <ion-card-content class="ion-text-center">
            <ion-icon
              :icon="alertCircleOutline"
              class="no-data-icon"
            ></ion-icon>
            <p>No se encontraron pedidos con los filtros seleccionados</p>
          </ion-card-content>
        </ion-card>

        <ion-grid>
          <ion-row>
            <ion-col
              v-for="pedido in pedidos"
              :key="pedido.id"
              size="12"
              size-md="6"
              size-lg="4"
            >
              <PedidoCard :conCheckBox="false" :pedido="pedido" />
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-infinite-scroll @ionInfinite="loadMorePedidos" threshold="50px">
          <ion-infinite-scroll-content
            loading-spinner="bubbles"
            loading-text="Cargando más datos..."
          />
        </ion-infinite-scroll>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" @click="NavegarACrearPedido">
          <IonIcon :icon="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Modal Desde -->
    <ion-modal :keep-contents-mounted="true">
      <ion-datetime id="desde" presentation="date" v-model="fecha_desde">
        <span slot="title">Selecciona una fecha de inicio</span>
      </ion-datetime>
    </ion-modal>

    <!-- Modal Hasta -->
    <ion-modal :keep-contents-mounted="true">
      <ion-datetime id="hasta" presentation="date" v-model="fecha_hasta">
        <span slot="title">Selecciona una fecha de fin</span>
      </ion-datetime>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import PedidoCard from "@/components/PedidoCard.vue";
import estadoPedidoService from "@/services/estadoPedidoService";
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { EstadoPedido, Pedido, Region } from "@/interfaces/interfaces";
import pedidoService from "@/services/pedidoService";
import { InfiniteScrollCustomEvent, onIonViewDidEnter } from "@ionic/vue";
import regionService from "@/services/regionService";
import { useRouter, useRoute } from "vue-router";
import { add, alertCircleOutline } from "ionicons/icons";

// Variables
const regiones = ref<Region[]>([]);
const estadoPedido = ref<EstadoPedido[]>([]);
const pedidos = ref<Pedido[]>([]);
const router = useRouter();
const route = useRoute();

//Varialbes para el infinite scroll
const totalPedidos = ref<number>(0);
const page = ref<number>(1);
const loading = ref<boolean>(false);
const isLoading = ref<boolean>(true); // Nueva variable para el spinner de carga

// Variables para el filtro
const search = ref<string>("");
const cliente = ref<string>("");
const estadoId = ref<number>(0);
const regionId = ref<number>(0);
// En el script
const fecha_desde = ref<string>("2025-01-01T00:00:00.000Z");

const fecha_hasta = ref<string>(new Date().toISOString());

// Funciones
const NavegarACrearPedido = () => {
  router.push({ name: "NuevoPedido" });
};

// Función para resetear pedidos y buscar con el filtro de texto
const resetPedidosYBuscar = async () => {
  page.value = 1;
  pedidos.value = [];
  loading.value = true;
  isLoading.value = true; // Mostrar el spinner mientras se cargan los datos
  await obtenerPedidos();
  isLoading.value = false; // Ocultar el spinner cuando termina la carga
};

//Funcion para obtener los pedidos
const obtenerPedidos = async () => {
  try {
    const response = await pedidoService.getPedidos(
      page.value,
      cliente.value,
      search.value,
      fecha_desde.value,
      fecha_hasta.value,
      estadoId.value,
      regionId.value
    );
    console.log("Respuesta de la API:", response.pedidos);
    if (response.pedidos) {
      pedidos.value.push(...response.pedidos);
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

const resetFiltros = () => {
  // Resetear todos los filtros a sus valores iniciales
  search.value = "";
  cliente.value = "";
  estadoId.value = 0;
  regionId.value = 0;
  // Establecer las fechas al rango por defecto (último mes)
  fecha_hasta.value = new Date().toISOString();
  fecha_desde.value = "2025-01-01T00:00:00.000Z";
};

// Watch para cambios en los filtros
watch(
  [fecha_desde, fecha_hasta, estadoId, regionId, cliente, search],
  async () => {
    if (!route.query.refresh) {
      page.value = 1;
      pedidos.value = [];
      loading.value = true;
      isLoading.value = true; // Mostrar spinner cuando cambian los filtros
      await obtenerPedidos();
      isLoading.value = false; // Mostrar spinner cuando cambian los filtros
    }
  }
);

onBeforeMount(async () => {
  isLoading.value = true; // Mostrar spinner al iniciar
  await obtenerPedidos();
  isLoading.value = false; // Ocultar spinner al cargar los pedidos
});

onMounted(async () => {
  estadoPedido.value = await estadoPedidoService.getEstadosPedido();
  regiones.value = await regionService.getRegiones();
});

onIonViewDidEnter(async () => {
  if (route.query.refresh) {
    resetFiltros();
    page.value = 1;
    pedidos.value = [];
    loading.value = true;
    try {
      await obtenerPedidos();
      isLoading.value = false; // Ocultar spinner al cargar los pedidos
    } catch (error) {
      console.error("Error al cargar pedidos", error);
    }
  }
});
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
