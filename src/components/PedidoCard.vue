<template>
  <ion-card class="pedido-card">
    <ion-card-content>
      <ion-grid>
        <ion-row v-if="conCheckBox" class="checkbox-row">
          <ion-col size="12">
            <ion-item lines="none">
              <ion-checkbox>Seleccionar pedido</ion-checkbox>
            </ion-item>
          </ion-col>
        </ion-row>
        <ion-row class="pedido-row" @click="verDetallePedido(pedido)">
          <ion-col size="12">
            <ion-list>
              <ion-item >
                <ion-label><strong>ID Pedido</strong></ion-label>
                <ion-text color="dark">{{ pedido.id }}</ion-text>
              </ion-item>
              <ion-item >
                <ion-label><strong>Cliente</strong></ion-label>
                <ion-text color="dark">{{ pedido.cliente.persona.nombre }}</ion-text>
              </ion-item>
              <ion-item >
                <ion-label><strong>Estado</strong></ion-label>
                <ion-chip :color="getEstadoColor(pedido.estado_pedidos_id)">
                  {{ pedido.estado.estado_pedido }}
                </ion-chip>
              </ion-item>
              <ion-item >
                <ion-label><strong>Fecha</strong></ion-label>
                <ion-text color="dark">{{ formatDate(pedido.createdAt) }}</ion-text>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { Pedido } from '@/interfaces/interfaces';
import {
  IonCard,
  IonCardContent,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonCheckbox
} from '@ionic/vue';
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { useClientesStore } from '@/stores/clienteStore';

const router = useRouter();
const clientesStore = useClientesStore();


const props = defineProps<{
  conCheckBox: boolean;
  pedido: Pedido;
}>();

const { conCheckBox, pedido } = props;

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const verDetallePedido = (pedido: Pedido) => {
  clientesStore.setCliente(pedido.cliente);
  router.push({ name: 'DetallesPedido', params: { id: pedido.id.toString() } });
};

const getEstadoColor = (estado: number) => {
  return ['warning', 'success', 'danger', 'primary', 'secondary'][estado - 1] || 'primary';
};
</script>

<style scoped>
.pedido-card {
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

ion-item {
  --padding-start: 0;
}

ion-chip {
  font-weight: bold;
}
</style>
