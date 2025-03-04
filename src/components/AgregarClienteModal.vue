<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cerrarModal">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Agregar Cliente</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="guardarCliente">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-list>
                <ion-item>
                    <ion-input placeholder="Nombre" v-model="cliente.nombre" label="Nombre" label-placement="stacked"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input placeholder="RUT" v-model="cliente.rut" label="RUT" label-placement="stacked"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input placeholder="Teléfono" v-model="cliente.telefono" label="Teléfono" label-placement="stacked"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input placeholder="Email" v-model="cliente.email" label="Email" label-placement="stacked"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select placeholder="Región" v-model="cliente.region" label="Región" label-placement="stacked">
                        <ion-select-option value="1">Arica</ion-select-option>
                        <ion-select-option value="2">Camarones</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select placeholder="Comuna" v-model="cliente.comuna" label="Comuna" label-placement="stacked">
                        <ion-select-option value="1">Arica</ion-select-option>
                        <ion-select-option value="2">Camarones</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input placeholder="Dirección" v-model="cliente.direccion" label="Dirección" label-placement="stacked"></ion-input>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonInput, IonSelect, IonSelectOption, IonItem, IonList } from '@ionic/vue';

const cliente = ref({
    nombre: '',
    rut: '',
    telefono: '',
    email: '',
    region: '',
    comuna: '',
    direccion: ''
});

const emit = defineEmits(['cerrar', 'guardar']);

const cerrarModal = () => {
    emit('cerrar');
};

const guardarCliente = () => {
    emit('guardar', cliente.value);
};
</script>