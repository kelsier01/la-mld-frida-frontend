<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Nuevo Pedido</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-grid>
        <!-- Buscador de clientes -->
        <ion-row class="searchbar-container">
          <ion-searchbar
            v-model="clientSearchTerm"
            placeholder="Buscar cliente"
            @ionFocus="handleClientFocus"
          ></ion-searchbar>

          <ion-button  shape="round" @click="abrirModalAgregarCliente">
            <ion-icon :icon="add" slot="icon-only"/>
          </ion-button>
        </ion-row>

        <!-- Lista de coincidencias para clientes -->
        <ion-list v-if="clientSearchTerm.length > 0">
          <ion-item
            v-for="client in clients"
            :key="client.id"
            button
            @click="selectClient(client)"
          >
            {{ client.persona.nombre }}
          </ion-item>
        </ion-list>

        <!-- Mostrar cliente seleccionado -->
        <ion-row v-if="selectedClient">
          <ion-col>
            <ion-item>
              <ion-input
                placeholder="RUT"
                type="text"
                label="RUT"
                label-placement="stacked"
                v-model="selectedClient.persona.n_identificacion"
              />
            </ion-item>
          </ion-col>
          <ion-col>
            <ion-item>
              <ion-input
                placeholder="Nombre"
                type="text"
                label="Nombre"
                label-placement="stacked"
                v-model="selectedClient.persona.nombre"
              />
            </ion-item>
          </ion-col>
          <div
            v-if="
              selectedClient?.Direccions?.length > 0 &&
              selectedClient.Direccions[0].direccion
            "
            style="width: 100%"
          >
            <ion-col size="12">
              <ion-item>
                <ion-select
                  v-model="selectedDireccion.direccion"
                  placeholder="Seleccione una dirección"
                  label="Dirección"
                  label-placement="stacked"
                >
                  <ion-select-option
                    v-for="direccion in selectedClient.Direccions"
                    :key="direccion.id"
                    :value="direccion.id"
                  >
                    {{ direccion.direccion }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>
            <ion-col size="6">
              <ion-item>
                <ion-label>
                  {{ selectedDireccion.region }}
                </ion-label>
              </ion-item>
            </ion-col>
            <ion-col size="6">
              <ion-item>
                <ion-label>
                  {{ selectedDireccion.comuna }}
                </ion-label>
              </ion-item>
            </ion-col>
          </div>
          <ion-col size="12" v-else>
            <ion-item>
              <ion-label> No hay dirección disponible </ion-label>
            </ion-item>
          </ion-col>

          <ion-col size="12">
            <ion-button
              expand="block"
              fill="outline"
              @click="abrirModalAgregarDireccion"
            >
              Agregar Nueva Dirección
            </ion-button>
          </ion-col>
        </ion-row>

        <ion-row class="searchbar-container">
          <ion-searchbar
            placeholder="Buscar producto"
            @ionFocus="handleProductFocus"
            v-model="productSearchTerm"
          ></ion-searchbar>
          <ion-button shape="round" @click="abrirModalAgregarProducto">
            <ion-icon :icon="add" slot="icon-only" />
          </ion-button>
        </ion-row>
        <!-- Lista de coincidencias para clientes -->
        <ion-list v-if="productSearchTerm.length > 0">
          <ion-item
            v-for="product in productos"
            :key="product.id"
            button
            @click="selectProduct(product)"
          >
            {{ `${product.codigo} - ${product.nombre}` }}
          </ion-item>
        </ion-list>
      </ion-grid>

      <ion-grid>
          <ion-row>
              <ion-col size="12" size-md="6" size-lg="4" v-for="(producto, index) in productos_pedido" :key="index">
                 <ProductoPedidoCard 
                  :producto="producto"
                  :index="index"
                  @borrar_producto="borrarProducto(index)"
                  @actualizar_producto="actualizarProducto"
                 /> 
              </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="12">
              <TotalCard :total-amount="montoTotal" />
            </ion-col>
          </ion-row>
      </ion-grid>
      
      <ion-list>
        <ion-item>
          <ion-select
            placeholder="Seleccione una forma de pago"
            label="Forma de pago"
          >
            <ion-select-option 
              v-for="metodo in metodoPago"
              :key="metodo.id"
              :value="metodo.id"
            >{{ metodo.nombre }}</ion-select-option>

          </ion-select>
        </ion-item>
        <ion-item>
          <ion-toggle
            v-model="formaPago"
          >Pago Parcializado</ion-toggle>
        </ion-item>
        <ion-item v-if="formaPago">
          <ion-input type="number" label="Monto Abonado (CLP)" placeholder="3.000" />
        </ion-item>
      </ion-list>
      <ion-button expand="full" @click="guardarPedido"
        >Guardar Pedido</ion-button
      >
    </ion-content>  

    <ion-modal :is-open="modalAbierto" @didDismiss="cerrarModal">
        <AgregarClienteModal @cerrar="cerrarModal" @guardar="guardarCliente" />
      </ion-modal>

      <!-- Modal para agregar producto -->
      <ion-modal
        :is-open="modalProductoAbierto"
        @didDismiss="cerrarModalProducto"
      >
        <AgregarProductoModal
          @cerrar="cerrarModalProducto"
          @guardar="guardarProducto"
        />
      </ion-modal>

      <!-- Modal para agregar dirección -->
      <ion-modal
        :is-open="modalDireccionAbierto"
        @didDismiss="cerrarModalDireccion"
      >
        <AgregarDireccionModal
          @cerrar="cerrarModalDireccion"
          @guardar="guardarDireccion"
        />
      </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">

import { add, addCircle } from "ionicons/icons";
import ProductoPedidoCard from "@/components/ProductoPedidoCard.vue";
import TotalCard from "@/components/TotalCard.vue";
import AgregarClienteModal from "@/components/AgregarClienteModal.vue";
import AgregarProductoModal from "@/components/AgregarProductoModal.vue";
import AgregarDireccionModal from "@/components/AgregarDireccionModal.vue";
import { onBeforeMount, ref, watch } from "vue";
import clienteService from "@/services/clienteService";
import { Cliente, Direccion, MetodoPago, Producto, ProductoEditado } from "@/interfaces/interfaces";
import debounce from "lodash.debounce";
import productoService from "@/services/productoService";
import metodoPagoService from "@/services/metodoPagoService";


//Es la lista de productos en el pedido, al principio esta vacia
const productos_pedido = ref<ProductoEditado[]>([]);
//Constante para Metodo de Pago
const metodoPago = ref<MetodoPago[]>([]);
//Forma de pago
const formaPago = ref<boolean>(false);
//Monto Total
const montoTotal = ref<number>(0);

//Metodo para calcular el monto total

const calcularMontoTotal = () => {
  let total = 0;

  productos_pedido.value.forEach(prod => {
    const precio = prod.precioVenta || 0; // Manejo de valores nulos o indefinidos
    const cantidad = prod.cantidadSeleccionada || 0; // Manejo de valores nulos o indefinidos

    total += precio * cantidad;
  });

  return total; // Retorna el monto total calculado
};

const actualizarProducto = (nuevoProducto: any) => {
  console.log("Actualizar nuevo producto:", nuevoProducto);
  productos_pedido.value[nuevoProducto.index] = nuevoProducto;
  montoTotal.value = calcularMontoTotal(); // Recalcula el monto total
};



//Metodo para eliminar el productos de productos_pedido
const borrarProducto = (index: number) => {
  productos_pedido.value.splice(index, 1);
  montoTotal.value = calcularMontoTotal(); // Recalcula el monto total
};

//Metodo para obtener los metodos de pago
const obtenerMetodosPago = async () => {
  try {
    const response = await metodoPagoService.getMetodoPago();
    console.log("Respuesta de la API:", response);
    metodoPago.value = response;
  } catch (error) {
    console.error("Error al cargar metodos de pago", error);
  }
};
 
// Modal de Cliente
const modalAbierto = ref(false);
const abrirModalAgregarCliente = () => {
  modalAbierto.value = true;
};
const cerrarModal = () => {
  modalAbierto.value = false;
};
const guardarCliente = (cliente: any) => {
  console.log("Cliente guardado:", cliente);
  cerrarModal();
};

// Modal de Dirección
const modalDireccionAbierto = ref(false);
const abrirModalAgregarDireccion = () => (modalDireccionAbierto.value = true);
const cerrarModalDireccion = () => (modalDireccionAbierto.value = false);
const direcciones = ref([
  { value: "1", text: "Av. Siempre Viva 4134" },
  { value: "2", text: "Orozimbo Barbosa 4134" },
]);
const guardarDireccion = (direccion: Direccion) => {
  console.log("Dirección guardada:", direccion);
  direcciones.value.push({
    value: (direcciones.value.length + 1).toString(),
    text: direccion.direccion,
  });
  cerrarModalDireccion();
};

//Busqueda de Cliente
// Variable para la dirección seleccionada del cliente
const selectedDireccion = ref({
  direccion: null,
  region: "",
  comuna: "",
});

// Búsqueda de Cliente
const clientSearchTerm = ref("");
const selectedClient = ref<Cliente | null>(null);
const clients = ref<Cliente[]>([]);
const page = ref(1);

const cargarClientes = async () => {
  try {
    const response = await clienteService.getAllClientes(
      page.value,
      0,
      clientSearchTerm.value
    );
    console.log("Respuesta de la API:", response);
    if (response.clientes) {
      clients.value.push(...response.clientes);
    }
  } catch (error) {
    console.error("Error al cargar clientes", error);
  }
};

const filtrarClientes = debounce(async () => {
  page.value = 1;
  clients.value = [];
  await cargarClientes();
}, 300);

watch(clientSearchTerm, async () => {
  console.log("entro");
  await filtrarClientes();
});

const selectClient = (client: Cliente) => {
  selectedClient.value = client;
  clientSearchTerm.value = "";
  if (client?.Direccions?.length > 0 && client.Direccions[0].direccion) {
    selectedDireccion.value.direccion = client.Direccions[0].id;
    selectedDireccion.value.region = client.Direccions[0].Region.nombre;
    selectedDireccion.value.comuna = client.Direccions[0].Comuna.nombre;
  }
};

const handleClientFocus = () => {
  if (selectedClient.value) {
    selectedClient.value = null;
  }
};

// Modal de Producto
const modalProductoAbierto = ref(false);
const abrirModalAgregarProducto = () => {
  modalProductoAbierto.value = true;
};
const cerrarModalProducto = () => {
  modalProductoAbierto.value = false;
};
const guardarProducto = async (producto: any) => {
  let producto_id = 0;
  
  console.log("Producto guardado:", producto);
  if (
      producto.codigo.trim() !== "" &&
      producto.nombre.trim() !== "" &&
      producto.stock > 0
    ) {
      producto_id = await productoService.postProducto(producto);
      const producto_registrado = await productoService.getProductoById(String(producto_id));
      if (producto_registrado) {
        productos_pedido.value.push({
          ...producto_registrado,
          precioCompra: 0,
          precioVenta: 0,
          informacionAdicional: '',
          cantidadSeleccionada: 0,
          bodegaSeleccionada: 0,
          index: productos_pedido.value.length,
        });
        calcularMontoTotal();
        console.log("Producto registrado:", productos_pedido.value);
      } else {
        console.error("Producto registrado es undefined");
      }
      cerrarModalProducto();
  }
};

// Búsqueda de Producto
const productSearchTerm = ref("");
const selectedProduct = ref<Producto | null>(null);
const productos = ref<Producto[]>([]);
const totalProductos = ref(0);
const pageProducto = ref(1);
// Obtener los productos
const obtenerProductos = async () => {
  try {
    const response = await productoService.getProductos(
      pageProducto.value,
      0,
      0,
      0,
      productSearchTerm.value
    );
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    if (response.productos) {
      productos.value.push(...response.productos);
    }
    totalProductos.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar clientes", error);
  }
};

const filtrarProductos = debounce(async () => {
  pageProducto.value = 1;
  productos.value = [];
  await obtenerProductos();
}, 300);

watch(productSearchTerm, async () => {
  console.log("entro");
  await filtrarProductos();
});

const selectProduct = (product: Producto) => {
  selectedProduct.value = product;
  productSearchTerm.value = "";
  productos_pedido.value.push(selectedProduct.value);
  // calcularMontoTotal();
  console.log("Producto seleccionado:", selectedProduct.value);
};

const handleProductFocus = () => {
  if (selectedProduct.value) {
    selectedProduct.value = null;
  }
};

const formNuevoPedido = ref({
  empleado: null,
  cliente: null,
  monto_total: 0,
  direccion: null,
});

const guardarPedido = () => {
  if (
    formNuevoPedido.value.empleado &&
    formNuevoPedido.value.direccion &&
    formNuevoPedido.value.cliente &&
    formNuevoPedido.value.monto_total
  ) {
    console.log("Send Data");
  }
};

// // Variables para forma de pago y monto abonado
// const formaPago = ref("");
// const montoAbonado = ref(0);

onBeforeMount(async() => {
  await obtenerMetodosPago();
});
</script>

<style scoped>
.searchbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
ion-searchbar {
  flex: 1;
  margin-right: 8px;
}
</style>
