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
            <ion-searchbar 
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
            </ion-select>

            <!-- Lista de bodegas -->
            <ion-grid>
                <ion-row>
                    <ion-col size="12" size-md="6" size-lg="4" v-for="(bodega, index) in bodegas" :key="index">
                        <ion-card class="card-bodega" @click="verDetallesBodega(bodega)">
                            <ion-card-header>
                                <ion-card-title>{{ bodega.nombre }}</ion-card-title>
                            </ion-card-header>
                            <ion-card-content>
                                <p><strong>Ubicación:</strong> {{ bodega.ubicacion }}</p>
                                <p><strong>Tipo de bodega:</strong> {{ bodega.tipo }}</p>
                                <p><strong>Encargado:</strong> {{ bodega.encargado }}</p>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
            </ion-grid>

            <!-- Botón FAB para agregar nueva bodega -->
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="fab-button">
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
                <ion-item class="item-formulario">
                    <ion-select
                        v-model="nuevaBodega.tipo"
                        label="Tipo de Bodega"
                        label-placement="stacked"
                        placeholder="Seleccione el tipo de bodega"
                    >
                        <ion-select-option value="frigorifico">Frigorífico</ion-select-option>
                        <ion-select-option value="general">General</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item class="item-formulario">
                    <ion-select
                        v-model="nuevaBodega.encargado"
                        label="Encargado"
                        placeholder="Ingrese el encargado de la bodega"
                        label-placement="stacked"
                    >
                        <ion-select-option value="Juan Pérez">Juan Pérez</ion-select-option>
                        <ion-select-option value="María López">María López</ion-select-option>
                    </ion-select>
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
    IonSearchbar,
    IonSelect,
    IonSelectOption,
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
} from '@ionic/vue';
import { ref } from 'vue';
import { add } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

// Lista de bodegas de ejemplo
const bodegas = ref([
    { nombre: "Bodega A", ubicacion: "Santiago", tipo: "frigorifico", encargado: "Juan Pérez" },
    { nombre: "Bodega B", ubicacion: "Valparaíso", tipo: "general", encargado: "María López" },
]);

// Estado del modal de agregar
const modalAgregarAbierto = ref(false);

// Datos de la nueva bodega
const nuevaBodega = ref({
    nombre: "",
    ubicacion: "",
    tipo: "",
    encargado: "",
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
        tipo: "",
        encargado: "",
    };
};

// Confirmar agregar bodega
const confirmarAgregarBodega = () => {
    // Validar que todos los campos estén completos
    if (
        nuevaBodega.value.nombre.trim() !== "" &&
        nuevaBodega.value.ubicacion.trim() !== "" &&
        nuevaBodega.value.tipo.trim() !== "" &&
        nuevaBodega.value.encargado.trim() !== ""
    ) {
        // Agregar la nueva bodega a la lista
        bodegas.value.push({ ...nuevaBodega.value });
        cerrarModalAgregar();
    } else {
        alert("Por favor, complete todos los campos.");
    }
};

// Navegar a la vista de detalles de la bodega
const verDetallesBodega = (bodega: any) => {
    router.push({ name: 'DetallesBodega', params: { id: bodega.nombre } });
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
