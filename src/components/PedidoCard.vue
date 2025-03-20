<template>
  <ion-card class="pedido-card">
    <div class="image-container">
      <img 
        v-if="imagenes && imagenes.length > 0" 
        alt="Imagen del pedido" 
        :src="`${IMAGEN_URL}${imagenes[0].url}`"
        class="pedido-img"
      />
    </div>
    <ion-card-content>
      <ion-grid>
        <ion-row class="pedido-row" @click="verDetallePedido(pedido)">
          <ion-col size="12">
            <ion-list>
              <ion-item lines="none">
                <ion-label><strong>ID Pedido:</strong></ion-label>
                <ion-text color="dark">{{ pedido.id }}</ion-text>
              </ion-item>
              <ion-item lines="none">
                <ion-label><strong>Cliente:</strong></ion-label>
                <ion-text color="dark">{{ pedido.cliente?.persona?.nombre }}</ion-text>
              </ion-item>
              <ion-item lines="none">
                <ion-label><strong>Región:</strong></ion-label>
                <ion-text color="dark">{{ pedido.Direccion?.Region?.nombre }}</ion-text>
              </ion-item>
              <ion-item lines="none">
                <ion-label><strong>Estado:</strong></ion-label>
                <ion-chip :color="getEstadoColor(pedido.estado_pedidos_id)">
                  {{ pedido.estado.estado_pedido }}
                </ion-chip>
              </ion-item>
              <ion-item lines="none">
                <ion-label><strong>Fecha:</strong></ion-label>
                <ion-text color="dark">{{ formatDate(pedido.createdAt) }}</ion-text>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
        <ion-row v-if="conCheckBox" class="checkbox-row">
          <ion-col size="12">
            <ion-item lines="none">
              <ion-checkbox
                v-model="isChecked"
              >
              Seleccionar pedido
              </ion-checkbox>
            </ion-item>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { Imagen, Pedido } from '@/interfaces/interfaces';
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClientesStore } from '@/stores/clienteStore';
import detallePedidoService from '@/services/detallePedidoService';

const imagenes = ref<Imagen[]>();
const IMAGEN_URL = import.meta.env.VITE_IMAGES_URL;

const router = useRouter();
const clientesStore = useClientesStore();
const isChecked = ref<boolean>(false);

const props = defineProps<{
  conCheckBox: boolean;
  pedido: Pedido;
}>();

const emit = defineEmits(['seleccionarPedido', 'deseleccionarPedido']);

watch(isChecked, (value) => {
  if(value) {
    emit('seleccionarPedido', props.pedido);
  } else {
    emit('deseleccionarPedido', props.pedido);
  }
});



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

onBeforeMount(async() => {
  imagenes.value = await detallePedidoService.getImagenesByPedidoId(pedido.id);
  console.log(imagenes.value);
});
</script>

<style scoped>
.pedido-card {
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.pedido-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f4f4f4;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.pedido-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-chip {
  font-weight: bold;
}

ion-card-content {
  padding: 16px;
}

.checkbox-row {
  margin-top: 10px;
}
</style>