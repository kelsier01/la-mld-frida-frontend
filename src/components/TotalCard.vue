<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>
        <ion-icon :icon="cardOutline"></ion-icon>
        Total
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-text color="primary">
        <h1>{{ formattedTotalAmount }}</h1>
      </ion-text>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonText } from '@ionic/vue';
import { cardOutline } from 'ionicons/icons';
import { computed, withDefaults } from 'vue';

// Definición de props con TypeScript
interface Props {
  totalAmount: number;
}

const props = withDefaults(defineProps<Props>(), {
  totalAmount: 0,
});

// Formatear el monto total como moneda
const formattedTotalAmount = computed(() => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(props.totalAmount);
});
</script>

<style scoped>

ion-card-header {
  padding-bottom: 8px; /* Reducir el espacio inferior del encabezado */
}

ion-card-title {
  display: flex;
  align-items: center;
  justify-content: left;
  font-size: 1.5rem;
  font-weight: bold;
  gap: 8px; /* Espacio entre el ícono y el texto */
}

ion-icon {
  font-size: 1.5rem;
  color: var(--ion-color-primary); /* Color del ícono */
}

ion-card-content {
  padding-top: 8px; /* Reducir el espacio superior del contenido */
}

</style>