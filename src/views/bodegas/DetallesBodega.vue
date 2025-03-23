<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            default-href="/bodegas"
            text="Volver"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Detalles de la Bodega</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="abrirModalEditar">
            <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="confirmarEliminarBodega" color="danger">
            <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>
          <h2>Nombre de la Bodega</h2>
          <p>{{ bodega.nombre }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Ubicación</h2>
          <p>{{ bodega.ubicacion }}</p>
        </ion-label>
      </ion-item>
    </ion-content>

    <!-- Modal para editar bodega -->
    <ion-modal :is-open="modalEditarAbierto" @didDismiss="cerrarModalEditar">
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Bodega</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalEditar">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="guardarCambios">Guardar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            v-model="bodegaEditada.nombre"
            type="text"
            label="Nombre de la Bodega"
            label-placement="stacked"
            placeholder="Ingrese el nombre de la bodega"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="bodegaEditada.ubicacion"
            type="text"
            label="Ubicación"
            label-placement="stacked"
            placeholder="Ingrese la ubicación"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-select
            v-model="bodegaEditada.tipo"
            label="Tipo de Bodega"
            label-placement="stacked"
            placeholder="Seleccione el tipo de bodega"
          >
            <ion-select-option value="frigorifico"
              >Frigorífico</ion-select-option
            >
            <ion-select-option value="general">General</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="bodegaEditada.encargado"
            type="text"
            label="Encargado"
            label-placement="stacked"
            placeholder="Ingrese el encargado de la bodega"
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
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  alertController,
} from "@ionic/vue";
import { ref } from "vue";
import { pencil, trashOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

const router = useRouter();

// Datos de la bodega (simulados)
const bodega = ref({
  nombre: "Bodega A",
  ubicacion: "Santiago",
  tipo: "Frigorífico",
  encargado: "Juan Pérez",
});

// Estado del modal de edición
const modalEditarAbierto = ref(false);

// Datos editados de la bodega
const bodegaEditada = ref({ ...bodega.value });

// Abrir modal de edición
const abrirModalEditar = () => {
  bodegaEditada.value = { ...bodega.value }; // Copiar datos actuales
  modalEditarAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModalEditar = () => {
  modalEditarAbierto.value = false;
};

// Guardar cambios en la edición
const guardarCambios = () => {
  bodega.value = { ...bodegaEditada.value }; // Actualizar datos de la bodega
  cerrarModalEditar();
};

// Confirmar eliminación de la bodega
const confirmarEliminarBodega = async () => {
  const alert = await alertController.create({
    header: "Eliminar Bodega",
    message: "¿Estás seguro de que deseas eliminar esta bodega?",
    buttons: [
      {
        text: "Cancelar",
        role: "cancel",
      },
      {
        text: "Eliminar",
        handler: () => {
          eliminarBodega();
        },
      },
    ],
  });

  await alert.present();
};

// Eliminar bodega
const eliminarBodega = () => {
  // Aquí puedes agregar la lógica para eliminar la bodega (por ejemplo, enviar una solicitud a una API)
  console.log("Bodega eliminada:", bodega.value);
  router.push({ name: "Bodegas" }); // Redirigir a la lista de bodegas
};
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>
