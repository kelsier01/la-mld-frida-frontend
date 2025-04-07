<template>
<ion-card class="card-cliente" @click="verDetallesCliente(cliente)">
    <ion-card-header>
    <ion-card-title class="nombre-cliente">
        {{ cliente.persona?.nombre }}
    </ion-card-title>
    </ion-card-header>
    <ion-card-content class="contenido-cliente">
    <ion-list lines="none" class="lista-cliente">
        <ion-item class="item-cliente">
        <ion-label>
            <strong>Rut:</strong> {{ cliente.persona?.n_identificacion }}
        </ion-label>
        </ion-item>
        <ion-item class="item-cliente">
        <ion-label>
            <strong>Teléfono:</strong> {{ cliente.persona?.fono || "N/D" }}
        </ion-label>
        </ion-item>
        <ion-item class="item-cliente">
        <ion-label>
            <strong>Email:</strong> {{ cliente.persona?.correo || "N/D" }}
        </ion-label>
        </ion-item>
        <ion-item class="item-cliente">
        <ion-label>
            <strong>Región:</strong>
            <span v-if="cliente.Direccions && cliente.Direccions.length > 0">
            {{ cliente.Direccions.map(direccion => direccion.Region.nombre).join(', ') }}
            </span>
            <span v-else>No disponible</span>
        </ion-label>
        </ion-item>
    </ion-list>
    </ion-card-content>
</ion-card>
</template>

<script setup lang="ts">
import { Cliente } from '@/interfaces/interfaces';
import { useRouter } from 'vue-router';
import { useClientesStore } from '@/stores/clienteStore';


const clientesStore = useClientesStore();
const router = useRouter();
const props = defineProps<{
cliente: Cliente
}>();
const cliente = props.cliente;

const verDetallesCliente = (cliente: Cliente) => {
    //cargar cliente en el store y navegar a la vista de detalles
    clientesStore.setCliente(cliente);
    router.push({ name: "DetallesCliente", params: { id: cliente.id } });
};

</script>

<style scoped>
.card-cliente {
  margin: 16px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background: var(--ion-card-background, #ffffff);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.card-cliente:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.nombre-cliente {
  font-size: 22px;
  font-weight: 600;
  color: var(--ion-color-primary, #3880ff);
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contenido-cliente {
  padding: 10px 16px 16px;
}

.lista-cliente {
  padding: 0;
}

.item-cliente {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 8px;
  font-size: 15px;
}

.item-cliente:last-child {
  margin-bottom: 0;
}

.item-cliente ion-label {
  font-size: 15px;
  color: var(--ion-text-color, #666);
  white-space: normal;
}

.item-cliente strong {
  color: var(--ion-text-color, #333);
  font-weight: 600;
  margin-right: 5px;
}

/* Estilos específicos para modo oscuro */
@media (prefers-color-scheme: dark) {
  .card-cliente {
    background: var(--ion-card-background, #1e1e1e);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .card-cliente:hover {
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  }

  .nombre-cliente {
    color: var(--ion-color-primary, #4c8dff);
  }

  .item-cliente ion-label {
    color: var(--ion-text-color, #bbbbbb);
  }

  .item-cliente strong {
    color: var(--ion-text-color, #dddddd);
  }
}
</style>