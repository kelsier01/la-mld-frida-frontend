<template>
  <ion-card class="pedido-card">
    <div class="image-container">
      <img 
        v-if="imagenes && imagenes.length > 0" 
        alt="Imagen del pedido" 
        :src="`${IMAGEN_URL}${imagenes[0].url}`"
        class="pedido-img"
      />
      <div v-else class="no-image-container">
        <ion-icon :icon="imageOutline" size="large" class="no-image-icon"></ion-icon>
        <p>Sin imagen</p>
      </div>
    </div>
    <div class="card-header">
      <div class="pedido-id">
        <span class="id-label">Pedido</span>
        <span class="id-value">#{{ pedido.id }}</span>
      </div>
      <ion-chip :color="getEstadoColor(pedido.estado_pedidos_id)" class="estado-chip">
        {{ pedido.EstadoPedido?.estado_pedido }}
      </ion-chip>
    </div>
    <ion-card-content>
      <div class="pedido-content" @click="verDetallePedido(pedido)">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">
              <ion-icon :icon="personOutline" class="icon-info"/>
            </div>
            <div class="info-content">
              <div class="info-label">Cliente</div>
              <div class="info-value">{{ pedido.cliente?.persona?.nombre || 'No disponible' }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <ion-icon :icon="locationOutline" class="icon-info"></ion-icon>
            </div>
            <div class="info-content">
              <div class="info-label">Región</div>
              <div class="info-value">{{ pedido.Direccion?.Region?.nombre || 'No disponible' }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <ion-icon :icon="calendarOutline" class="icon-info"></ion-icon>
            </div>
            <div class="info-content">
              <div class="info-label">Fecha ultimo estado</div>
              <div class="info-value">{{ formatDate(fechaUltimoEstado) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div 
        v-if="conBtnDeAlta && props.rol_id === 1" 
        class="alta-container"
      >
        <ion-button
          expand="block" 
          color="success" 
          @click.stop="darDeAlta" 
          class="alta-button"
        >
          <ion-icon :icon="checkmarkCircleOutline" slot="start"/>
          Dar de alta pedido
        </ion-button>
      </div>
      
      <div 
        v-if="conCheckBox" 
        class="checkbox-container"
      >
        <ion-item lines="none" class="checkbox-item">
          <ion-checkbox 
          v-model="isChecked"
          :disabled= "conBtnDeAlta"
          >
            Seleccionar pedido
          </ion-checkbox>
        </ion-item>
      </div>
      
      
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { Imagen, Pedido } from '@/interfaces/interfaces';
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClientesStore } from '@/stores/clienteStore';
import detallePedidoService from '@/services/detallePedidoService';
import { 
  personOutline, 
  locationOutline, 
  calendarOutline, 
  imageOutline,
  checkmarkCircleOutline 
} from 'ionicons/icons';
import logEstadoPedidoService from '@/services/logEstadoPedidoService';

const imagenes = ref<Imagen[]>();
const fechaUltimoEstado = ref<string>('');
const IMAGEN_URL = import.meta.env.VITE_IMAGES_URL;

const router = useRouter();
const clientesStore = useClientesStore();
const isChecked = ref<boolean>(false);

const props = defineProps<{
  rol_id?: number;
  conBtnDeAlta?: boolean;
  conCheckBox: boolean;
  pedido: Pedido;
}>();

const emit = defineEmits(['seleccionarPedido', 'deseleccionarPedido', 'darDeAlta']);

watch(isChecked, (value) => {
  if(value) {
    emit('seleccionarPedido', props.pedido);
  } else {
    emit('deseleccionarPedido', props.pedido);
  }
});

const { conCheckBox, pedido } = props;

const formatDate = (date: string) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options as Intl.DateTimeFormatOptions);
};

const verDetallePedido = (pedido: Pedido) => {
  clientesStore.setCliente(pedido.cliente);
  router.push({ name: 'DetallesPedido', params: { id: pedido.id.toString() } });
};

const getEstadoColor = (estado: number) => {
  return ['warning', 'success', 'danger', 'primary', 'secondary'][estado - 1] || 'primary';
};

const darDeAlta = (event: Event) => {
  event.stopPropagation(); // Evita que se active el evento de verDetallePedido
  emit('darDeAlta', props.pedido);
};

onBeforeMount(async() => {
  imagenes.value = await detallePedidoService.getImagenesByPedidoId(pedido.id);
  const logEstados = await logEstadoPedidoService.getLogEstadoPedido(String(pedido.id));
  
  // Asignar la fecha del último registro si existe
  if (logEstados && logEstados.length > 0) {
    const ultimoLog = logEstados[logEstados.length - 1];
    fechaUltimoEstado.value = ultimoLog.createdAt || '';
  } else {
    fechaUltimoEstado.value = '';
  }
});


</script>

<style scoped>
.pedido-card {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  margin: 12px 0;
  position: relative;
  cursor: pointer;
  border: none;
}

.pedido-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.image-container {
  height: 180px;
  overflow: hidden;
  background: var(--ion-color-light);
  display: flex;
  justify-content: center;
  align-items: center;
}

.pedido-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.pedido-card:hover .pedido-img {
  transform: scale(1.05);
}

.no-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--ion-color-medium);
}

.no-image-icon {
  font-size: 48px;
  opacity: 0.6;
  margin-bottom: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--ion-card-background);
  border-bottom: 1px solid rgba(var(--ion-color-medium-rgb), 0.2);
}

.pedido-id {
  display: flex;
  flex-direction: column;
}

.id-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  margin-bottom: 2px;
}

.id-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ion-text-color);
}

.estado-chip {
  margin: 0;
  height: 26px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.pedido-content {
  padding: 6px 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(var(--ion-color-primary-rgb), 0.1);
  color: var(--ion-color-primary);
}

.icon-info {
  font-size: 18px;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin-bottom: 2px;
}

.info-value {
  font-size: 1rem;
  color: var(--ion-text-color);
  font-weight: 500;
}

.checkbox-container {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(var(--ion-color-medium-rgb), 0.2);
}

.checkbox-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
}

.alta-container {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(var(--ion-color-medium-rgb), 0.2);
}

.alta-button {
  font-weight: 600;
  --border-radius: 8px;
  --padding-top: 12px;
  --padding-bottom: 12px;
}

/* Ajustes para dispositivos móviles */
@media (max-width: 576px) {
  .image-container {
    height: 160px;
  }
  
  .card-header {
    padding: 12px 14px;
  }
  
  .id-value {
    font-size: 1rem;
  }
  
  .info-grid {
    gap: 10px;
  }
  
  .info-icon {
    width: 28px;
    height: 28px;
  }
  
  .info-value {
    font-size: 0.95rem;
  }
}

/* Ajustes para modo oscuro */
@media (prefers-color-scheme: dark) {
  .pedido-card {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  .pedido-card:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
  
  .image-container {
    background: rgba(var(--ion-background-color-rgb), 0.8);
  }
  
  .info-icon {
    background: rgba(var(--ion-color-primary-rgb), 0.15);
  }
}
</style>