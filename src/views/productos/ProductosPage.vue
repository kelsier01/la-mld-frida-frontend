<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Productos</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          placeholder="Buscar producto"
          show-clear-button="focus"
          class="search bar"
          v-model="searchQuery"
        />
      </ion-toolbar>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-select
            label="Filtrar por categoría"
            interface="modal"
            v-model="filtroCategoria"
            class="filtro"
          >
            <ion-select-option :value="0"
              >Todas las Categorias</ion-select-option
            >
            <ion-select-option
              v-for="(categoria, index) in categorias"
              :key="index"
              :value="categoria.id"
              >{{ categoria.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-toolbar>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-select
            label="Filtrar por bodega"
            interface="action-sheet"
            v-model="filtroBodega"
            class="filtro"
          >
            <ion-select-option :value="0">Todas las Bodegas</ion-select-option>
            <ion-select-option
              v-for="(bodega, index) in bodegas"
              :key="index"
              :value="bodega.id"
              >{{ bodega.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-toolbar>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-select
            label="Filtrar por marca"
            interface="modal"
            v-model="filtroMarca"
            class="filtro"
          >
            <ion-select-option :value="0">Todas las marcas</ion-select-option>
            <ion-select-option
              v-for="(marca, index) in marcas"
              :key="index"
              :value="marca.id"
              >{{ marca.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" @ionInfinite="loadMoreProductos">
      <ion-alert
        :is-open="isOpen"
        header="Error"
        message="Por favor, completa todos los campos."
        :buttons="['OK']"
        @didDismiss="isOpen = false"
      />

      <!-- Lista de productos -->
      <ion-grid>
        <ion-row>
          <ion-col
            size="12"
            size-md="6"
            size-lg="4"
            v-for="(producto, index) in productos"
            :key="index"
          >
            <ProductoCard
              :producto="producto"
              @click="verDetallesProducto(producto)"
            />
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-infinite-scroll @ionInfinite="loadMoreProductos" threshold="100px">
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="Cargando más datos..."
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <!-- Botón FAB para agregar nuevo producto -->
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

    <!-- Modal para agregar nuevo producto -->
    <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
      <ModalAgregarProducto
        @cerrar="cerrarModalAgregar"
        @guardar="confirmarAgregarProducto"
      />
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { InfiniteScrollCustomEvent } from "@ionic/vue";
import { ref, onBeforeMount, watch, onMounted } from "vue";
import { add } from "ionicons/icons";
import { useRouter, useRoute } from "vue-router";
import { onIonViewWillEnter } from "@ionic/vue";
import { Storage } from "@ionic/storage"; // Correcto para @ionic/storage
import ModalAgregarProducto from "@/components/AgregarProductoModal.vue";
import productoService from "../../services/productoService";
import {
  Bodega,
  Categoria,
  Marca,
  NuevoProducto,
  Producto,
} from "@/interfaces/interfaces";
import ProductoCard from "@/components/ProductoCard.vue";
import bodegaService from "@/services/bodegaService";
import marcaService from "@/services/marcaService";
import debounce from "lodash.debounce";
import categoriaService from "@/services/categoriaService";

// Crear instancia de Storage
const storage = new Storage();
// Inicializar storage
storage.create();

const router = useRouter();
const route = useRoute();
const productos = ref<Producto[]>([]);
const bodegas = ref<Bodega[]>([]);
const marcas = ref<Marca[]>([]);
const categorias = ref<Categoria[]>([]);
const filtroCategoria = ref(0);
const filtroBodega = ref(0);
const filtroMarca = ref(0);
const searchQuery = ref("");
const page = ref(1);
const totalProductos = ref(0);
const loading = ref(false);
// Obtener los productos
const obtenerProductos = async () => {
  try {
    const response = await productoService.getProductos(
      page.value,
      filtroCategoria.value,
      filtroMarca.value,
      filtroBodega.value,
      searchQuery.value
    );
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    if (response.productos) {
      productos.value.push(...response.productos);
    }
    totalProductos.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar clientes", error);
  } finally {
    loading.value = false;
  }
};

const obtenerBodegas = async () => {
  bodegas.value = await bodegaService.getBodegas();
};

const obtenerCategorias = async () => {
  const responde = await categoriaService.getCategoria();
  categorias.value = responde.categorias;
  console.log(" entro a categorias", categorias.value);
};

const obtenerMarcas = async () => {
  const responde = await marcaService.getAllMarcas();
  marcas.value = responde.marcas;
};

// Estado del modal de agregar
const modalAgregarAbierto = ref<boolean>(false);

// Función para filtrar Productos
const filtrarProductos = debounce(async () => {
  page.value = 1;
  productos.value = [];
  await obtenerProductos();
}, 300);

// Watch para cambios en la búsqueda
watch(searchQuery, async () => {
  await filtrarProductos();
});

// Watch para cambios en la región
watch([filtroCategoria, filtroMarca, filtroBodega], async () => {
  console.log("filtroMarca", filtroMarca.value);

  page.value = 1;
  productos.value = [];
  await obtenerProductos();
});

// Método para cargar más productos (Infinite Scroll)
const loadMoreProductos = async (event: InfiniteScrollCustomEvent) => {
  console.log(
    "loadMoreProductos productos.value.length",
    productos.value.length
  );
  console.log("loadMoreProductos totalProductos.value", totalProductos.value);

  if (loading.value || productos.value.length >= totalProductos.value) {
    event.target.complete();
    event.target.disabled = true;
    return;
  }

  loading.value = true;
  page.value++;

  try {
    await obtenerProductos();
  } catch (error) {
    console.error("Error al cargar más clientes", error);
  } finally {
    event.target.complete();
    loading.value = false;
  }
};

// Estado del alert
const isOpen = ref<boolean>(false);

// Abrir modal para agregar
const abrirModalAgregar = () => {
  modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
  modalAgregarAbierto.value = false;
};

// Confirmar agregar producto
const confirmarAgregarProducto = async (nuevoProducto: NuevoProducto) => {
  // Validar que todos los campos estén completos
  if (
    nuevoProducto.codigo.trim() !== "" &&
    nuevoProducto.nombre.trim() !== "" &&
    nuevoProducto.stock > 0
  ) {
    // Agregar el nuevo producto a la lista
    await productoService.postProducto(nuevoProducto);
    await obtenerProductos();
    cerrarModalAgregar();
  } else {
    isOpen.value = true;
  }
};

// Navegar a la vista de detalles del producto
const verDetallesProducto = (producto: any) => {
  router.push({ name: "DetallesProducto", params: { id: producto.id } });
};

// Vigilar la ruta para detectar cambios en las consultas
watch(
  () => route.query.refresh,
  (newValue) => {
    if (newValue) {
      // Reiniciar la página y recargar los productos
      page.value = 1;
      productos.value = [];
      loading.value = true;
      obtenerProductos();
    }
  },
  { immediate: true }
);

// Esta función se ejecuta cada vez que la página se active
onIonViewWillEnter(async () => {
  // Comprobar si hay marcadores de actualización
  const productosActualizados = await storage.get("productosActualizados");

  if (productosActualizados) {
    // Limpiar el marcador
    await storage.remove("productosActualizados");

    // Refrescar la lista
    page.value = 1;
    productos.value = [];
    loading.value = true;
    obtenerProductos();
  }
});

onBeforeMount(async () => {
  await obtenerBodegas();
  await obtenerMarcas();
});

// Cargar clientes al montar el componente
onMounted(() => {
  obtenerCategorias();
  obtenerProductos();
});
</script>

<style scoped>
/* Estilos generales */
ion-content {
  --padding-top: 16px;
  --padding-bottom: 16px;
}

/* Barra de búsqueda */
.searchbar {
  margin-bottom: 16px;
}

/* Filtros */
.filtro {
  margin-bottom: 16px;
}

/* Estilos para las tarjetas de productos */
.card-producto {
  margin-bottom: 16px;
}

.card-producto ion-card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.card-producto ion-card-content {
  font-size: 1rem;
  line-height: 1.4;
}

/* Imagen del producto */
.imagen-producto {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 12px;
}

/* Botón FAB */
.fab-button {
  margin-bottom: 24px;
}

/* Estilos para el modal */
.item-formulario {
  margin-bottom: 16px;
}
</style>
