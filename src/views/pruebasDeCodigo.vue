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
        <!-- Busqueda de Cliente -->
        <ion-row class="searchbar-container">
          <ion-searchbar
            v-model="clientSearchTerm"
            placeholder="Buscar cliente"
            @ionFocus="handleClientFocus"
          ></ion-searchbar>
          <ion-button fill="clear" @click="abrirModalAgregarCliente">
            <ion-icon :icon="addCircle" />
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
        <ion-label
          v-if="selectedClient && !clientSearchTerm.length"
          class="ion-padding"
        >
          <!-- Cliente seleccionado: {{ selectedClient.persona.nombre }} -->
        </ion-label>

        <!-- Fila con datos del cliente (solo si hay cliente seleccionado) -->
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
          <ion-col size="12">
            <ion-item>
              <ion-select
                placeholder="Seleccione una dirección"
                label="Dirección"
                label-placement="stacked"
              >
                <ion-select-option value="1"
                  >Av. Siempre Viva 4134</ion-select-option
                >
                <ion-select-option value="2"
                  >Orozimbo Barbosa 4134</ion-select-option
                >
              </ion-select>
            </ion-item>
          </ion-col>
          <ion-col size="6">
            <ion-item>
              <ion-input
                placeholder="Region"
                type="text"
                label="Region"
                label-placement="stacked"
                v-model="selectedClient.Direccions.region.nombre"
              />
            </ion-item>
          </ion-col>
          <ion-col size="6">
            <ion-item>
              <ion-select
                placeholder="Seleccione una comuna"
                label="Comuna"
                label-placement="stacked"
              >
                <ion-select-option value="1">Arica</ion-select-option>
                <ion-select-option value="2">Camarones</ion-select-option>
              </ion-select>
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

        <!-- Busqueda de Producto -->
        <ion-row class="searchbar-container">
          <ion-searchbar
            v-model="productSearchTerm"
            placeholder="Buscar producto"
            @ionFocus="handleProductFocus"
          ></ion-searchbar>
          <ion-button fill="clear" @click="abrirModalAgregarProducto">
            <ion-icon :icon="addCircle" />
          </ion-button>
        </ion-row>
        <!-- Lista de coincidencias para productos -->
        <ion-list v-if="productSearchTerm.length > 0">
          <ion-item
            v-for="product in filteredProducts"
            :key="product.id"
            button
            @click="selectProduct(product)"
          >
            {{ product.name }}
          </ion-item>
        </ion-list>
        <!-- Mostrar producto seleccionado -->
        <ion-label
          v-if="selectedProduct && !productSearchTerm.length"
          class="ion-padding"
        >
          Producto seleccionado: {{ selectedProduct.name }}
        </ion-label>
      </ion-grid>
      <ProductoPedidoCard />
      <TotalCard :total-amount="1000" />
      <ion-list>
        <ion-item>
          <ion-select
            placeholder="Seleccione una forma de pago"
            label="Forma de pago"
          >
            <ion-select-option value="1">Efectivo</ion-select-option>
            <ion-select-option value="2">Transferencia</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-toggle>Pago Parcializado</ion-toggle>
        </ion-item>
        <ion-item>
          <ion-input type="number" label="Monto Abonado" placeholder="3.000" />
        </ion-item>
      </ion-list>
      <ion-button expand="full">Guardar Pedido</ion-button>

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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonInput,
  IonSelectOption,
  IonItem,
  IonSelect,
  IonList,
  IonToggle,
  IonModal,
} from "@ionic/vue";
import { addCircle } from "ionicons/icons";
import ProductoPedidoCard from "@/components/ProductoPedidoCard.vue";
import TotalCard from "@/components/TotalCard.vue";
import AgregarClienteModal from "@/components/AgregarClienteModal.vue";
import AgregarProductoModal from "@/components/AgregarProductoModal.vue";
import AgregarDireccionModal from "@/components/AgregarDireccionModal.vue";
import { ref, computed, watch } from "vue";
import clienteService from "@/services/clienteService";
import { Cliente, Direccion } from "@/interfaces/interfaces";
import debounce from "lodash.debounce";

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

const modalProductoAbierto = ref(false);
const abrirModalAgregarProducto = () => {
  modalProductoAbierto.value = true;
};
const cerrarModalProducto = () => {
  modalProductoAbierto.value = false;
};
const guardarProducto = (producto: any) => {
  console.log("Producto guardado:", producto);
  cerrarModalProducto();
};

// Lógica para el modal de dirección
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

/* 
  ===== Lógica para la búsqueda de Cliente =====
*/
const clientSearchTerm = ref("");
// Definimos selectedClient como un único objeto o null
const selectedClient = ref<Cliente | null>(null);
const clients = ref<Cliente[]>([]);
const page = ref(1);

// Función para cargar clientes (simulación vía API)
const cargarClientes = async () => {
  try {
    const response = await clienteService.getAllClientes(
      page.value,
      0,
      clientSearchTerm.value
    );
    console.log("Respuesta de la API:", response); // Verifica la respuesta
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
  await filtrarClientes();
});

const selectClient = (client: Cliente) => {
  selectedClient.value = client;
  clientSearchTerm.value = "";
};

const handleClientFocus = () => {
  if (selectedClient.value) {
    selectedClient.value = null;
  }
};

/* 
  ===== Lógica para la búsqueda de Producto =====
*/
const productSearchTerm = ref("");
const selectedProduct = ref<{ id: string; name: string } | null>(null);
const products = ref([
  { id: "1", name: "Producto X" },
  { id: "2", name: "Producto Y" },
  { id: "3", name: "Producto Z" },
]);
const filteredProducts = computed(() => {
  if (!productSearchTerm.value) return [];
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(productSearchTerm.value.toLowerCase())
  );
});
const selectProduct = (product: { id: string; name: string }) => {
  selectedProduct.value = product;
  productSearchTerm.value = "";
};
const handleProductFocus = () => {
  if (selectedProduct.value) {
    selectedProduct.value = null;
  }
};
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
