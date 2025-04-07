<template>
    <ion-modal 
        :is-open="modalEditarAbierto" 
        @didDismiss="cerrarModalEditar"
    >
        <ion-header>
            <ion-toolbar>
                <ion-title>Editar Cliente</ion-title>
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
                    v-model="personaEditado.nombre"
                    type="text"
                    label="Nombre del Cliente"
                    label-placement="stacked"
                    placeholder="Ingrese el nombre del cliente"
                ></ion-input>
            </ion-item>
            <ion-item>
                <ion-input
                    v-model="personaEditado.n_identificacion"
                    type="text"
                    label="RUT"
                    label-placement="stacked"
                    placeholder="Ingrese el RUT"
                ></ion-input>
            </ion-item>
            <ion-item>
                <ion-input
                    v-model="personaEditado.fono"
                    type="text"
                    label="Teléfono"
                    label-placement="stacked"
                    placeholder="Ingrese el teléfono"
                ></ion-input>
            </ion-item>
            <ion-item>
                <ion-input
                    v-model="clienteEditado.cta_instagram"
                    type="text"
                    label="Instagram"
                    label-placement="stacked"
                    placeholder="Ingrese el Instagram"
                ></ion-input>
            </ion-item>
            <ion-item>
                <ion-input
                    v-model="personaEditado.correo"
                    type="text"
                    label="Mail"
                    label-placement="stacked"
                    placeholder="Ingrese el mail"
                ></ion-input>
            </ion-item>
        </ion-content>
    </ion-modal>
</template>
<script setup lang="ts">
import { Cliente, Persona } from '@/interfaces/interfaces';
import { ref } from 'vue';
const props = defineProps<{
    modalEditarAbierto: boolean;
    cliente: Cliente;
}>();
const { cliente } = props;
const emit = defineEmits<{
    (e: 'cerrarModalEditar'): void;
    (e: 'guardarCambios', cliente: Cliente): void;
}>();

const personaEditado = ref<Persona>(cliente.persona ?? {
    id: 0,
    nombre: '',
    correo: '',
    n_identificacion: '',
    fono: ''
});

const clienteEditado = ref<Cliente>(cliente ?? {
    id: 0,
    personas_id: 0,
    eliminado: 0,
    cta_instagram: '',
});

const cerrarModalEditar = () => {
    emit('cerrarModalEditar');
};

const guardarCambios = () => {
    clienteEditado.value.personas_id = personaEditado.value.id;
    clienteEditado.value.persona = personaEditado.value;
    emit('guardarCambios', clienteEditado.value);
    cerrarModalEditar();
};



</script>