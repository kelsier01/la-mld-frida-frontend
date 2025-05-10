<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button @click="BackButton" text="Volver"></ion-back-button>
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
      </ion-content>
    </ion-modal>
    <ion-toast
      :is-open="toastVisible"
      :message="toastMensaje"
      :duration="2000"
      :color="toastColor"
      position="bottom"
      @didDismiss="setToastVisible(false)"
    ></ion-toast>
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
  alertController,
} from "@ionic/vue";
import { ref } from "vue";
import { pencil, trashOutline } from "ionicons/icons";
import { useRouter, useRoute } from "vue-router";
import bodegaService from "@/services/bodegaService";
import { onMounted } from "vue";
import { useNavigationStore } from "@/stores/navigations";

const router = useRouter();
const route = useRoute();
const navigationStore = useNavigationStore();
const toastVisible = ref<boolean>(false);
const toastMensaje = ref<string>("");
const toastColor = ref<string>("success");

// Funciones para gestionar toast
const mostrarToast = (mensaje: string, color: string = "success") => {
  toastMensaje.value = mensaje;
  toastColor.value = color;
  toastVisible.value = true;
};

const setToastVisible = (visible: boolean) => {
  toastVisible.value = visible;
};

// Datos de la bodega (simulados)
const bodega = ref({
  id: 0,
  nombre: "",
  ubicacion: "",
  tipo: "",
  encargado: "",
});

const cargarDatosBodega = async () => {
  try {
    const id = Number(route.params.id);
    const response = await bodegaService.getBodegaById(id);
    if (response) {
      bodega.value = response;
    }
  } catch (error) {
    console.error("Error al cargar la bodega:", error);
    mostrarToast("Error al cargar los datos de la bodega", "danger");
  }
};

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

const BackButton = async () => {
  navigationStore.setShouldRefresh(true);
  // router.push("/usuarios");
  router.push({ name: "Bodegas" });
};

// Guardar cambios en la edición
const guardarCambios = async () => {
  try {
    await bodegaService.actualizarBodega(bodega.value.id, bodegaEditada.value);
    bodega.value = { ...bodegaEditada.value };
    cerrarModalEditar();
    mostrarToast("Bodega actualizada correctamente", "success");
    BackButton();
  } catch (error) {
    console.error("Error al actualizar la bodega:", error);
    mostrarToast("Error al actualizar la bodega", "danger");
  }
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
const eliminarBodega = async () => {
  try {
    await bodegaService.eliminarBodega(bodega.value.id);
    mostrarToast("Bodega eliminada correctamente", "success");
    cerrarModalEditar();
    BackButton();
  } catch (error) {
    console.error("Error al eliminar la bodega:", error);
    mostrarToast("Error al eliminar la bodega", "danger");
  }
};

// Agregar onMounted para cargar los datos al iniciar el componente
onMounted(() => {
  cargarDatosBodega();
});
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>
