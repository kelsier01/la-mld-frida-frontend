<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Bodegas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Barra de búsqueda y filtro por tipo de bodega -->
      <!-- <ion-searchbar
        placeholder="Buscar bodega"
        show-clear-button="focus"
        class="searchbar"
      ></ion-searchbar>
      <ion-select
        label="Filtrar por tipo de bodega"
        interface="popover"
        :multiple="true"
        class="filtro-tipo-bodega"
      >
        <ion-select-option value="frigorifico">Frigorífico</ion-select-option>
        <ion-select-option value="general">General</ion-select-option>
      </ion-select> -->

      <!-- Lista de bodegas -->
      <ion-grid>
        <ion-row>
          <ion-col
            size="12"
            size-md="6"
            size-lg="4"
            v-for="(bodega, index) in bodegas"
            :key="index"
          >
            <ion-card class="card-bodega" @click="verDetallesBodega(bodega)">
              <ion-card-header>
                <ion-card-title>{{ bodega.nombre }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p><strong>Ubicación:</strong> {{ bodega.ubicacion }}</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Botón FAB para agregar nueva bodega -->
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

    <!-- Modal para agregar nueva bodega -->
    <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Bodega</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalAgregar">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="confirmarAgregarBodega">Guardar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevaBodega.nombre"
            type="text"
            label="Nombre de la Bodega"
            label-placement="stacked"
            placeholder="Ingrese el nombre de la bodega"
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevaBodega.ubicacion"
            type="text"
            label="Ubicación"
            label-placement="stacked"
            placeholder="Ingrese la ubicación"
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
  IonMenuButton,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonButton,
  IonItem,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/vue";
import { onMounted, ref } from "vue";
import { add } from "ionicons/icons";
import { useRouter } from "vue-router";
import bodegaService from "@/services/bodegaService";
import { Bodega } from "@/interfaces/interfaces";

const router = useRouter();

// Lista de bodegas de ejemplo
const bodegas = ref<Bodega[]>([]);
const totalBodegas = ref(0);
const loading = ref(false);

// Estado del modal de agregar
const modalAgregarAbierto = ref(false);

const cargarBodegas = async () => {
  try {
    const response = await bodegaService.getBodegas();
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    if (response) {
      bodegas.value.push(...response);
    }
    totalBodegas.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar Marcas", error);
  } finally {
    loading.value = false;
  }
};

// Cargar clientes al montar el componente
onMounted(() => {
  cargarBodegas();
});

// Datos de la nueva bodega
const nuevaBodega = ref({
  nombre: "",
  ubicacion: "",
});

// Abrir modal para agregar
const abrirModalAgregar = () => {
  modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
  modalAgregarAbierto.value = false;
  // Limpiar los campos del formulario
  nuevaBodega.value = {
    nombre: "",
    ubicacion: "",
  };
};

// Confirmar agregar bodega
const confirmarAgregarBodega = async () => {
  // Validar que todos los campos estén completos
  if (
    nuevaBodega.value.nombre.trim() !== "" &&
    nuevaBodega.value.ubicacion.trim() !== ""
  ) {
    const response = await bodegaService.agregarBodega({
      nombre: nuevaBodega.value.nombre,
      ubicacion: nuevaBodega.value.ubicacion,
    });
    console.log("Respuesta de la API:", response); // Verifica la respuesta

    // Agregar la nueva bodega a la lista
    if (response) {
      bodegas.value.push({ ...response });
      cerrarModalAgregar();
    }
  } else {
    alert("Por favor, complete todos los campos.");
  }
};

// Navegar a la vista de detalles de la bodega
const verDetallesBodega = (bodega: any) => {
  router.push({ name: "DetallesBodega", params: { id: bodega.nombre } });
};
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

/* Filtro por tipo de bodega */
.filtro-tipo-bodega {
  margin-bottom: 24px;
}

/* Estilos para las tarjetas de bodegas */
.card-bodega {
  margin-bottom: 16px;
}

.card-bodega ion-card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.card-bodega ion-card-content {
  font-size: 1rem;
  line-height: 1.4;
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
