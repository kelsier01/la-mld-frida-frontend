<template>
    <ion-card>
      <ion-card-content>
        <ion-grid>
            <ion-row>
                <ion-col size="4">
                    <ion-img 
                    src="https://nikeclprod.vtexassets.com/arquivos/ids/1069254-600-600?v=638570099680070000&width=600&height=600&aspect=true 600w,https://nikeclprod.vtexassets.com/arquivos/ids/1069254-800-800?v=638570099680070000&width=800&height=800&aspect=true 800w,https://nikeclprod.vtexassets.com/arquivos/ids/1069254-1200-1200?v=638570099680070000&width=1200&height=1200&aspect=true 1200w"
                    alt="Pedido" 
                    />
                </ion-col>
                <ion-col size="8">
                    <ion-list>
                        <ion-item>
                            <ion-label>ID</ion-label>
                            <ion-text color="dark">LX-1234</ion-text>
                        </ion-item>
                        <ion-item>
                            <ion-label>Nombre</ion-label>
                            <ion-text color="dark">Nike Air Force 1</ion-text>
                        </ion-item>
                        <ion-item>
                            <ion-label>Cantidad</ion-label>
                            <ion-text color="dark">3</ion-text>
                        </ion-item>
                        <ion-item>
                            <ion-label>Precio</ion-label>
                            <ion-text color="dark">30.000</ion-text>
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
} from '@ionic/vue';
 
  // Definición de props con TypeScrip

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