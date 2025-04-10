<template>
  <ion-card @click="NavegarADetalleGuia">
    <ion-card-header>
      <ion-card-title>
        GUÍA - {{ props.guiaDespacho.codigo}}
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-text>{{ format(new Date(props.guiaDespacho.createdAt), 'dd/MM/yyyy') }}</ion-text>
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
    message="¿Está seguro de que desea eliminar esta guía de despacho? Esta acción también desvinculará los pedidos asociados."
    :buttons="[
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => { mostrarAlerta = false; }
      },
      {
        text: 'Eliminar',
        role: 'confirm',
        handler: () => eliminarGuiaDespacho()
      }
    ]"
    @didDismiss="mostrarAlerta = false"
  />
</template>

<script setup lang="ts">
import { GuiaDespacho } from '@/interfaces/interfaces';
import { format } from 'date-fns';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { trashOutline } from 'ionicons/icons';
import guiaDespachoService from '@/services/guiaDespachoService';
import pedidoService from '@/services/pedidoService';
import detallePedidoService from '@/services/detallePedidoService';
import logEstadoPedidoService from '@/services/logEstadoPedidoService';
import { useLoginStore } from '@/stores/loginStore';

const router = useRouter();
const mostrarAlerta = ref<boolean>(false);
const eliminando = ref<boolean>(false);


const props = defineProps<{
  guiaDespacho: GuiaDespacho
  conCheckBox: boolean
}>();

const emit = defineEmits(['guiaEliminada']);

const NavegarADetalleGuia = () => {
  if (!eliminando.value) {
    router.push({ name: 'DetallesGuia', params: { id: props.guiaDespacho.id } });
  }
}

const mostrarConfirmacionEliminar = (event: MouseEvent) => {
  event.stopPropagation(); // Evitar que el evento se propague al card
  mostrarAlerta.value = true;
}

const eliminarGuiaDespacho = async () => {
  try {
    eliminando.value = true;
    const loginStore = useLoginStore();
    
    // 1. Obtener todos los pedidos asociados a esta guía de despacho
    const pedidosAsociados = await pedidoService.getPedidosByGuiaDespachoId(props.guiaDespacho.id);
    
    if (pedidosAsociados && pedidosAsociados.length > 0) {
      // 2. Para cada pedido asociado:
      for (const pedido of pedidosAsociados) {
        // 2.1 Actualizar el pedido para quitar la referencia a la guía
        await pedidoService.putPedido({
          id: pedido.id,
          guia_despacho_id: null,  // Establecer a null
          estado_pedidos_id: 1  // Estado 1 = Ingresado
        });
        
        // 2.2 Obtener los detalles de este pedido
        const detallesPedido = await detallePedidoService.getDetallePedidoByPedido_Id(pedido.id.toString());

        //2.3 Agregar log de historial del pedido
        if(loginStore.user && loginStore.user.empleados.length > 0 && loginStore.isAuthenticated){
          await logEstadoPedidoService.postLogEstadoPedido({
            pedidos_id: pedido.id,
            estado_pedidos_id: 1, // Estado 1 = Ingresado
            empleados_id: loginStore.user.empleados[0].id
          });
        }
        
        // 2.3 Actualizar cada detalle de pedido
        if (detallesPedido && detallesPedido.length > 0) {
          for (const detalle of detallesPedido) {
            await detallePedidoService.putDetallePedido({
              id: detalle.id,
              precio_compra_guia: null  // Establecer a null
            });
          }
        }
      }
    }
    
    // 3. Actualizar el estado de la guía a 0 (eliminado)
    await guiaDespachoService.actualizarGuiaDespacho(props.guiaDespacho.id, { 
      estados_id: 2 // Estado 2 = Deshabilitado
    });
    
    // 4. Notificar al componente padre que la guía ha sido eliminada
    emit('guiaEliminada', props.guiaDespacho.id);
    
    console.log(`Guía de despacho ${props.guiaDespacho.codigo} eliminada correctamente y pedidos desvinculados`);
  } catch (error) {
    console.error('Error al eliminar la guía de despacho:', error);
  } finally {
    eliminando.value = false;
    mostrarAlerta.value = false;
  }
}
</script>

<style scoped>
ion-card {
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

ion-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

ion-card-header {
  padding: 16px 16px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

ion-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: 600;
  width: 100%;
  color: var(--ion-color-primary);
}

ion-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: rgba(var(--ion-color-light-rgb), 0.5);
}

ion-text {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.delete-button {
  margin-left: 10px;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 36px;
}

.delete-button ion-icon {
  font-size: 1.2rem;
}

/* Animación para el botón de eliminar */
.delete-button:hover {
  --background: rgba(var(--ion-color-danger-rgb), 0.1);
  --border-radius: 4px;
}

ion-checkbox {
  --size: 20px;
  --border-radius: 4px;
}
</style>