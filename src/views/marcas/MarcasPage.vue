<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Marcas</ion-title>
            </ion-toolbar>
        </ion-header>

        <div class="marcas-container">
           <ion-content class="marcas-content">
                <ion-item>
                    <ion-searchbar 
                        show-clear-button="focus"
                        placeholder="Buscar marca"
                    ></ion-searchbar>
                </ion-item>
                <ion-list :inset="true">
                    <ion-list-header>
                        Marcas
                    </ion-list-header>    
                    <ion-item v-for="(marca, index) in marcas" :key="index">
                        <ion-label>{{ marca }}</ion-label>
                        <ion-button fill="clear" slot="end" @click="abrirModalEditar(index)">
                            <ion-icon :icon="pencil" color="primary"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" slot="end" @click="eliminarMarca(index)">
                            <ion-icon :icon="trashOutline" color="danger"></ion-icon>
                        </ion-button>
                    </ion-item>
                </ion-list>
            </ion-content> 

            <!-- Botón FAB para agregar nueva marca -->
            <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                <ion-fab-button @click="abrirModalAgregar">
                    <ion-icon :icon="add"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </div>

        <!-- Modal para agregar nueva marca -->
        <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Agregar Marca</ion-title>
                    <ion-buttons slot="start">
                        <ion-button @click="cerrarModalAgregar">Cancelar</ion-button>
                    </ion-buttons>
                    <ion-buttons slot="end">
                        <ion-button @click="confirmarAgregarMarca">Confirmar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-item>
                    <ion-input
                        v-model="nuevaMarca"
                        type="text"
                        label="Nueva Marca"
                        label-placement="stacked"
                        :clear-input="true"
                    ></ion-input>
                </ion-item>
            </ion-content>
        </ion-modal>

        <!-- Modal para editar marca -->
        <ion-modal :is-open="modalAbierto" @didDismiss="cerrarModal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Editar Marca</ion-title>
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
                        v-model="marcaEditada"
                        type="text"
                        label="Editar Marca"
                        label-placement="stacked"
                        :clear-input="true"
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
    IonContent,
    IonInput,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonListHeader,
    IonIcon,
    IonModal,
    IonButtons,
    IonToolbar,
    IonSearchbar,
    IonFab,
    IonFabButton,
} from '@ionic/vue';
import { ref } from 'vue';
import { pencil, trashOutline, add } from 'ionicons/icons';

// Datos de ejemplo
const marcas = ref(["Marca 1", "Marca 2", "Marca 3"]);

// Estado del modal de edición
const modalAbierto = ref(false);
const marcaEditada = ref("");
const indiceEdicion = ref<number | null>(null);

// Estado del modal de agregar
const modalAgregarAbierto = ref(false);
const nuevaMarca = ref("");

// Abrir modal para agregar
const abrirModalAgregar = () => {
    modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
    modalAgregarAbierto.value = false;
    nuevaMarca.value = "";
};

// Confirmar agregar marca
const confirmarAgregarMarca = () => {
    if (nuevaMarca.value.trim() !== "") {
        marcas.value.push(nuevaMarca.value);
        cerrarModalAgregar();
    }
};

// Abrir modal para editar
const abrirModalEditar = (index: number) => {
    indiceEdicion.value = index;
    marcaEditada.value = marcas.value[index];
    modalAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModal = () => {
    modalAbierto.value = false;
    marcaEditada.value = "";
    indiceEdicion.value = null;
};

// Guardar cambios en edición
const guardarCambios = () => {
    if (indiceEdicion.value !== null) {
        marcas.value[indiceEdicion.value] = marcaEditada.value;
    }
    cerrarModal();
};

// Eliminar marca
const eliminarMarca = (index: number) => {
    marcas.value.splice(index, 1);
};
</script>

<style scoped>
.marcas-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.marcas-content {
    flex: 1;
    padding: 16px;
}
</style>