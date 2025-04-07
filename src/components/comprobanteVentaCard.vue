<template>
  <ion-card class="comprobante-card" @click="NavegarADetalleComprobante">
    <ion-card-header>
      <ion-card-title>
        {{ props.comprobanteVenta.codigo }}
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <div class="content-container">
        <div class="date-container">
          <ion-icon :icon="calendarOutline" class="date-icon"></ion-icon>
          <ion-text>{{ format(new Date(props.comprobanteVenta.createdAt), 'dd/MM/yyyy') }}</ion-text>
        </div>
        <div class="actions-container">
          <ion-checkbox
            v-if="props.conCheckBox" 
            slot="end"
            class="checkbox"
          />
          <!-- Botón de eliminar -->
          <ion-button 
            fill="clear" 
            color="danger" 
            @click.stop="mostrarConfirmacionEliminar" 
            class="delete-button"
          >
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </div>
      </div>
    </ion-card-content>
  </ion-card>

  <!-- Alerta de confirmación para eliminar -->
  <ion-alert
    :is-open="mostrarAlerta"
    header="Confirmar eliminación"
    message="¿Está seguro de que desea eliminar este comprobante de venta?"
    :buttons="[{
        text: 'Cancelar',
        role: 'cancel',
        handler: () => { mostrarAlerta = false; }
      },
      {
        text: 'Eliminar',
        role: 'confirm',
        handler: () => eliminarComprobanteVenta()
      }
    ]"
    @didDismiss="mostrarAlerta = false"
  />
</template>

<script setup lang="ts">
import { ComprobanteVenta } from '@/interfaces/interfaces';
import { format } from 'date-fns';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { trashOutline, calendarOutline } from 'ionicons/icons';
import comprobanteVentaService from '@/services/comprobanteVentaService';
import pedidoService from '@/services/pedidoService';
import logEstadoPedidoService from '@/services/logEstadoPedidoService';
import { useLoginStore } from '@/stores/loginStore';

const router = useRouter();
const mostrarAlerta = ref<boolean>(false);
const eliminando = ref<boolean>(false);

const props = defineProps<{
  comprobanteVenta: ComprobanteVenta
  conCheckBox: boolean
}>();

const emit = defineEmits(['comprobanteEliminado']);

const NavegarADetalleComprobante = () => {
  if (!eliminando.value) {
    router.push({ name: 'GestionChileDetalleComprobante', params: { id: props.comprobanteVenta.id } });
  }
}

const mostrarConfirmacionEliminar = (event: MouseEvent) => {
  event.stopPropagation(); // Evitar que el evento se propague al card
  mostrarAlerta.value = true;
}

const eliminarComprobanteVenta = async () => {
  try {
    eliminando.value = true;
    const loginStore = useLoginStore();

    // Actualizar el estado del comprobante a eliminado
    await comprobanteVentaService.actualizarComprobanteVenta(props.comprobanteVenta.id, { 
      estados_id: 2 // Estado 2 = Deshabilitado
    });

    // Eliminar comprobante_ventas_id en Pedidos
    const pedidos = await pedidoService.getPedidosByComprobanteVentaId(props.comprobanteVenta.id);
    for (const pedido of pedidos) {
      await pedidoService.putPedido({
        id: pedido.id,
        comprobante_ventas_id: null, // Eliminar la relación con el comprobante de venta
        estado_pedidos_id: 4
      });

      await logEstadoPedidoService.postLogEstadoPedido({
        pedidos_id: pedido.id,
        estado_pedidos_id: 4,
        empleados_id: loginStore.user?.empleados[0].id // Cambiar por el ID del usuario que está realizando la acción
      });
    }


    // Notificar al componente padre que el comprobante ha sido eliminado
    emit('comprobanteEliminado', props.comprobanteVenta.id);

    console.log(`Comprobante de venta ${props.comprobanteVenta.codigo} eliminado correctamente`);
  } catch (error) {
    console.error('Error al eliminar el comprobante de venta:', error);
  } finally {
    eliminando.value = false;
    mostrarAlerta.value = false;
  }
}
</script>

<style scoped>
.comprobante-card {
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.comprobante-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

.comprobante-card:active {
  transform: scale(0.98);
}

ion-card-header {
  padding: 16px 16px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(var(--ion-color-light-rgb), 0.3);
}

ion-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ion-color-primary);
}

ion-card-content {
  padding: 12px 16px;
  background-color: rgba(var(--ion-color-light-rgb), 0.5);
}

.content-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.date-container {
  display: flex;
  align-items: center;
  color: var(--ion-color-medium);
}

.date-icon {
  font-size: 1.2rem;
  margin-right: 8px;
  color: var(--ion-color-medium);
}

ion-text {
  font-size: 0.9rem;
}

.actions-container {
  display: flex;
  align-items: center;
}

.checkbox {
  --size: 20px;
  --border-radius: 4px;
  margin-right: 10px;
}

.delete-button {
  margin: 0;
  height: 36px;
  width: 36px;
  --padding-start: 0;
  --padding-end: 0;
  --border-radius: 4px;
}

.delete-button ion-icon {
  font-size: 1.2rem;
}

.delete-button:hover {
  --background: rgba(var(--ion-color-danger-rgb), 0.1);
}
</style>