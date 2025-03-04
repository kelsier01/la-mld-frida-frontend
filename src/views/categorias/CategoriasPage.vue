<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Categorías</ion-title>
            </ion-toolbar>
        </ion-header>

        <div class="categorias-container">
           <ion-content class="categorias-content">
                <ion-item>
                    <ion-searchbar 
                        show-clear-button="focus"
                        placeholder="Buscar categoría"
                    ></ion-searchbar>
                </ion-item>
                <ion-list :inset="true">
                    <ion-list-header>
                        Categorías
                    </ion-list-header>    
                    <ion-item v-for="(categoria, index) in categorias" :key="index">
                        <ion-label>{{ categoria }}</ion-label>
                        <ion-button fill="clear" slot="end" @click="abrirModalEditar(index)">
                            <ion-icon :icon="pencil" color="primary"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" slot="end" @click="eliminarCategoria(index)">
                            <ion-icon :icon="trashOutline" color="danger"></ion-icon>
                        </ion-button>
                    </ion-item>
                </ion-list>
            </ion-content> 

            <!-- Botón FAB para agregar nueva categoría -->
            <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                <ion-fab-button @click="abrirModalAgregar">
                    <ion-icon :icon="add"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </div>

        <!-- Modal para agregar nueva categoría -->
        <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Agregar Categoría</ion-title>
                    <ion-buttons slot="start">
                        <ion-button @click="cerrarModalAgregar">Cancelar</ion-button>
                    </ion-buttons>
                    <ion-buttons slot="end">
                        <ion-button @click="confirmarAgregarCategoria">Confirmar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-item>
                    <ion-input
                        v-model="nuevaCategoria"
                        type="text"
                        label="Nueva Categoría"
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
                        v-model="categoriaEditada"
                        type="text"
                        label="Editar Categoría"
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
const categorias = ref(["Categoría 1", "Categoría 2", "Categoría 3"]);

// Estado del modal de edición
const modalAbierto = ref(false);
const categoriaEditada = ref("");
const indiceEdicion = ref<number | null>(null);

// Estado del modal de agregar
const modalAgregarAbierto = ref(false);
const nuevaCategoria = ref("");

// Abrir modal para agregar
const abrirModalAgregar = () => {
    modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
    modalAgregarAbierto.value = false;
    nuevaCategoria.value = "";
};

// Confirmar agregar categoría
const confirmarAgregarCategoria = () => {
    if (nuevaCategoria.value.trim() !== "") {
        categorias.value.push(nuevaCategoria.value);
        cerrarModalAgregar();
    }
};

// Abrir modal para editar
const abrirModalEditar = (index: number) => {
    indiceEdicion.value = index;
    categoriaEditada.value = categorias.value[index];
    modalAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModal = () => {
    modalAbierto.value = false;
    categoriaEditada.value = "";
    indiceEdicion.value = null;
};

// Guardar cambios en edición
const guardarCambios = () => {
    if (indiceEdicion.value !== null) {
        categorias.value[indiceEdicion.value] = categoriaEditada.value;
    }
    cerrarModal();
};

// Eliminar categoría
const eliminarCategoria = (index: number) => {
    categorias.value.splice(index, 1);
};
</script>

<style scoped>
.categorias-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.categorias-content {
    flex: 1;
    padding: 16px;
}
</style>