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
            <ion-input
              type="text"
              placeholder="Nombre"
              v-model="cliente.nombre"
              label="Nombre"
              label-placement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-input
              type="text"
              placeholder="RUT"
              v-model="cliente.rut"
              label="RUT"
              label-placement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-input
              type="tel"
              placeholder="Teléfono"
              v-model="cliente.telefono"
              label="Teléfono"
              label-placement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-input
              type="email"
              placeholder="Email"
              v-model="cliente.email"
              label="Email"
              label-placement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-select
              placeholder="Región"
              v-model="cliente.region_id"
              label="Región"
              label-placement="stacked"
              interface="modal"
              @ionChange="regionSeleccionado"
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
          <ion-item>
            <ion-select
              placeholder="Comuna"
              v-model="cliente.comuna_id"
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
          <ion-item>
            <ion-input
              placeholder="Dirección"
              v-model="cliente.direccion"
              label="Dirección"
              label-placement="stacked"
            />
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { onBeforeMount, ref, computed } from 'vue';
  import regionService from '@/services/regionService';
  import comunaService from '@/services/comunaService';
  // import clienteService from '@/services/clienteService';
  import { Comuna, Region } from '@/interfaces/interfaces';
  
  const regiones = ref<Region[]>([]);
  const comunas = ref<Comuna[]>([]);
  
  // Cliente inicial
  const cliente = ref({
    nombre: '',
    rut: '',
    telefono: '',
    email: '',
    region_id: null,
    comuna_id: null,
    direccion: ''
  });
  
  // 🔥 Computed para filtrar comunas según la región seleccionada
  const comunasFiltradas = computed(() => {
    if (!cliente.value.region_id) return [];
    return comunas.value.filter(
      comuna => comuna.region_id === cliente.value.region_id
    );
  });
  
  // ⚡ Solo para debug si quieres ver el ID de región seleccionado
  const regionSeleccionado = () => {
    console.log('Región seleccionada:', cliente.value.region_id);
    // Opcionalmente puedes limpiar la comuna cuando cambias de región
    cliente.value.comuna_id = null;
  };
  
  const emit = defineEmits(['cerrar', 'guardar']);
  
  const cerrarModal = () => {
    emit('cerrar');
  };
  
  const guardarCliente = () => {
    emit('guardar', cliente.value);
  };
  
  onBeforeMount(async () => {
    regiones.value = await regionService.getRegiones();
    comunas.value = await comunaService.getComunas();
  });
  </script>
  