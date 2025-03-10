<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Clientes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" @ionInfinite="loadMoreClients">
      <div class="fixed-header">
        <ion-searchbar
          placeholder="Buscar cliente"
          show-clear-button="focus"
          class="searchbar"
          v-model="searchQuery"
        ></ion-searchbar>

        <ion-select
          label="Filtrar por región"
          interface="popover"
          v-model="filtroRegion"
          class="filtro-region"
          @ionChange="filtrarClientes"
        >
          <ion-select-option value="1">Norte</ion-select-option>
          <ion-select-option value="2">Centro</ion-select-option>
          <ion-select-option value="3">Sur</ion-select-option>
          <ion-select-option value="0">Todos</ion-select-option>
        </ion-select>
      </div>

      <ion-grid>
        <ion-row>
          <ion-col
            size="12"
            size-md="6"
            size-lg="4"
            v-for="cliente in clientes"
            :key="cliente.id"
          >
            <ion-card class="card-cliente" @click="verDetallesCliente(cliente)">
              <ion-card-header>
                <ion-card-title>{{ cliente.persona.nombre }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>
                  <strong>Rut / Dni:</strong>
                  {{ cliente.persona.n_identificacion }}
                </p>
                <p><strong>Teléfono:</strong> {{ cliente.persona.fono }}</p>
                <p>
                  <strong>Email:</strong> {{ cliente.persona.correo || "N/D" }}
                </p>
                <p>
                  <strong>Región:</strong>
                  <span v-if="cliente.Direccions.length > 0">
                    {{ cliente.Direccions[0].region }}
                  </span>
                  <span v-else>No disponible</span>
                </p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-infinite-scroll @ionInfinite="loadMoreClients" threshold="100px">
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="Cargando más datos..."
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <ion-fab
        slot="fixed"
        vertical="bottom"
        horizontal="end"
        class="fab-button"
      >
        <ion-fab-button @click="abrirModalAgregar">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Cliente</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalAgregar">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="confirmarAgregarCliente">Guardar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoCliente.nombre"
            type="text"
            label="Nombre"
            label-placement="stacked"
            placeholder="Ingrese el nombre del cliente"
          ></ion-input>
        </ion-item>
        <!-- Agregar más campos según el formulario -->
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
} from "@ionic/vue";
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { add } from "ionicons/icons";
import { Storage } from "@ionic/storage";
import debounce from "lodash.debounce";
import { Cliente } from "@/interfaces/interfaces";
import clienteService from "@/services/clienteService";

// Variables y referencias
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;
const modalAgregarAbierto = ref(false);
const nuevoCliente = ref({
  nombre: "",
  id: "",
  telefono: "",
  email: "",
  region: "",
  comuna: "",
});
const filtroRegion = ref(0);
const searchQuery = ref("");
const clientes = ref<Cliente[]>([]);
const page = ref(1);
const loading = ref(false);
const storage = new Storage();
const totalClientes = ref(0);

// Función para cargar clientes
const cargarClientes = async () => {
  try {
    const response = await clienteService.getAllClientes(
      page.value,
      filtroRegion.value,
      searchQuery.value
    );
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    if (response.clientes) {
      clientes.value.push(...response.clientes);
    }
    totalClientes.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar clientes", error);
  } finally {
    loading.value = false;
  }
};

// Función para filtrar clientes
const filtrarClientes = debounce(async () => {
  page.value = 1;
  clientes.value = [];
  await cargarClientes();
}, 300);

// Watch para cambios en la búsqueda
watch(searchQuery, async () => {
  await filtrarClientes();
});

// Watch para cambios en la región
watch(filtroRegion, async () => {
  page.value = 1;
  clientes.value = [];
  await cargarClientes();
});

// Método para cargar más clientes (Infinite Scroll)
const loadMoreClients = async (event: InfiniteScrollCustomEvent) => {
  console.log("loadMoreClients ejecutado");

  if (loading.value || clientes.value.length >= totalClientes.value) {
    event.target.complete();
    event.target.disabled = true;
    return;
  }

  loading.value = true;
  page.value++;

  try {
    await cargarClientes();
  } catch (error) {
    console.error("Error al cargar más clientes", error);
  } finally {
    event.target.complete();
    loading.value = false;
  }
};

// Cargar clientes al montar el componente
onMounted(() => {
  cargarClientes();
});

// Abrir el modal para agregar cliente
const abrirModalAgregar = () => {
  modalAgregarAbierto.value = true;
};

// Cerrar el modal de agregar cliente
const cerrarModalAgregar = () => {
  modalAgregarAbierto.value = false;
  nuevoCliente.value = {
    nombre: "",
    id: "",
    telefono: "",
    email: "",
    region: "",
    comuna: "",
  };
};

// Confirmar la adición del cliente
const confirmarAgregarCliente = async () => {
  if (!nuevoCliente.value.nombre || !nuevoCliente.value.telefono) {
    console.error("Faltan campos requeridos");
    return;
  }

  const storedToken = await storage.get("authToken");
  const token = JSON.parse(storedToken);

  if (!token) {
    console.error("Token no encontrado");
    return;
  }

  try {
    // Lógica para agregar cliente
    // Ejemplo: await clienteService.agregarCliente(nuevoCliente.value, token);
    // Si la respuesta es exitosa:
    // cerrarModalAgregar();
    // Reiniciar y recargar la lista de clientes:
    // page.value = 1;
    // clientes.value = [];
    // await cargarClientes();
  } catch (error) {
    console.error("Error al agregar cliente", error);
  }
};

// Ver detalles del cliente
const verDetallesCliente = (cliente: Cliente) => {
  router.push({ name: "detalleCliente", params: { id: cliente.id } });
};
</script>

<style scoped>
.fixed-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
}

.searchbar {
  margin-bottom: 10px;
}

.filtro-region {
  -webkit-padding-start: 12px;
  padding-inline-start: 12px;
  -webkit-padding-end: 12px;
  padding-inline-end: 12px;
}

.card-cliente {
  margin-bottom: 15px;
}

ion-grid {
  min-height: 150vh; /* Forzar un alto mínimo para poder disparar el scroll */
}
</style>
