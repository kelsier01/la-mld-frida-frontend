<template>
  <ion-card>
    <ion-card-content>
      <ion-grid>
        <ion-row>
          <ion-col size="4">
            <ion-img
              :src="`${URL_IMAGE}${props.detallePedido.Producto.ProductoImagens[0].url}`"
              alt="Pedido"
            />
          </ion-col>
          <ion-col size="8">
            <ion-list>
              <ion-item>
                <ion-label>ID</ion-label>
                <ion-text color="dark">{{
                  props.detallePedido.Producto.id
                }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>Nombre</ion-label>
                <ion-text color="dark">{{
                  props.detallePedido.Producto.nombre
                }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>Cantidad</ion-label>
                <ion-text color="dark">{{
                  props.detallePedido.cantidad
                }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>Precio unitario (CLP)</ion-label>
                <ion-text color="dark"
                  >${{ props.detallePedido.precio_venta }}</ion-text
                >
              </ion-item>
              <ion-item>
                <ion-label>Precio total (CLP)</ion-label>
                <ion-text color="dark"
                  >${{
                    props.detallePedido.precio_venta *
                    props.detallePedido.cantidad
                  }}</ion-text
                >
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
} from "@ionic/vue";
import { DetallePedido } from "@/interfaces/interfaces";

// Definición de props con TypeScrip
const props = defineProps<{
  detallePedido: DetallePedido;
}>();
const URL_IMAGE:string = import.meta.env.VITE_IMAGES_URL;
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
