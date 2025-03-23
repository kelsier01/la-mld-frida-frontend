<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Marcas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content
      class="marcas-content ion-padding"
      :scrollEvents="true"
      @ionInfinite="loadMoreMarcas"
    >
      <ion-item>
        <ion-searchbar
          show-clear-button="focus"
          placeholder="Buscar marca"
          v-model="searchQuery"
        ></ion-searchbar>
      </ion-item>
      <ion-list :inset="true">
        <ion-list-header> Marcas </ion-list-header>
        <ion-item v-for="(marca, index) in marcas" :key="index">
          <ion-label>{{ marca.nombre }}</ion-label>
          <ion-button fill="clear" slot="end" @click="abrirModalEditar(index)">
            <ion-icon :icon="pencil" color="primary"></ion-icon>
          </ion-button>
          <ion-button fill="clear" slot="end" @click="eliminarMarca(index)">
            <ion-icon :icon="trashOutline" color="danger"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-infinite-scroll @ionInfinite="loadMoreMarcas" threshold="100px">
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="Cargando más datos..."
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>
      <!-- Botón FAB para agregar nueva marca -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="abrirModalAgregar">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Modal para agregar nueva marca -->
    <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Marca</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalAgregar">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="confirmarAgregarMarca">Confirmar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            v-model="nuevaMarca"
            type="text"
            label="Nueva Marca"
            label-placement="stacked"
            :clear-input="true"
          ></ion-input>
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- Modal para editar marca -->
    <ion-modal :is-open="modalAbierto" @didDismiss="cerrarModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Marca</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModal">Cerrar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="guardarCambios">Guardar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            v-model="marcaEditada"
            type="text"
            label="Editar Marca"
            label-placement="stacked"
            :clear-input="true"
          ></ion-input>
        </ion-item>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonContent,
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
  IonIcon,
  IonModal,
  IonButtons,
  IonToolbar,
  IonSearchbar,
  IonFab,
  IonFabButton,
  InfiniteScrollCustomEvent,
} from "@ionic/vue";
import { onMounted, ref, watch } from "vue";
import { pencil, trashOutline, add } from "ionicons/icons";
import debounce from "lodash.debounce";
import marcaService from "@/services/marcaService";
import { Marca } from "@/interfaces/interfaces";

// Datos de ejemplo
const marcas = ref<Marca[]>([]);
const searchQuery = ref("");
const page = ref(1);
const loading = ref(false);
const totalMarcas = ref(0);

// Estado del modal de edición
const modalAbierto = ref(false);
const marcaEditada = ref<Marca[]>([]);
const indiceEdicion = ref<number | null>(null);

// Estado del modal de agregar
const modalAgregarAbierto = ref(false);
const nuevaMarca = ref("");

const debouncedCargarMarcas = debounce(async () => {
  page.value = 1;
  marcas.value = [];
  await cargarMarcas();
}, 300);

// Watch para cambios en la búsqueda
watch(searchQuery, debouncedCargarMarcas);

// Función para cargar Marcas
const cargarMarcas = async () => {
  try {
    const response = await marcaService.getMarcas(
      page.value,
      searchQuery.value
    );
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    if (response.marcas) {
      marcas.value.push(...response.marcas);
    }
    totalMarcas.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar Marcas", error);
  } finally {
    loading.value = false;
  }
};

// Método para cargar más Marcas (Infinite Scroll)
const loadMoreMarcas = async (event: InfiniteScrollCustomEvent) => {
  console.log("loadMoreClients ejecutado"); // este no lo muestra

  if (loading.value || marcas.value.length >= totalMarcas.value) {
    event.target.complete();
    event.target.disabled = true;
    return;
  }

  loading.value = true;
  page.value++;

  try {
    await cargarMarcas();
  } catch (error) {
    console.error("Error al cargar más Marcas", error);
  } finally {
    event.target.complete();
    loading.value = false;
  }
};

// Cargar clientes al montar el componente
onMounted(() => {
  cargarMarcas();
});

// Abrir modal para agregar
const abrirModalAgregar = () => {
  modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
  modalAgregarAbierto.value = false;
  nuevaMarca.value = "";
};

// Confirmar agregar marca
const confirmarAgregarMarca = async () => {
  if (nuevaMarca.value.trim() !== "") {
    const response = await marcaService.agregarMarca({
      nombre: nuevaMarca.value,
    });
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    // Agregar la nueva marca a la lista
    if (response) {
      marcas.value.push({ ...response });
      cerrarModalAgregar();
    }
  } else {
    alert("Por favor, complete todos los campos.");
  }
};

// Abrir modal para editar
const abrirModalEditar = (index: number) => {
  indiceEdicion.value = index;
  marcaEditada.value[0] = marcas.value[index];
  modalAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModal = () => {
  modalAbierto.value = false;
  marcaEditada.value = [];
  indiceEdicion.value = null;
};

// Guardar cambios en edición
const guardarCambios = () => {
  if (indiceEdicion.value !== null) {
    marcas.value[indiceEdicion.value] = marcaEditada.value[0];
  }
  cerrarModal();
};

// Eliminar marca
const eliminarMarca = (index: number) => {
  marcas.value.splice(index, 1);
};
</script>

<style scoped>
.marcas-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.marcas-content {
  flex: 1;
  padding: 16px;
}
</style>
