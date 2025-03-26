<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            default-href="/productos"
            text="Volver"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Detalles del Producto</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="abrirModalEditar">
            <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="eliminarProducto" color="danger">
            <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Spinner de carga general -->
      <div v-if="cargando" class="spinner-container">
        <ion-spinner name="circular"></ion-spinner>
        <p>Cargando datos...</p>
      </div>

      <!-- Contenido del producto (solo se muestra cuando no está cargando) -->
      <div v-else>
        <ion-item>
          <ion-label>
            <h2>Código</h2>
            <p>{{ producto?.codigo }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Nombre</h2>
            <p>{{ producto?.nombre }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Precio de compra (USD)</h2>
            <p>${{ producto?.Precio_compra_usd }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Precio de venta (CLP)</h2>
            <p>${{ producto?.precio_venta }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Marca</h2>
            <p>{{ producto?.Marca.nombre }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Categoria</h2>
            <p>{{ producto?.Categorium.nombre }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Stock por Bodega</h2>
            <ion-list>
              <ion-item v-for="bodega in producto?.ProductoBodegas" :key="bodega">
                <p>{{ bodega.Bodega.nombre }}: {{ bodega.stock }}</p>
                <ion-buttons slot="end">
                  <ion-button @click="abrirModalEditarStock(bodega.id)">
                    <ion-icon :icon="pencil" slot="icon-only"/>
                  </ion-button>
                  <ion-button
                    @click="eliminarStock(bodega.id)"
                    color="danger"
                  >
                    <ion-icon :icon="trashOutline" slot="icon-only"/>
                  </ion-button>
                </ion-buttons>
              </ion-item>
            </ion-list>
            <ion-button @click="abrirModalAgregarStock">Agregar Bodega</ion-button>
          </ion-label>
        </ion-item>
      </div>
    </ion-content>

    <!-- Modal para editar producto -->
    <ion-modal :is-open="modalEditarAbierto" @didDismiss="cerrarModalEditar">
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Producto</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalEditar">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="guardarCambios" :disabled="guardandoCambios">
              <ion-spinner v-if="guardandoCambios" name="dots" />
              <span v-else>Guardar</span>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            v-model="productoEditado.codigo"
            type="text"
            label="Código"
            label-placement="stacked"
            placeholder="Ingrese el código"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="productoEditado.nombre"
            type="text"
            label="Nombre"
            label-placement="stacked"
            placeholder="Ingrese el nombre"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="productoEditado.Precio_compra_usd"
            type="number"
            label="Precio compra (USD)"
            label-placement="stacked"
            placeholder="Ingrese el precio"
          />
        </ion-item>
        <ion-item>
          <ion-input
            v-model="productoEditado.precio_venta"
            type="number"
            label="Precio venta (CLP)"
            label-placement="stacked"
            placeholder="Ingrese el precio"
          />
        </ion-item>
        <ion-item>
          <ion-select
            v-model="productoEditado.Categoria_id"
            label="Categoria"
            label-placement="stacked"
            placeholder="Selecciona la categoria"
            interface="modal"
          >
            <ion-select-option
              v-for="categoria in categorias"
              :key="categoria.id"
              :value="categoria.id"
              >{{ categoria.nombre }}
            </ion-select-option
            >
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select
            v-model="productoEditado.marcas_id"
            label="Marca"
            label-placement="stacked"
            placeholder="Seleccione la marca"
            interface="modal"
          >
            <ion-select-option
              v-for="marca in marcas"
              :key="marca.id"
              :value="marca.id"
              >{{ marca.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- Modal para agregar bodega -->
    <ion-modal
      :is-open="modalAgregarStockAbierto"
      @didDismiss="cerrarModalAgregarStock"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Stock</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalAgregarStock">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="agregarStock" :disabled="agregandoStock">
              <ion-spinner v-if="agregandoStock" name="dots" />
              <span v-else>Guardar</span>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-select
            v-model="nuevoStock.bodega"
            label="Bodega"
            label-placement="stacked"
            placeholder="Seleccione la bodega"
          >
            <ion-select-option 
              v-for="bodega in bodegas"
              :key="bodega.id"
              :value="bodega.id"
              >{{ bodega.nombre}}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="nuevoStock.cantidad"
            type="number"
            label="Cantidad"
            label-placement="stacked"
            placeholder="Ingrese la cantidad"
          />
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- Modal para editar stock -->
    <ion-modal
      :is-open="modalEditarStockAbierto"
      @didDismiss="cerrarModalEditarStock"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Stock</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalEditarStock">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="guardarCambiosStock" :disabled="editandoStock">
              <ion-spinner v-if="editandoStock" name="dots" />
              <span v-else>Guardar</span>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            v-model="stockEditado.cantidad"
            type="number"
            label="Cantidad"
            label-placement="stacked"
            placeholder="Ingrese la cantidad"
          ></ion-input>
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- Toast para mensajes de confirmación -->
    <ion-toast
      :is-open="toastVisible"
      :message="toastMessage"
      :duration="2000"
      :color="toastColor"
      @didDismiss="toastVisible = false"
    ></ion-toast>

    <!-- Alerta para confirmar eliminación de stock -->
    <ion-alert
      :is-open="mostrarAlertaEliminarStock"
      header="Confirmar eliminación"
      message="¿Está seguro que desea eliminar este stock?"
      :buttons="[
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => { mostrarAlertaEliminarStock = false; }
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => confirmarEliminarStock()
        }
      ]"
    ></ion-alert>
    
    <!-- Alerta para confirmar eliminación de producto -->
    <ion-alert
      :is-open="mostrarAlertaEliminarProducto"
      header="Confirmar eliminación"
      message="¿Está seguro que desea eliminar este producto? Esta acción no se puede deshacer."
      :buttons="[
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => { mostrarAlertaEliminarProducto = false; }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => confirmarEliminarProducto()
        }
      ]"
    ></ion-alert>
  </ion-page>
</template>

<script setup lang="ts">
import { pencil, trashOutline } from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Bodega, Categoria, Marca, Producto } from "@/interfaces/interfaces";
import productoService from "@/services/productoService";
import productoBodegaService from "@/services/productoBodegaService";
import bodegaService from "@/services/bodegaService";
import marcaService from "@/services/marcaService";
import categoriaService from "@/services/categoriaService";
import { Storage } from '@ionic/storage'; // Correcto para @ionic/storage

// Crear instancia de Storage
const storage = new Storage();
// Inicializar storage
storage.create();

//Variables de Estado
const route = useRoute();
const router = useRouter();
const modalEditarAbierto = ref<boolean>(false);
const modalAgregarStockAbierto = ref<boolean>(false);
const modalEditarStockAbierto = ref<boolean>(false);
const bodegas = ref<Bodega[]>([]);
const marcas = ref<Marca[]>([]);
const categorias = ref<Categoria[]>([]);

// Variables para controlar spinners de carga
const cargando = ref<boolean>(true);
const guardandoCambios = ref<boolean>(false);
const agregandoStock = ref<boolean>(false);
const editandoStock = ref<boolean>(false);
const eliminando = ref<boolean>(false);

// Variables para toast de mensajes
const toastVisible = ref<boolean>(false);
const toastMessage = ref<string>("");
const toastColor = ref<string>("success");

// Variables para controlar alertas de confirmación
const mostrarAlertaEliminarStock = ref<boolean>(false);
const mostrarAlertaEliminarProducto = ref<boolean>(false);
const stockAEliminar = ref<number>(0);

//Variable de datos
const producto = ref<Producto>();
const id = route.params.id as string;
const producto_bodega_editado_id = ref<number>(0);
const productoEditado = ref({ ...producto.value });
const nuevoStock = ref<any>({
  bodega: "",
  cantidad: 0,
});
const stockEditado = ref<any>({
  cantidad: 0,
});

// Función para mostrar mensajes toast
const mostrarToast = (mensaje: string, tipo: string = "success") => {
  toastMessage.value = mensaje;
  toastColor.value = tipo;
  toastVisible.value = true;
};

const getBodegas = async () => {
  try {
    bodegas.value = await bodegaService.getBodegas();
    bodegas.value = bodegas.value.filter((bodega) => {
      return !producto.value?.ProductoBodegas?.some((b) => b.bodegas_id === bodega.id);
    });
  } catch (error) {
    console.error("Error al cargar bodegas:", error);
    mostrarToast("Error al cargar bodegas", "danger");
  }
};

const getMarcas = async () => {
  try {
    marcas.value = await marcaService.getAllMarcas();
  } catch (error) {
    console.error("Error al cargar marcas:", error);
    mostrarToast("Error al cargar marcas", "danger");
  }
};

const getCategorias = async () => {
  try {
    categorias.value = await categoriaService.getAllCategorias();
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    mostrarToast("Error al cargar categorías", "danger");
  }
};

const getProductoById = async (id: string) => {
  try {
    producto.value = await productoService.getProductoById(id);
  } catch (error) {
    console.error("Error al cargar el producto:", error);
    mostrarToast("Error al cargar el producto", "danger");
  }
};

// Abrir modal de edición
const abrirModalEditar = () => {
  productoEditado.value = { ...producto.value }; // Copiar datos actuales
  modalEditarAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModalEditar = () => {
  modalEditarAbierto.value = false;
};

// Guardar cambios en la edición
const guardarCambios = async() => {
  guardandoCambios.value = true;
  try {
    const response = await productoService.actualizarProducto({
      id: Number(route.params.id),
      Categoria_id: Number(productoEditado.value.Categoria_id),
      marcas_id: Number(productoEditado.value.marcas_id),
      codigo: String(productoEditado.value.codigo),
      nombre: String(productoEditado.value.nombre),
      precio_venta: Number(productoEditado.value.precio_venta),
      Precio_compra_usd: Number(productoEditado.value.Precio_compra_usd),
    });

    if (producto.value) {
      producto.value = {
        ...producto.value,
        id: producto.value.id,
        Marca: marcas.value.find((marca) => marca.id === response.marcas_id) || { id: 0, nombre: '', createdAt: '', updatedAt: '' },
        Categorium: categorias.value.find((categoria) => categoria.id === response.Categoria_id) || { id: 0, nombre: '', createdAt: '', updatedAt: '' },
        Categoria_id: Number(response.Categoria_id),
        marcas_id: Number(response.marcas_id),
        codigo: String(response.codigo),
        nombre: String(response.nombre),
        precio_venta: Number(response.precio_venta),
        Precio_compra_usd: Number(response.Precio_compra_usd),
      };
    }
    mostrarToast("Producto actualizado correctamente");
    cerrarModalEditar();
    
    // Marcar que los productos fueron actualizados usando @ionic/storage
    await storage.set('productosActualizados', true);
    
    // También actualizar la URL para consistencia
    router.replace({
      path: route.path,
      query: { ...route.query, updated: Date.now().toString() }
    });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    mostrarToast("Error al actualizar el producto", "danger");
  } finally {
    guardandoCambios.value = false;
  }
};

// Abrir modal para agregar stock
const abrirModalAgregarStock = () => {
  nuevoStock.value = { bodega: "", cantidad: 0 }; // Reiniciar datos
  modalAgregarStockAbierto.value = true;
};

// Cerrar modal para agregar stock
const cerrarModalAgregarStock = () => {
  modalAgregarStockAbierto.value = false;
};

// Agregar stock al producto
const agregarStock = async() => {
  agregandoStock.value = true;
  try {
    const response = await productoBodegaService.agregarProductoBodega({
      productos_id: Number(route.params.id),
      bodegas_id: Number(nuevoStock.value.bodega),
      stock: nuevoStock.value.cantidad,
    });
    
    if(producto.value){
      producto.value.ProductoBodegas.push({
        id: response.id,
        stock: response.stock,
        Bodega: response.Bodega,
        productos_id: Number(route.params.id),
        bodegas_id: response.bodegas_id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      }); 
    }
    
    mostrarToast("Stock agregado correctamente");
    cerrarModalAgregarStock();
    
    // Actualizar lista de bodegas disponibles
    await getBodegas();
  } catch (error) {
    console.error("Error al agregar stock:", error);
    mostrarToast("Error al agregar stock", "danger");
  } finally {
    agregandoStock.value = false;
  }
};

// Abrir modal para editar stock
const abrirModalEditarStock = async(producto_bodega_id: number) => {
  // Buscar el stock actual para mostrar en el modal
  const bodegaActual = producto.value?.ProductoBodegas?.find(bodega => bodega.id === producto_bodega_id);
  if (bodegaActual) {
    stockEditado.value.cantidad = bodegaActual.stock;
  } else {
    stockEditado.value.cantidad = 0;
  }
  
  producto_bodega_editado_id.value = producto_bodega_id;
  modalEditarStockAbierto.value = true;
};

// Cerrar modal para editar stock
const cerrarModalEditarStock = () => {
  modalEditarStockAbierto.value = false;
};

// Guardar cambios en el stock editado
const guardarCambiosStock = async () => {
  editandoStock.value = true;
  try {
    await productoBodegaService.actualizarProductoBodega(
      producto_bodega_editado_id.value, 
      { stock: stockEditado.value.cantidad }
    );
    
    producto.value?.ProductoBodegas?.forEach((bodega) => {
      if (bodega.id === producto_bodega_editado_id.value) {
        bodega.stock = stockEditado.value.cantidad;
      }
    });
    
    mostrarToast("Stock actualizado correctamente");
    cerrarModalEditarStock();
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    mostrarToast("Error al actualizar stock", "danger");
  } finally {
    editandoStock.value = false;
  }
};

// Mostrar alerta para eliminar stock
const eliminarStock = (producto_bodega_id: number) => {
  stockAEliminar.value = producto_bodega_id;
  mostrarAlertaEliminarStock.value = true;
};

// Función que se ejecuta al confirmar la eliminación de stock
const confirmarEliminarStock = async() => {
  eliminando.value = true;
  try {
    await productoBodegaService.eliminarProductoBodega(stockAEliminar.value);
    
    // Remover de la lista de productos en bodega
    if (producto.value && producto.value.ProductoBodegas) {
      producto.value.ProductoBodegas = producto.value.ProductoBodegas.filter(
        bodega => bodega.id !== stockAEliminar.value
      );
    }
    
    mostrarToast("Stock eliminado correctamente");
    
    // Actualizar lista de bodegas disponibles
    await getBodegas();
  } catch (error) {
    console.error("Error al eliminar stock:", error);
    mostrarToast("Error al eliminar stock", "danger");
    
    // Alternativa: marcar como stock 0 en caso de no poder eliminar
    producto.value?.ProductoBodegas?.forEach((bodega) => {
      if (bodega.id === stockAEliminar.value) {
        bodega.stock = 0;
      }
    });
  } finally {
    eliminando.value = false;
  }
};

// Mostrar alerta para eliminar producto
const eliminarProducto = () => {
  mostrarAlertaEliminarProducto.value = true;
};

// Función que se ejecuta al confirmar la eliminación del producto
const confirmarEliminarProducto = async() => {
  eliminando.value = true;
  try {
    const producto_id = Number(route.params.id);
    await productoService.eliminarProducto(producto_id);
    mostrarToast("Producto eliminado correctamente");
    
    // Marcar que los productos fueron actualizados
    await storage.set('productosActualizados', true);
    
    // Redirigir a la página de productos con un parámetro de actualización
    router.replace({
      path: '/productos',
      query: { refresh: Date.now().toString() }
    });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    mostrarToast("Error al eliminar el producto", "danger");
  } finally {
    eliminando.value = false;
  }
};

onBeforeMount(async() => {
  cargando.value = true;
  try {
    // Cargar los productos
    await getProductoById(id);
    await getBodegas();
    await getMarcas();
    await getCategorias();
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    mostrarToast("Error al cargar los datos", "danger");
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 2rem;
}

ion-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}
</style>
