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
            :value="formatearRut(cliente.n_identificacion)"
            @input="validarRut($event)"
            label="RUT"
            label-placement="stacked"
          />
        </ion-item>
        <ion-item>
          <ion-input
            type="tel"
            placeholder="Teléfono"
            v-model="cliente.fono"
            label="Teléfono"
            label-placement="stacked"
          />
        </ion-item>
        <ion-item>
          <ion-input
            type="email"
            placeholder="Email"
            v-model="cliente.correo"
            label="Email"
            label-placement="stacked"
          />
        </ion-item>
        <ion-item>
          <ion-input
            type="text"
            placeholder="Cuenta Instagram"
            v-model="cliente.cta_instagram"
            label="Cuenta Instagram"
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
  <ion-toast
    :is-open="mostrarError"
    :message="errorMensaje"
    :duration="3000"
    color="danger"
    position="top"
    @didDismiss="mostrarError = false"
  ></ion-toast>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from "vue";
import regionService from "@/services/regionService";
import comunaService from "@/services/comunaService";
// import clienteService from '@/services/clienteService';
import { Comuna, Region } from "@/interfaces/interfaces";

const regiones = ref<Region[]>([]);
const comunas = ref<Comuna[]>([]);
const errorMensaje = ref<string>("");
const mostrarError = ref<boolean>(false);
// Cliente inicial
const cliente = ref({
  n_identificacion: "",
  nombre: "",
  correo: "",
  fono: "",
  direccion: "",
  cta_instagram: "",
  region_id: null,
  comuna_id: null,
});

// Computed para filtrar comunas según la región seleccionada
const comunasFiltradas = computed(() => {
  if (!cliente.value.region_id) return [];
  return comunas.value.filter(
    (comuna) => comuna.region_id === cliente.value.region_id
  );
});

// ⚡ Solo para debug si quieres ver el ID de región seleccionado
const regionSeleccionado = () => {
  console.log("Región seleccionada:", cliente.value.region_id);
  // Opcionalmente puedes limpiar la comuna cuando cambias de región
  cliente.value.comuna_id = null;
};

const emit = defineEmits(["cerrar", "guardar"]);

const formatearRut = (rut: string) => {
  if (!rut) return "";
  return rut.replace(/^(\d{1,2})(\d{3})(\d{3})([0-9K])$/, "$1.$2.$3-$4");
};

const validarRut = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\./g, "").replace("-", "");
  cliente.value.n_identificacion = value;
};

const cerrarModal = () => {
  emit("cerrar");
};

const guardarCliente = () => {
  if (!validarCampos()) {
    mostrarError.value = true;
    return;
  }
  emit("guardar", cliente.value);
};

const validarCampos = (): boolean => {
  if (!cliente.value.nombre) {
    errorMensaje.value = "El nombre es obligatorio";
    return false;
  }
  if (!cliente.value.n_identificacion) {
    errorMensaje.value = "El RUT es obligatorio";
    return false;
  }
  if (!cliente.value.fono) {
    errorMensaje.value = "El teléfono es obligatorio";
    return false;
  }
  if (!cliente.value.correo) {
    errorMensaje.value = "El correo es obligatorio";
    return false;
  }
  if (!cliente.value.region_id) {
    errorMensaje.value = "Debe seleccionar una región";
    return false;
  }
  if (!cliente.value.comuna_id) {
    errorMensaje.value = "Debe seleccionar una comuna";
    return false;
  }
  if (!cliente.value.direccion) {
    errorMensaje.value = "La dirección es obligatoria";
    return false;
  }
  return true;
};

onBeforeMount(async () => {
  regiones.value = await regionService.getRegiones();
  comunas.value = await comunaService.getComunas();
});
</script>
