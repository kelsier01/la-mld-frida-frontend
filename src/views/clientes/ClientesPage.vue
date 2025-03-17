<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Clientes</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          placeholder="Buscar cliente"
          v-model="searchQuery"
        />
      </ion-toolbar>
      <ion-toolbar>
        <ion-select
          label="Filtrar por región"
          interface="modal"
          v-model="filtroRegion"
          class="filtro-region"
          @ionChange="filtrarClientes"
        >
          <ion-select-option value="0">Todas las regiones</ion-select-option>
          <ion-select-option
            v-for="region in regiones"
              :key="region.id"
              :value="region.id"
            >
            {{region.nombre}}
            </ion-select-option>  
        </ion-select>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" @ionInfinite="loadMoreClients">
      <ion-grid>
        <ion-row>
          <ion-col
            size="12"
            size-md="6"
            size-lg="4"
            v-for="cliente in clientes"
            :key="cliente.id"
          >
           <ClienteCard 
            :cliente="cliente" 
            />
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
      <AgregarClienteModal />
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { InfiniteScrollCustomEvent } from "@ionic/vue";
import { ref, onMounted, watch } from "vue";
import { add } from "ionicons/icons";
import debounce from "lodash.debounce";
import { Cliente, Region } from "@/interfaces/interfaces";
import clienteService from "@/services/clienteService";
import AgregarClienteModal from "@/components/AgregarClienteModal.vue";
import ClienteCard from "@/components/ClienteCard.vue";
import regionService from "@/services/regionService";


const regiones = ref<Region[]>();
const modalAgregarAbierto = ref(false);
const nuevoCliente = ref({
  nombre: "",
  id: "",
  telefono: "",
  email: "",
  region: "",
  comuna: "",
});

//Variables para el filtro
const filtroRegion = ref(0);
const searchQuery = ref("");
const clientes = ref<Cliente[]>([]);
const page = ref(1);
const loading = ref(false);
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

// Cargar regiones al montar el componente
const cargarRegiones = async() =>{
  try {
    const response = await regionService.getRegiones();
    regiones.value = response;
  } catch (error) {
    console.error("Error al cargar regiones", error);
  }
}

// Cargar clientes al montar el componente
onMounted(() => {
  cargarClientes();
  cargarRegiones();
});


</script>

<style scoped>
.fixed-header {
  position: sticky;
  top: 0;
  z-index: 10;
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
