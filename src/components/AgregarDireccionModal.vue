<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cerrarModal">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>{{props.titulo ?? 'Agregar Dirección'}}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="guardarDireccion">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-list>
                <!-- Campo para la región -->
                <ion-item>
                    <ion-select 
                        placeholder="Seleccione una región" 
                        v-model="direccion.region_id" 
                        label="Región" 
                        label-placement="stacked"
                        @ionChange="regionSeleccionado"
                        interface="modal"
                    >
                        <ion-select-option
                            v-for="region in regiones"
                            :key="region.id"
                            :value="region.id"
                        >
                            {{ region.nombre }} 
                        </ion-select-option>
                    </ion-select>
                </ion-item>

                <!-- Campo para la comuna -->
                <ion-item>
                    <ion-select 
                        placeholder="Seleccione una comuna" 
                        v-model="direccion.comuna_id" 
                        label="Comuna"
                        label-placement="stacked"
                        interface="modal"
                    >
                        <ion-select-option 
                            v-for="comuna in comunasFiltradas"
                            :key="comuna.id"
                            :value="comuna.id"
                        >
                            {{ comuna.nombre }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>

                <!-- Campo para la dirección -->
                <ion-item>
                    <ion-input 
                        placeholder="Dirección" 
                        v-model="direccion.direccion" 
                        label="Dirección" 
                        label-placement="stacked"
                    />
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { Comuna, Region } from '@/interfaces/interfaces';
import comunaService from '@/services/comunaService';
import regionService from '@/services/regionService';
import { computed, onBeforeMount, ref } from 'vue';


const regiones = ref<Region[]>();
const comunas = ref<Comuna[]>();
const props = defineProps<{
    titulo?: string;
}>();

const direccion = ref({
    clientes_id:0,
    region_id: 0,
    comuna_id: 0,
    direccion: '',
});

const comunasFiltradas = computed(() => {
    if (!direccion.value.region_id) return [];
    return comunas.value?.filter(
      comuna => comuna.region_id === direccion.value.region_id
    ) || [];
});

const regionSeleccionado = () => {
    console.log('Región seleccionada:', direccion.value.region_id);
    direccion.value.comuna_id = 0; // Reinicia comuna si cambian de región
};


const emit = defineEmits(['cerrar', 'guardar']);

const cerrarModal = () => {
    emit('cerrar');
};

const guardarDireccion = () => {
    emit('guardar', direccion.value);
};


onBeforeMount(async()=>{
    regiones.value = await regionService.getRegiones();
    comunas.value = await comunaService.getComunas();
});


</script>

<style scoped>
.ion-padding {
    padding: 16px;
}
</style>