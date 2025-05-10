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
        <ion-searchbar placeholder="Buscar cliente" v-model="searchQuery" />
      </ion-toolbar>
      <ion-toolbar>
        <ion-item lines="none">
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
              {{ region.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>
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
            <ClienteCard :cliente="cliente" />
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
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
      <AgregarClienteModal
        @cerrar="cerrarModalAgregar"
        @guardar="guardarCliente"
      />
    </ion-modal>
    <!-- Alerta de resultado (éxito o error) -->
    <ion-alert
      :is-open="showResultAlert"
      :header="alertHeader"
      :message="alertMessage"
      :backdropDismiss="false"
      :buttons="[
        {
          text: 'Aceptar',
          handler: () => {
            if (isSuccess) {
              ionRouter.navigate('/pedidos?refresh=true', 'root', 'replace');
            }
            showResultAlert = false;
          },
        },
      ]"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { InfiniteScrollCustomEvent, useIonRouter } from "@ionic/vue";
import { ref, onMounted, watch } from "vue";
import { add } from "ionicons/icons";
import debounce from "lodash.debounce";
import { Cliente, Region } from "@/interfaces/interfaces";
import clienteService from "@/services/clienteService";
import AgregarClienteModal from "@/components/AgregarClienteModal.vue";
import ClienteCard from "@/components/ClienteCard.vue";
import regionService from "@/services/regionService";
import { onIonViewWillEnter } from "@ionic/vue";

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
const ionRouter = useIonRouter();

//Variables para el filtro
const filtroRegion = ref(0);
const searchQuery = ref("");
const clientes = ref<Cliente[]>([]);
const page = ref(1);
const loading = ref(false);
const totalClientes = ref(0);
//Variables para los alerts
const showResultAlert = ref<boolean>(false);
const alertMessage = ref<string>("");
const alertHeader = ref<string>("");
const isSuccess = ref<boolean>(false);

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
      // Filtrar clientes que no están eliminados (eliminado != 1)
      const clientesActivos = response.clientes.filter(
        (cliente: Cliente) => cliente.eliminado !== 1
      );
      clientes.value.push(...clientesActivos);
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

const guardarCliente = async (cliente: any) => {
  try {
    console.log("Cliente a guardar:", cliente);

    const response = await clienteService.postCliente(cliente);

    if (response) {
      console.log("Cliente registrado exitosamente:", response);

      // Mostrar alerta de éxito después de completar todas las operaciones
      alertHeader.value = "Éxito";
      alertMessage.value = "Cliente registrado correctamente.";
      isSuccess.value = true;
      showResultAlert.value = true;
    } else {
      console.error(
        "No se recibió respuesta del servicio al registrar el cliente."
      );

      alertHeader.value = "Error";
      alertMessage.value = "No se pudo registrar el cliente.";
      isSuccess.value = false;
      showResultAlert.value = true;
    }
  } catch (error: any) {
    console.error("Error al guardar cliente:", error);

    // Extraer el mensaje desde error en caso de estar disponible
    const message =
      error?.message || "Error desconocido al registrar el cliente.";

    alertHeader.value = "Error";
    alertMessage.value = message;
    isSuccess.value = false;
    showResultAlert.value = true;
  }
};

// Cargar regiones al montar el componente
const cargarRegiones = async () => {
  try {
    const response = await regionService.getRegiones();
    regiones.value = response;
  } catch (error) {
    console.error("Error al cargar regiones", error);
  }
};

// Cargar clientes al montar el componente
onMounted(async () => {
  await cargarRegiones();
  await cargarClientes();
});

// Hook para recargar cuando se navegue a la página
onIonViewWillEnter(() => {
  page.value = 1;
  clientes.value = [];
  cargarClientes();
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
