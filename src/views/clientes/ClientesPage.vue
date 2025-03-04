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

    <ion-content class="ion-padding">
      <!-- Contenedor fijo para el buscador y filtro -->
      <div class="fixed-header">
        <!-- Barra de búsqueda -->
        <ion-searchbar
          placeholder="Buscar cliente"
          show-clear-button="focus"
          class="searchbar"
          v-model="searchQuery"
        ></ion-searchbar>

        <!-- Filtro por región -->
        <ion-select
          label="Filtrar por región"
          interface="popover"
          v-model="filtroRegion"
          class="filtro-region"
          @ionChange="filtrarClientes"
        >
          <ion-select-option value="norte">Norte</ion-select-option>
          <ion-select-option value="centro">Centro</ion-select-option>
          <ion-select-option value="sur">Sur</ion-select-option>
        </ion-select>
      </div>

      <!-- Lista de clientes -->
      <ion-grid>
        <ion-row>
          <ion-col
            size="12"
            size-md="6"
            size-lg="4"
            v-for="(cliente) in clientes"
            :key="cliente.id"
          >
            <ion-card class="card-cliente" @click="verDetallesCliente(cliente)">
              <ion-card-header>
                <ion-card-title>{{ cliente.persona.nombre }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p><strong>ID:</strong> {{ cliente.id }}</p>
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

      <!-- Infinite Scroll -->
      <ion-infinite-scroll threshold="100px" @ionInfinite="loadMoreClients">
        <ion-infinite-scroll-content
          loading-text="Cargando más clientes..."
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <!-- Botón FAB para agregar nuevo cliente -->
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

    <!-- Modal para agregar nuevo cliente -->
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
        <!-- Aquí se agregan los campos del formulario -->
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoCliente.nombre"
            type="text"
            label="Nombre"
            label-placement="stacked"
            placeholder="Ingrese el nombre del cliente"
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoCliente.id"
            type="text"
            label="Rut"
            label-placement="stacked"
            placeholder="Ingrese el rut del cliente"
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoCliente.telefono"
            type="text"
            label="Teléfono"
            label-placement="stacked"
            placeholder="Ingrese el teléfono del cliente"
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoCliente.email"
            type="email"
            label="Email"
            label-placement="stacked"
            placeholder="Ingrese el email del cliente"
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-select
            v-model="nuevoCliente.region"
            label="Región"
            label-placement="stacked"
            placeholder="Seleccione la región"
          >
            <ion-select-option value="norte">Norte</ion-select-option>
            <ion-select-option value="centro">Centro</ion-select-option>
            <ion-select-option value="sur">Sur</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-select
            v-model="nuevoCliente.comuna"
            label="Comuna"
            label-placement="stacked"
            placeholder="Seleccione la comuna"
          >
            <ion-select-option value="Arica">Arica</ion-select-option>
            <ion-select-option value="Quilpue">Quilpue</ion-select-option>
            <ion-select-option value="Santiago">Santiago</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoCliente.email"
            type="text"
            label="Dirección"
            label-placement="stacked"
            placeholder="Ingrese la dirección del cliente"
          ></ion-input>
        </ion-item>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonModal,
  IonPage,
} from "@ionic/vue";

import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { add } from "ionicons/icons";
import { Storage } from "@ionic/storage";
import debounce from "lodash.debounce";
import { Cliente } from "@/interfaces/interfaces"



// Variables
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL; // Actualiza la URL de la API
const modalAgregarAbierto = ref(false);
const nuevoCliente = ref({
  nombre: "",
  id: "",
  telefono: "",
  email: "",
  region: "",
  comuna: "",
});
const filtroRegion = ref("");
const searchQuery = ref("");
const clientes = ref<Cliente[]>([]);
const page = ref(1);
const loading = ref(false);
const storage = new Storage();
const totalClientes = ref(0); // Total de clientes disponibles

// Función para cargar clientes
const cargarClientes = async () => {
  console.log("dato search", searchQuery.value);

  await storage.create();
  const storedToken = await storage.get("authToken");
  const token = storedToken;

  if (!token) {
    console.error("Token no encontrado");
    return;
  }

  try {
    loading.value = true;

    const response = await axios.get(`${API_URL}/cliente`, {
      headers: {
        "x-token": token,
      },
      params: {
        page: page.value,
        region: filtroRegion.value,
        search: searchQuery.value,
      },
    });

    if (response.data && response.data.clientes) {
      clientes.value.push(...response.data.clientes); // Usamos el spread operator para agregar los clientes
      page.value += 1; // Aumentar la página

      // Actualizar el total de clientes
      totalClientes.value = response.data.total; // Asegúrate de que la API devuelva este valor
    }
  } catch (error) {
    console.error("Error al cargar clientes", error);
  } finally {
    loading.value = false;
  }
};

// Función para filtrar clientes según la búsqueda o la región
const filtrarClientes = debounce(async () => {
  if (searchQuery.value.length > 3) {
    // Solo ejecuta la búsqueda si hay más de 3 caracteres
    page.value = 1; // Reiniciar la página
    clientes.value = []; // Limpiar la lista de clientes
    await cargarClientes(); // Cargar los clientes filtrados
  }
}, 300); // Retraso de 300 ms

// Watch para cambios en la búsqueda (searchQuery)
watch(searchQuery, async () => {
  console.log("Ingreso al watch de búsqueda");

  if (searchQuery.value.length > 3) {
    await filtrarClientes();
  } else {
    // Si el texto es menor o igual a 3 caracteres, reiniciar los resultados
    clientes.value = [];
    totalClientes.value = 0;
  }
});

// Watch para cambios en la región (filtroRegion)
watch(filtroRegion, async () => {
  console.log("Ingreso al watch de filtro de región");

  page.value = 1; // Reiniciar la página al cambiar de región
  clientes.value = []; // Limpiar la lista de clientes
  await cargarClientes(); // Cargar los clientes filtrados por región
});

// Método para cargar más clientes con Infinite Scroll
const loadMoreClients = async (event: any) => {
  if (!loading.value && clientes.value.length < totalClientes.value) {
    await cargarClientes();
  }

  if (clientes.value.length >= totalClientes.value) {
    event.target.disabled = true; // Deshabilitar el scroll si no hay más datos
  }

  event.target.complete(); // Completar la solicitud de scroll
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
    const response = await axios.post(
      `${API_URL}/cliente`,
      nuevoCliente.value,
      {
        headers: {
          "x-token": token,
        },
      }
    );

    if (response.data) {
      console.log("Cliente agregado exitosamente", response.data);
      cerrarModalAgregar();
      cargarClientes(); // Recargar la lista de clientes
    }
  } catch (error) {
    console.error("Error al agregar cliente", error);
  }
};

// Ver detalles del cliente
const verDetallesCliente = (cliente: Cliente) => {
  // Redirige a la página de detalles del cliente (ajusta la ruta según tu configuración)
  router.push({ name: "detalleCliente", params: { id: cliente.id } });
};
</script>

<style scoped>
/* Estilo para la página */
.fixed-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  padding: 10px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Estilo para la barra de búsqueda */
.searchbar {
  margin-bottom: 20px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.searchbar::part(input) {
  padding: 10px;
}

/* Estilo para el filtro por región */
.filtro-region {
  margin-bottom: 20px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

/* Estilo para las tarjetas de los clientes */
.card-cliente {
  cursor: pointer;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.card-cliente:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

/* Estilo para el FAB (Floating Action Button) */
.fab-button {
  margin-bottom: 20px;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #3880ff;
}

/* Estilo para los campos del formulario en el modal */
.item-formulario {
  margin-bottom: 20px;
}

.item-formulario ion-input {
  border-radius: 8px;
  background-color: #f8f8f8;
}

/* Mejorar la visibilidad del filtro */
.ion-select {
  margin-top: 10px;
}
</style>
