<template>
  <ion-modal :is-open="modalEditarAbierto" @didDismiss="cerrarModalEditar">
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
          :value="formatearRut(personaEditado.n_identificacion)"
          @input="validarRut($event)"
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
import { Cliente, Persona } from "@/interfaces/interfaces";
import { ref } from "vue";
const props = defineProps<{
  modalEditarAbierto: boolean;
  cliente: Cliente;
}>();
const { cliente } = props;
const emit = defineEmits<{
  (e: "cerrarModalEditar"): void;
  (e: "guardarCambios", cliente: Cliente): void;
}>();

const personaEditado = ref<Persona>(
  cliente.persona ?? {
    id: 0,
    nombre: "",
    correo: "",
    n_identificacion: "",
    fono: "",
  }
);

const clienteEditado = ref<Cliente>(
  cliente ?? {
    id: 0,
    personas_id: 0,
    eliminado: 0,
    cta_instagram: "",
  }
);

const formatearRut = (rut: string) => {
  if (!rut) return "";
  // Primero limpiamos el RUT de cualquier formato
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  // Aplicamos el formato
  return rutLimpio.replace(/^(\d{1,2})(\d{3})(\d{3})([0-9K])$/, "$1.$2.$3-$4");
};

const validarRut = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // Limpiamos el valor de puntos y guiones
  value = value.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  // Validamos que solo contenga números y K
  if (!/^[0-9K]+$/.test(value)) {
    return;
  }

  // Guardamos el valor formateado
  personaEditado.value.n_identificacion = formatearRut(value);

  // Actualizamos el valor del input
  if (input) {
    input.value = formatearRut(value);
  }
};
// Agregamos una función para validar el RUT antes de guardar
const validarRutCompleto = (rut: string): boolean => {
  if (!rut) return false;

  // Limpiar el RUT
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  // Validar formato
  if (!/^[0-9]{7,8}[0-9K]$/.test(rutLimpio)) {
    return false;
  }

  return true;
};

const cerrarModalEditar = () => {
  emit("cerrarModalEditar");
};

const guardarCambios = () => {
  if (!validarRutCompleto(personaEditado.value.n_identificacion)) {
    // Aquí podrías mostrar un mensaje de error
    alert("El RUT ingresado no es válido");
    return;
  }
  clienteEditado.value.personas_id = personaEditado.value.id;
  clienteEditado.value.persona = personaEditado.value;
  emit("guardarCambios", clienteEditado.value);
  cerrarModalEditar();
};
</script>
