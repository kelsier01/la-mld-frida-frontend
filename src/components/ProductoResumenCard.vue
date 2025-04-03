<template>
  <ion-card class="producto-card">
    <ion-card-content class="no-padding">
      <div class="producto-header">
        <div class="imagen-container">
          <ion-img
            :src="`${URL_IMAGE}${props.detallePedido.Producto.ProductoImagens[0].url}`"
            alt="Producto"
            class="producto-imagen"
          />
        </div>
        <div class="producto-titulo">
          <h3>{{ props.detallePedido.Producto.nombre }}</h3>
          <ion-chip color="primary" class="id-chip">ID: {{ props.detallePedido.Producto.id }}</ion-chip>
        </div>
      </div>
      
      <div class="producto-details">
        <div class="detail-row">
          <div class="detail-label">
            <ion-icon :icon="cubeOutline" size="small"></ion-icon>
            Cantidad
          </div>
          <div class="detail-value">{{ props.detallePedido.cantidad }} unidades</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">
            <ion-icon :icon="pricetagOutline" size="small"></ion-icon>
            Precio unitario
          </div>
          <div class="detail-value precio">${{ formatMonto(props.detallePedido.precio_venta) }}</div>
        </div>
        
        <div class="detail-row total">
          <div class="detail-label">
            <ion-icon :icon="calculatorOutline" size="small"></ion-icon>
            Total
          </div>
          <div class="detail-value precio-total">
            ${{ formatMonto(props.detallePedido.precio_venta * props.detallePedido.cantidad) }}
          </div>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { DetallePedido } from "@/interfaces/interfaces";
import { cubeOutline, pricetagOutline, calculatorOutline } from 'ionicons/icons';

// Definición de props con TypeScript
const props = defineProps<{
  detallePedido: DetallePedido;
}>();

const URL_IMAGE: string = import.meta.env.VITE_IMAGES_URL;

// Función para formatear montos con separadores de miles
const formatMonto = (valor: number): string => {
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
</script>

<style scoped>
.producto-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin: 8px 0;
  border: none;
}

.producto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.no-padding {
  padding: 0;
}

.producto-header {
  display: flex;
  flex-direction: column;
  position: relative;
}

.imagen-container {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background-color: var(--ion-background-color);
}

.producto-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-titulo {
  /* Reemplazamos el fondo con gradiente por un color adaptable a modo oscuro */
  background: var(--ion-card-background);
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--ion-color-medium-rgb), 0.2);
}

.producto-titulo h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  /* Usamos la variable del sistema para el color de texto */
  color: var(--ion-text-color);
  line-height: 1.3;
}

.id-chip {
  margin: 0;
  height: 22px;
  font-size: 0.75rem;
}

.producto-details {
  padding: 12px 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--ion-color-medium-rgb), 0.2);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.detail-label ion-icon {
  margin-right: 6px;
  color: var(--ion-color-primary);
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
  /* Usamos la variable del sistema para el color de texto */
  color: var(--ion-text-color);
}

.precio {
  color: var(--ion-color-primary);
}

.total {
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px dashed rgba(var(--ion-color-medium-rgb), 0.3);
}

.precio-total {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ion-color-primary);
}

/* Responsive */
@media (min-width: 768px) {
  .producto-header {
    flex-direction: row;
  }
  
  .imagen-container {
    width: 30%;
    height: auto;
    min-height: 140px;
  }
  
  .producto-titulo {
    width: 70%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: none;
    border-left: 1px solid rgba(var(--ion-color-medium-rgb), 0.2);
  }
}

@media (max-width: 767px) {
  .detail-row {
    padding: 10px 0;
  }
  
  .producto-titulo h3 {
    font-size: 1rem;
  }
  
  .detail-label, .detail-value {
    font-size: 0.9rem;
  }
  
  .precio-total {
    font-size: 1.1rem;
  }
}

/* Estilos específicos para modo oscuro */
@media (prefers-color-scheme: dark) {
  .producto-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .producto-card:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  .producto-titulo {
    background: var(--ion-card-background);
  }
  
  .imagen-container {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
