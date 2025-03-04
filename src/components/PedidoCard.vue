<template>
    <ion-card>
      <ion-card-content>
        <ion-grid>
            <ion-row v-if="props.conCheckBox">
                <ion-col>
                  <ion-item>
                    <ion-checkbox>Seleccionar pedido</ion-checkbox>
                  </ion-item>
                </ion-col>
            </ion-row>
            <ion-row>
                <ion-col size="4">
                    <ion-img 
                    src="https://nikeclprod.vtexassets.com/arquivos/ids/1069254-600-600?v=638570099680070000&width=600&height=600&aspect=true 600w,https://nikeclprod.vtexassets.com/arquivos/ids/1069254-800-800?v=638570099680070000&width=800&height=800&aspect=true 800w,https://nikeclprod.vtexassets.com/arquivos/ids/1069254-1200-1200?v=638570099680070000&width=1200&height=1200&aspect=true 1200w"
                    alt="Pedido" 
                    @click="verDetallePedido()"
                    />
                </ion-col>
                <ion-col size="8">
                    <ion-list>
                        <ion-item>
                            <ion-label>ID Pedido</ion-label>
                            <ion-text color="dark">LX-1234</ion-text>
                        </ion-item>
                        <ion-item>
                            <ion-label>ID Producto</ion-label>
                            <ion-text color="dark">AR-1234</ion-text>
                        </ion-item>
                        <ion-item>
                            <ion-label>Cliente</ion-label>
                            <ion-text color="dark">Ana Maria</ion-text>
                        </ion-item>
                        <ion-item>
                            <ion-label>Estado</ion-label>
                            <ion-chip color="success">Enviado</ion-chip>
                        </ion-item>
                    </ion-list>
                </ion-col>
            </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>
  </template>
  
  <script setup lang="ts">
  import { 
    IonCard, 
    IonCardContent,  
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonCheckbox
} from '@ionic/vue';
import { useRouter } from 'vue-router';
  
const router = useRouter();
 
const verDetallePedido = () => {
  router.push({ name: 'DetallesPedido', params: { id: 1 } });
};

const props = defineProps<{
  conCheckBox: boolean;
}>();

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