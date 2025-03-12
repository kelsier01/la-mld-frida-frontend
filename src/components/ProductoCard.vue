<template>
  <ion-card class="product-card">
    <div class="image-container">
      <ion-img
        :src="`${IMAGES_URL}${producto.ProductoImagens[0].url}`"
        alt="Imagen del producto"
        class="product-image"
      />
    </div>
    <ion-card-header>
      <ion-card-title
        >{{ producto.Marca.nombre }} - {{ producto.nombre }}</ion-card-title
      >
      <ion-card-subtitle>{{ producto.Categorium.nombre }}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content class="card-content">
      <p><strong>Código:</strong> {{ producto.codigo }}</p>
      <p>
        <strong>Bodega:</strong> {{ producto.ProductoBodegas[0].Bodega.nombre }}
      </p>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonImg,
} from "@ionic/vue";
import { Producto } from "@/interfaces/interfaces";

const IMAGES_URL: string = import.meta.env.VITE_IMAGES_URL;

defineProps<{
  producto: Producto;
}>();
</script>

<style scoped>
.product-card {
  max-width: 280px;
  margin: auto;
  text-align: center;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Contenedor de imagen para asegurar proporción */
.image-container {
  width: 100%;
  height: 200px; /* Tamaño fijo */
  background-color: #f0f0f0; /* Color de fondo para imágenes no cargadas */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Imagen con tamaño uniforme */
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Recorta la imagen sin deformarla */
  border-radius: 12px 12px 0 0; /* Redondeo solo arriba */
}

.card-content {
  text-align: left;
}
</style>
