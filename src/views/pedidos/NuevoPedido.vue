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
        <ion-row class="searchbar-container">
          <ion-searchbar placeholder="Buscar cliente"></ion-searchbar>
          <ion-button fill="clear" @click="abrirModalAgregarCliente">
            <ion-icon :icon="addCircle" />
          </ion-button>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-item>
              <ion-input
                placeholder="RUT"
                type="text"
                label="RUT"
                label-placement="stacked"
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
              <ion-select
                placeholder="Region"
                label="Region"
                label-placement="stacked"
              >
                <ion-select-option value="1">Arica</ion-select-option>
                <ion-select-option value="2">Camarones</ion-select-option>
              </ion-select>
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
        <ion-row class="searchbar-container">
          <ion-searchbar placeholder="Buscar producto"></ion-searchbar>
          <ion-button fill="clear" @click="abrirModalAgregarProducto">
            <ion-icon :icon="addCircle" />
          </ion-button>
        </ion-row>
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
import { ref } from "vue";

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

const guardarProducto = (producto) => {
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
const guardarDireccion = (direccion) => {
  console.log("Dirección guardada:", direccion);
  direcciones.value.push({
    value: (direcciones.value.length + 1).toString(),
    text: direccion.direccion,
  });
  cerrarModalDireccion();
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
