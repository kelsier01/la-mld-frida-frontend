<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Gestion Chile</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-segment 
                    v-model="segmentoActivo"
                >
                    <ion-segment-button 
                        value="recepcion"
                    >
                        Recepcionar
                    </ion-segment-button>
                    <ion-segment-button 
                        value="entrega"
                    >
                        Recepcionado Bodega
                    </ion-segment-button>
                    <ion-segment-button 
                        value="finalizado"
                    >
                        Comp. venta
                    </ion-segment-button>
                </ion-segment>
            </ion-toolbar>
        </ion-header>

        <component :is="componenteActivo" />
        
    </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import RecepcionSegmento from '@/views/gestionChile/GestionChileRecepcion.vue';
import EntregaSegmento from '@/views/gestionChile/GestionChileEntrega.vue';
import FinalizadoSegmento from '@/views/gestionChile/GestionChileFinalizado.vue';

// Variable para controlar el segmento activo
const segmentoActivo = ref('recepcion');

const componenteActivo = computed(() => {
  switch(segmentoActivo.value) {
    case 'recepcion': return RecepcionSegmento;
    case 'entrega': return EntregaSegmento;
    case 'finalizado': return FinalizadoSegmento;
    default: return null;
}
});
</script>

<style scoped>
/* Mantén solo los estilos generales aquí */
ion-card-header {
  padding-bottom: 8px;
}

ion-card-title {
  display: flex;
  align-items: center;
  justify-content: left;
  font-size: 1.5rem;
  font-weight: bold;
  gap: 8px;
}

ion-icon {
  font-size: 1.5rem;
  color: var(--ion-color-primary);
}

ion-card-content {
  padding-top: 8px;
}
</style>