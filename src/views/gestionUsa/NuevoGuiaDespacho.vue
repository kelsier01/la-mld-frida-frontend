<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button text="Volver" />
        </ion-buttons>
        <ion-title>Crear Guia de Despacho</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-item>
                <ion-label>Fecha de creación</ion-label>
                <ion-datetime-button datetime="desde" />
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
                  :disabled="loading"
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
                  interface="popover"
                  :disabled="loading"
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
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" @ionInfinite="loadMorePedidos">
      <!-- Alertas -->
      <ion-alert
        :is-open="mostrarAlerta"
        header="Seleccionar pedidos"
        message="Por favor, seleccione al menos un pedido para crear la guía de despacho."
        @didDismiss="mostrarAlerta = false"
        :buttons="[{ text: 'ACEPTAR', handler: () => (mostrarAlerta = false) }]"
      />

      <!-- Spinner de carga inicial -->
      <div class="loading-container" v-if="initialLoading">
        <ion-spinner name="circular" color="primary"></ion-spinner>
        <p>Cargando datos...</p>
      </div>

      <div v-else>
        <div class="loading-overlay" v-if="loading && !initialLoading">
          <ion-spinner name="dots" color="primary"></ion-spinner>
          <p>Filtrando pedidos...</p>
        </div>

        <!-- Lista de pedidos -->
        <ion-grid v-if="pedidos.length > 0">
          <ion-row>
            <ion-col
              v-for="pedido in pedidos"
              :key="pedido.id"
              size="12"
              size-md="6"
              size-lg="4"
            >
              <PedidoCard
                :conCheckBox="true"
                :pedido="pedido"
                @seleccionarPedido="seleccionarPedido"
                @deseleccionarPedido="deseleccionarPedido"
              />
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Mensaje cuando no hay pedidos -->
        <div class="no-data-container" v-if="!loading && pedidos.length === 0">
          <ion-icon :icon="alertCircleOutline" class="no-data-icon" />
          <p>No se encontraron pedidos sin guía de despacho</p>
        </div>
        <!-- Infinite scroll -->
        <ion-infinite-scroll @ionInfinite="loadMorePedidos" threshold="100px">
          <ion-infinite-scroll-content
            loading-spinner="bubbles"
            loading-text="Cargando más pedidos..."
          />
        </ion-infinite-scroll>
      </div>
      <!-- Botón flotante para crear guía -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button
          color="primary"
          @click="crearGuiaDespacho"
          :disabled="procesandoGuia"
        >
          <ion-spinner
            v-if="procesandoGuia"
            name="crescent"
            class="spinner-button"
          ></ion-spinner>
          <ion-icon v-else :icon="document" />
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
import { onBeforeMount, ref, watch } from "vue";
import { EstadoPedido, Pedido, Region } from "@/interfaces/interfaces";
import pedidoService from "@/services/pedidoService";
import { InfiniteScrollCustomEvent } from "@ionic/vue";
import regionService from "@/services/regionService";
import { alertCircleOutline, document } from "ionicons/icons";
import { useRouter } from "vue-router";
import { Storage } from "@ionic/storage";
import { onIonViewWillEnter } from "@ionic/vue";

// Variables para los datos
const regiones = ref<Region[]>([]);
const estadoPedido = ref<EstadoPedido[]>([]);
const pedidos = ref<Pedido[]>([]);
const pedidosSeleccionados = ref<Pedido[]>([]);
const mostrarAlerta = ref<boolean>(false);
const router = useRouter();

// Variables para el infinite scroll
const totalPedidos = ref<number>(0);
const page = ref<number>(1);

// Variables para los estados de carga
const initialLoading = ref<boolean>(true);
const loading = ref<boolean>(false);
const procesandoGuia = ref<boolean>(false);

// Variables para el filtro
const search = ref<string>("");
const cliente = ref<string>("");
const estadoId = ref<number>(0);
const regionId = ref<number>(0);
const fecha_desde = ref<string>("2025-01-01T00:00:00.000Z");
const fecha_hasta = ref<string>(new Date().toISOString());

// Función para obtener los pedidos
const obtenerPedidos = async () => {
  loading.value = true;
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

    // Filtrar solo pedidos sin guía de despacho
    if (response.pedidos) {
      const pedidosFiltrados = response.pedidos.filter(
        (pedido: Pedido) => pedido.guia_despacho_id === null
      );

      // Agregar los pedidos filtrados al array
      pedidos.value.push(...pedidosFiltrados);

      // Si no hay pedidos filtrados pero hay pedidos en la respuesta, buscar automáticamente en la siguiente página
      if (
        pedidosFiltrados.length === 0 &&
        response.pedidos.length > 0 &&
        page.value < 10
      ) {
        // Límite de 10 páginas para evitar bucle infinito
        console.log(
          "No hay pedidos sin guía en la página",
          page.value,
          "buscando en la siguiente página"
        );
        page.value++;
        await obtenerPedidos(); // Llamada recursiva para buscar en la siguiente página
        return; // Importante: salir para no ejecutar el resto del código
      }

      console.log("Pedidos desde nueva guia de despacho", pedidos.value);
    }

    // Solo actualizar el total cuando no estamos en una llamada recursiva
    totalPedidos.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar pedidos", error);
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

// Función para cargar más pedidos
const loadMorePedidos = async (event: InfiniteScrollCustomEvent) => {
  console.log("loadMorePedidos productos.value.length", pedidos.value.length);
  console.log("loadMorePedidos totalProductos.value", totalPedidos.value);

  // No cargar más si estamos en proceso de carga
  if (loading.value) {
    event.target.complete();
    return;
  }

  const prevLength = pedidos.value.length;
  page.value++;
  loading.value = true;

  try {
    await obtenerPedidos();

    // Si no se añadieron nuevos pedidos después de cargar, desactivar el infinite scroll
    if (pedidos.value.length === prevLength) {
      event.target.disabled = true;
    }
  } catch (error) {
    console.error("Error al cargar más pedidos", error);
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
  loading.value = true;

  await obtenerPedidos();

  loading.value = false;
});

// Función para seleccionar un pedido
const seleccionarPedido = (pedido: Pedido) => {
  pedidosSeleccionados.value.push(pedido);
  console.log("Pedido seleccionado", pedido);
  console.log("Pedidos totales", pedidosSeleccionados.value);
};

// Función para deseleccionar un pedido
const deseleccionarPedido = (pedido: Pedido) => {
  pedidosSeleccionados.value = pedidosSeleccionados.value.filter(
    (p) => p.id !== pedido.id
  );
  console.log("Pedido deseleccionado", pedido);
  console.log("Pedidos totales", pedidosSeleccionados.value);
};

// Función para crear la guía de despacho
const crearGuiaDespacho = async () => {
  if (pedidosSeleccionados.value.length === 0) {
    mostrarAlerta.value = true;
    return;
  }

  procesandoGuia.value = true;
  try {
    const storage = new Storage();
    await storage.create();
    await storage.set(
      "pedidosSeleccionados",
      JSON.stringify(pedidosSeleccionados.value)
    );
    await router.push({ name: "guia" });
    console.log("Pedidos seleccionados", pedidosSeleccionados.value);
  } catch (error) {
    console.error("Error al crear guía de despacho:", error);
  } finally {
    procesandoGuia.value = false;
  }
};

// Función para resetear y recargar los pedidos
const resetearYCargarPedidos = async () => {
  // Reiniciar variables
  page.value = 1;
  pedidos.value = [];
  pedidosSeleccionados.value = [];
  initialLoading.value = true;

  try {
    // Recargar datos
    await obtenerPedidos();
  } catch (error) {
    console.error("Error al recargar pedidos:", error);
  } finally {
    initialLoading.value = false;
  }
};

// Asegurarse que se ejecute cuando la vista está a punto de entrar
onIonViewWillEnter(() => {
  console.log("Vista NuevoGuiaDespacho entrando - recargando datos ...........................");
  resetearYCargarPedidos();
});

// Cargar datos iniciales
onBeforeMount(async () => {
  initialLoading.value = true;
  try {
    // Cargar estados y regiones en paralelo para optimizar
    const [estados, regiones1] = await Promise.all([
      estadoPedidoService.getEstadosPedido(),
      regionService.getRegiones(),
    ]);

    estadoPedido.value = estados;
    regiones.value = regiones1;

    // Luego cargar los pedidos
    //await obtenerPedidos();

    console.log("Pedidos desde pedidoPage", pedidos.value);
    console.log("Estados desde pedidoPage", estadoPedido.value);
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
  } finally {
    initialLoading.value = false;
  }
});
</script>

<style scoped>
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

.loading-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.loading-overlay ion-spinner {
  width: 36px;
  height: 36px;
  margin-bottom: 0.5rem;
}

.spinner-button {
  width: 24px;
  height: 24px;
}

.no-data-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  text-align: center;
  color: var(--ion-color-medium);
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 1rem;
}
</style>
