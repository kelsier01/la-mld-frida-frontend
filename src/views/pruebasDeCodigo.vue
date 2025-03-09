<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Formulario de Cliente</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-item>
              <ion-label position="stacked">Cliente</ion-label>
              <ion-select
                v-model="selectedClient"
                placeholder="Selecciona un cliente"
              >
                <ion-select-option
                  v-for="client in clients"
                  :key="client.id"
                  :value="client"
                >
                  {{ client.nombre }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </ion-col>

          <ion-col size="12">
            <ion-item>
              <ion-input
                placeholder="Dirección"
                type="text"
                label="Dirección"
                label-placement="stacked"
                v-model="direccion"
              ></ion-input>
            </ion-item>
          </ion-col>

          <ion-col size="6">
            <ion-item>
              <ion-input
                placeholder="Región"
                type="text"
                label="Región"
                label-placement="stacked"
                v-model="region"
              ></ion-input>
            </ion-item>
          </ion-col>

          <ion-col size="6">
            <ion-item>
              <ion-input
                placeholder="Comuna"
                type="text"
                label="Comuna"
                label-placement="stacked"
                v-model="comuna"
              ></ion-input>
            </ion-item>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, watch } from "vue";

const clients = ref([
  {
    id: 1,
    nombre: "Cliente 1",
    direccion: "Calle 123",
    region: "Región 1",
    comuna: "Comuna A",
  },
  { id: 2, nombre: "Cliente 2", direccion: "", region: "", comuna: "" },
  {
    id: 3,
    nombre: "Cliente 3",
    direccion: "Avenida 456",
    region: "Región 2",
    comuna: "Comuna B",
  },
]);

const selectedClient = ref(null);
const direccion = ref("");
const region = ref("");
const comuna = ref("");

watch(selectedClient, (newClient) => {
  if (newClient) {
    direccion.value = newClient.direccion || "";
    region.value = newClient.region || "";
    comuna.value = newClient.comuna || "";
  } else {
    direccion.value = "";
    region.value = "";
    comuna.value = "";
  }
});
</script>
