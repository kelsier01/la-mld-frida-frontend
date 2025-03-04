<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cerrarModal">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Agregar Dirección</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="guardarDireccion">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-list>
                <!-- Campo para la región -->
                <ion-item>
                    <ion-select placeholder="Seleccione una región" v-model="direccion.region" label="Región" label-placement="stacked">
                        <ion-select-option value="1">Arica</ion-select-option>
                        <ion-select-option value="2">Camarones</ion-select-option>
                    </ion-select>
                </ion-item>

                <!-- Campo para la comuna -->
                <ion-item>
                    <ion-select placeholder="Seleccione una comuna" v-model="direccion.comuna" label="Comuna" label-placement="stacked">
                        <ion-select-option value="1">Arica</ion-select-option>
                        <ion-select-option value="2">Camarones</ion-select-option>
                    </ion-select>
                </ion-item>

                <!-- Campo para la dirección -->
                <ion-item>
                    <ion-input placeholder="Dirección" v-model="direccion.direccion" label="Dirección" label-placement="stacked"></ion-input>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonInput,
    IonList,
} from '@ionic/vue';

const direccion = ref({
    region: '',
    comuna: '',
    direccion: '',
});

const emit = defineEmits(['cerrar', 'guardar']);

const cerrarModal = () => {
    emit('cerrar');
};

const guardarDireccion = () => {
    emit('guardar', direccion.value);
};
</script>

<style scoped>
.ion-padding {
    padding: 16px;
}
</style>