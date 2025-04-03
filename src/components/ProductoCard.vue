<template>
  <ion-card class="product-card">
    <div class="image-container">
      <ion-img
        :src="`${IMAGES_URL}${producto.ProductoImagens[0].url}`"
        alt="Imagen del producto"
        class="product-image"
      />
      <div class="category-badge">
        {{ producto.Categorium.nombre }}
      </div>
    </div>
    <ion-card-header>
      <div class="brand-tag">{{ producto.Marca.nombre }}</div>
      <ion-card-title>{{ producto.nombre }}</ion-card-title>
    </ion-card-header>
    <ion-card-content class="card-content">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">
            <ion-icon :icon="barcodeOutline" size="small"></ion-icon>
            Código
          </div>
          <div class="info-value">{{ producto.codigo }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">
            <ion-icon :icon="homeOutline" size="small"></ion-icon>
            Bodega
          </div>
          <div class="info-value">{{ producto.ProductoBodegas[0].Bodega.nombre }}</div>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { Producto } from "@/interfaces/interfaces";
import { barcodeOutline, homeOutline } from 'ionicons/icons';

const IMAGES_URL: string = import.meta.env.VITE_IMAGES_URL;

defineProps<{
  producto: Producto;
}>();
</script>

<style scoped>
.product-card {
  max-width: 280px;
  margin: auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  background: var(--ion-card-background);
  height: 100%; /* Para que todas las tarjetas tengan la misma altura */
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

/* Contenedor de imagen para asegurar proporción */
.image-container {
  width: 100%;
  height: 220px; /* Tamaño fijo */
  background-color: var(--ion-color-light); /* Color adaptable */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* Imagen con tamaño uniforme */
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Recorta la imagen sin deformarla */
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.08); /* Efecto de zoom suave al pasar el cursor */
}

/* Etiqueta de categoría */
.category-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(var(--ion-color-primary-rgb), 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
}

/* Encabezado de la tarjeta */
ion-card-header {
  padding: 16px 16px 8px;
  text-align: left;
}

/* Estilo para la marca */
.brand-tag {
  display: inline-block;
  color: var(--ion-color-medium);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Titulo del producto */
ion-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 8px;
  color: var(--ion-text-color);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8rem; /* Altura fija para 2 líneas de texto */
}

/* Contenido de la tarjeta */
.card-content {
  padding: 0 16px 16px;
  text-align: left;
}

/* Estilo para la grid de información */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ion-color-medium);
  font-size: 0.8rem;
}

.info-value {
  padding-left: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--ion-text-color);
  /* Para evitar que textos largos rompan el diseño */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ajustes para modo oscuro */
@media (prefers-color-scheme: dark) {
  .product-card {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
  
  .product-card:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
  }
  
  .image-container {
    background-color: rgba(var(--ion-background-color-rgb), 0.8);
  }
  
  .category-badge {
    background: rgba(var(--ion-color-primary-rgb), 0.95);
  }
}

/* Ajustes responsivos */
@media (max-width: 576px) {
  .product-card {
    max-width: none;
    width: 100%;
  }
  
  .image-container {
    height: 180px;
  }
  
  ion-card-title {
    font-size: 1rem;
  }
}
</style>
