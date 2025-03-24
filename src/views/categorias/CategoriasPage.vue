<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"/>
        </ion-buttons>
        <ion-title>Categorías</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-searchbar
            show-clear-button="focus"
            placeholder="Buscar categoría"
            v-model="searchQuery"
          />
        </ion-item>
      </ion-toolbar>
    </ion-header>

    <div class="categorias-container">
      <ion-content
        class="categorias-content ion-padding"
        :scrollEvents="true"
        @ionInfinite="loadMoreCategorias"
      >
        <ion-list :inset="true">
          <ion-list-header class="ion-padding"> Categorías </ion-list-header>
          <ion-item v-for="(categoria, index) in categorias" :key="index">
            <ion-label>{{ categoria.nombre }}</ion-label>
            <ion-button
              fill="clear"
              slot="end"
              @click="abrirModalEditar(index)"
            >
              <ion-icon :icon="pencil" color="primary"></ion-icon>
            </ion-button>
            <ion-button
              fill="clear"
              slot="end"
              @click="eliminarCategoria(index)"
            >
              <ion-icon :icon="trashOutline" color="danger"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
        <ion-infinite-scroll
          @ionInfinite="loadMoreCategorias"
          threshold="100px"
        >
          <ion-infinite-scroll-content
            loading-spinner="bubbles"
            loading-text="Cargando más datos..."
          ></ion-infinite-scroll-content>
        </ion-infinite-scroll>
        <!-- Botón FAB para agregar nueva categoría -->
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button @click="abrirModalAgregar">
            <ion-icon :icon="add"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    </div>

    <!-- Modal para agregar nueva categoría -->
    <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Categoría</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalAgregar">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="confirmarAgregarCategoria"
              >Confirmar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            v-model="nuevaCategoria"
            type="text"
            label="Nueva Categoría"
            label-placement="stacked"
            :clear-input="true"
          ></ion-input>
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- Modal para editar categoría -->
    <ion-modal :is-open="modalAbierto" @didDismiss="cerrarModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Categoría</ion-title>
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
            v-model="categoriaEditada"
            type="text"
            label="Editar Categoría"
            label-placement="stacked"
            :clear-input="true"
          ></ion-input>
        </ion-item>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { InfiniteScrollCustomEvent } from "@ionic/vue";
import { onMounted, ref, watch } from "vue";
import { pencil, trashOutline, add } from "ionicons/icons";
import { Categoria } from "@/interfaces/interfaces";
import debounce from "lodash.debounce";
import categoriaService from "@/services/categoriaService";

// Datos de ejemplo
const categorias = ref<Categoria[]>([]);
const searchQuery = ref("");
const page = ref(1);
const loading = ref(false);
const totalCateegorias = ref(0);

const debouncedCargarCategorias = debounce(async () => {
  page.value = 1;
  categorias.value = [];
  await cargarCategorias();
}, 300);

// Watch para cambios en la búsqueda
watch(searchQuery, debouncedCargarCategorias);

// Función para cargar Marcas
const cargarCategorias = async () => {
  try {
    const response = await categoriaService.getCategoria(
      page.value,
      searchQuery.value
    );
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    if (response.categorias) {
      categorias.value.push(...response.categorias);
    }
    totalCateegorias.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar Marcas", error);
  } finally {
    loading.value = false;
  }
};

// Método para cargar más Marcas (Infinite Scroll)
const loadMoreCategorias = async (event: InfiniteScrollCustomEvent) => {
  console.log("loadMoreClients ejecutado"); // este no lo muestra

  if (loading.value || categorias.value.length >= totalCateegorias.value) {
    event.target.complete();
    event.target.disabled = true;
    return;
  }

  loading.value = true;
  page.value++;

  try {
    await cargarCategorias();
  } catch (error) {
    console.error("Error al cargar más Marcas", error);
  } finally {
    event.target.complete();
    loading.value = false;
  }
};

// Cargar clientes al montar el componente
onMounted(() => {
  cargarCategorias();
});

// Estado del modal de edición
const modalAbierto = ref(false);
const categoriaEditada = ref("");
const indiceEdicion = ref<number | null>(null);

// Estado del modal de agregar
const modalAgregarAbierto = ref(false);
const nuevaCategoria = ref("");

// Abrir modal para agregar
const abrirModalAgregar = () => {
  modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
  modalAgregarAbierto.value = false;
  nuevaCategoria.value = "";
};

// Confirmar agregar categoría
const confirmarAgregarCategoria = async () => {
  if (nuevaCategoria.value.trim() !== "") {
    const response = await categoriaService.agregarCategoria({
      nombre: nuevaCategoria.value,
    });
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    // Agregar la nueva bodega a la lista
    if (response) {
      categorias.value.push({ ...response });
      cerrarModalAgregar();
    }
  } else {
    alert("Por favor, complete todos los campos.");
  }
};

// Abrir modal para editar
const abrirModalEditar = (index: number) => {
  indiceEdicion.value = index;
  categoriaEditada.value = categorias.value[index].nombre;
  modalAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModal = () => {
  modalAbierto.value = false;
  categoriaEditada.value = "";
  indiceEdicion.value = null;
};

// Guardar cambios en edición
const guardarCambios = () => {
  if (indiceEdicion.value !== null) {
    // categorias.value[indiceEdicion.value] = categoriaEditada.value;
  }
  cerrarModal();
};

// Eliminar categoría
const eliminarCategoria = (index: number) => {
  categorias.value.splice(index, 1);
};
</script>

<style scoped>
.categorias-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.categorias-content {
  flex: 1;
  padding: 16px;
}
</style>
