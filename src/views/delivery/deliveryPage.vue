<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>Couriers</ion-title>
      </ion-toolbar>
    </ion-header>

    <div class="curriers-container">
      <ion-content
        class="curriers-content ion-padding"
        :scrollEvents="true"
        @ionInfinite="loadMoreCurriers"
      >
        <ion-list :inset="true">
          <ion-list-header class="ion-padding">
            Empresas de Transporte
          </ion-list-header>
          <ion-item v-for="(currier, index) in curriers" :key="index">
            <ion-label>{{ currier.empresa }}</ion-label>
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
              @click="confirmarEliminar(index)"
            >
              <ion-icon :icon="trashOutline" color="danger"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
        <ion-infinite-scroll @ionInfinite="loadMoreCurriers" threshold="100px">
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
          <ion-title>Agregar Currier</ion-title>
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
            v-model="nuevoCurrier"
            type="text"
            label="Nueva Currier"
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
            v-model="currierEditado"
            type="text"
            label="Editar Currier"
            label-placement="stacked"
            :clear-input="true"
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
import { InfiniteScrollCustomEvent } from "@ionic/vue";
import { onMounted, ref } from "vue";
import { pencil, trashOutline, add } from "ionicons/icons";
import { Delivery } from "@/interfaces/interfaces";
import { alertController } from "@ionic/vue";
const toastVisible = ref<boolean>(false);
const toastMensaje = ref<string>("");
const toastColor = ref<string>("success");
import deliveryService from "@/services/companiaTransporteService";

// Datos de ejemplo
const curriers = ref<Delivery[]>([]);
const page = ref(1);
const loading = ref(false);
const totalCurriers = ref(0);

// Funciones para gestionar toast
const mostrarToast = (mensaje: string, color: string = "success") => {
  toastMensaje.value = mensaje;
  toastColor.value = color;
  toastVisible.value = true;
};

const setToastVisible = (visible: boolean) => {
  toastVisible.value = visible;
};

// Función para cargar Marcas
const cargarCurriers = async () => {
  loading.value = true;
  try {
    const response = await deliveryService.getAllCompaniasTransporte(
      page.value
    );
    if (response.deliverys) {
      curriers.value.push(...response.deliverys);
    }
    totalCurriers.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar currieers", error);
    mostrarToast("Error al cargar las currieers", "danger");
  } finally {
    loading.value = false;
  }
};

// Método para cargar más Marcas (Infinite Scroll)
const loadMoreCurriers = async (event: InfiniteScrollCustomEvent) => {
  if (loading.value || curriers.value.length >= totalCurriers.value) {
    event.target.complete();
    event.target.disabled = true;
    return;
  }

  loading.value = true;
  page.value++;

  try {
    await cargarCurriers();
  } catch (error) {
    console.error("Error al cargar más currieers", error);
    mostrarToast("Error al cargar más currieers", "danger");
  } finally {
    event.target.complete();
    loading.value = false;
  }
};

// Cargar clientes al montar el componente
onMounted(() => {
  cargarCurriers();
});

// Estado del modal de edición
const modalAbierto = ref(false);
const currierEditado = ref("");
const indiceEdicion = ref<number | null>(null);

// Estado del modal de agregar
const modalAgregarAbierto = ref(false);
const nuevoCurrier = ref("");

// Abrir modal para agregar
const abrirModalAgregar = () => {
  modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
  modalAgregarAbierto.value = false;
  nuevoCurrier.value = "";
};

// Confirmar agregar categoría
const confirmarAgregarCategoria = async () => {
  if (nuevoCurrier.value.trim() !== "") {
    try {
      const response = await deliveryService.agregarCompaniaTransporte({
        empresa: nuevoCurrier.value,
      });
      if (response) {
        curriers.value.push({ ...response });
        cerrarModalAgregar();
        mostrarToast("Currier agregada correctamente", "success");
      }
    } catch (error) {
      console.error("Error al agregar currier:", error);
      mostrarToast("Error al agregar la currier", "danger");
    }
  } else {
    mostrarToast("Por favor, complete todos los campos", "warning");
  }
};

// Abrir modal para editar
const abrirModalEditar = (index: number) => {
  indiceEdicion.value = index;
  currierEditado.value = curriers.value[index].empresa;
  modalAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModal = () => {
  modalAbierto.value = false;
  currierEditado.value = "";
  indiceEdicion.value = null;
};

// Guardar cambios en edición
const guardarCambios = async () => {
  try {
    if (indiceEdicion.value !== null && currierEditado.value.trim() !== "") {
      const currierId = curriers.value[indiceEdicion.value].id;
      const response = await deliveryService.actualizarCompaniaTransporte(
        currierId,
        {
          empresa: currierEditado.value,
        }
      );

      if (response) {
        curriers.value[indiceEdicion.value] = response;
        cerrarModal();
        mostrarToast("currier actualizada correctamente", "success");
      }
    }
  } catch (error) {
    console.error("Error al actualizar currier:", error);
    mostrarToast("Error al actualizar la currier", "danger");
  }
};

// Eliminar categoría
const eliminarCurrier = async (index: number) => {
  try {
    const currierArr = curriers.value[index];
    await deliveryService.eliminarCompaniaTransporte(currierArr.id);

    // Eliminar de la lista local
    curriers.value.splice(index, 1);
    mostrarToast("Currier eliminada correctamente", "success");

    // Recargar las categorías para asegurar sincronización
    page.value = 1;
    curriers.value = [];
    await cargarCurriers();
  } catch (error) {
    console.error("Error al eliminar cuerrier:", error);
    mostrarToast("Error al eliminar la cuerrier", "danger");
  }
};

const confirmarEliminar = async (index: number) => {
  const alert = await alertController.create({
    header: "Confirmar eliminación",
    message: "¿Está seguro que desea eliminar este Currier?",
    buttons: [
      {
        text: "Cancelar",
        role: "cancel",
      },
      {
        text: "Eliminar",
        role: "confirm",
        handler: () => {
          eliminarCurrier(index);
        },
      },
    ],
  });

  await alert.present();
};
</script>

<style scoped>
.curriers-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.curriers-content {
  flex: 1;
  padding: 16px;
}
</style>
