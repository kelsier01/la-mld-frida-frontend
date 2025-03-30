<template>
  <ion-card @click="NavegarADetalleComprobante">
    <ion-card-header>
      <ion-card-title>
        {{ props.comprobanteVenta.codigo }}
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-text>{{ format(new Date(props.comprobanteVenta.createdAt), 'dd/MM/yyyy') }}</ion-text>
      <ion-checkbox
        v-if="props.conCheckBox" 
        slot="end"
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
import { trashOutline } from 'ionicons/icons';
import comprobanteVentaService from '@/services/comprobanteVentaService';
import pedidoService from '@/services/pedidoService';
import logEstadoPedidoService from '@/services/logEstadoPedidoService';
import { useLoginStore } from '@/stores/loginStore';
// import { useLoginStore } from '@/stores/loginStore';

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
ion-card-header {
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
}

ion-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.5rem;
  font-weight: bold;
  width: 100%;
}

ion-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.delete-button {
  margin-left: 8px;
}
</style>