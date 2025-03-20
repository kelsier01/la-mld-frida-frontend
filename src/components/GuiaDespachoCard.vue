<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>
        {{ props.guiaDespacho.codigo}}
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-text>{{ format(new Date(props.guiaDespacho.createdAt), 'dd/MM/yyyy') }}</ion-text>
      <ion-checkbox slot="end"></ion-checkbox>  
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { GuiaDespacho } from '@/interfaces/interfaces';
import { format } from 'date-fns';

const props = defineProps<{
  guiaDespacho: GuiaDespacho
}>();

</script>

<style scoped>
ion-card-header {
  padding-bottom: 8px; /* Reduce el espacio inferior del encabezado */
  display: flex;
  flex-direction: column;
}

ion-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Alinea el título y el checkbox */
  font-size: 1.5rem;
  font-weight: bold;
  width: 100%; /* Asegura que ocupe todo el ancho disponible */
}

ion-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Alinea el texto y el checkbox */
  padding: 16px; /* Añade un padding para mejor espaciado */
}
</style>