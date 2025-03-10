<template>
    <ion-card>
      <ion-card-content>
        <ion-list>
          <ion-item>
            <ion-thumbnail slot="start">
              <ion-img 
                :src="`${URL_IMAGE}${props.producto.ProductoImagens[0].url}`"
                alt="Producto"
              />
            </ion-thumbnail>
            <ion-label>{{ props.producto.nombre }}</ion-label>
            <ion-button fill="clear" color="danger" @click="emitDelete" class="delete-button">
              <ion-icon :icon="closeCircleOutline"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <ion-select 
                label="Bodega" 
                placeholder="Seleccione una bodega" 
                label-placement="stacked"
                v-model="bodegaSeleccionada"
                :ionChange="actualizarStockDisponible()"
                interface="action-sheet"
              >
                <ion-select-option 
                  v-for="(bodega) in props.producto.ProductoBodegas"
                  :value="bodega.id"
                  :key="bodega.id"
                >
                  {{ bodega.Bodega.nombre }}
                </ion-select-option>
              </ion-select>
            </ion-col>
            <ion-col size="6">
              <ion-select
                v-if="stockDisponible !== null"
                label="Cantidad"
                placeholder="Seleccione la cantidad"
                label-placement="stacked"
                v-model="cantidadSeleccionada"
                interface="popover"
              >
                <ion-select-option 
                  v-for="cantidad in opcionesCantidad"
                  :value="cantidad"
                  :key="cantidad"
                >
                  {{ cantidad }}
                </ion-select-option>
              </ion-select>
              <ion-text v-else color="danger">
                No hay stock disponible
              </ion-text>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-input 
                type="text"
                placeholder="Información adicional"
                label-placement="stacked"
                label="Información adicional"
                v-model="informacionAdicional"
              />
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-input 
                type="number"
                placeholder="Precio venta"
                label-placement="stacked"
                label="Precio venta (CLP)"
                :value="producto.precio_venta"
                v-model="precioVenta"
              />
            </ion-col>
            <ion-col>
              <ion-input 
                type="number"
                placeholder="Valor de compra"
                label-placement="stacked"
                label="Valor de compra (USD)"
                :value="producto.Precio_compra_usd"
                v-model="precioCompra"
              />
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>
  </template>
  
  <script setup lang="ts">
  import { ProductoEditado, Producto } from '@/interfaces/interfaces';
  import { IonCard, IonCardContent, IonList, IonItem, IonIcon, IonThumbnail, IonLabel, IonImg, IonGrid, IonCol, IonRow, IonSelect, IonSelectOption, IonInput, IonButton, IonText } from '@ionic/vue';
  import { closeCircleOutline } from 'ionicons/icons';
  import { defineEmits, ref, onMounted, computed, watch } from 'vue';
  
  const bodegaSeleccionada = ref<number>(0);
  const stockDisponible = ref<number>(0);
  const cantidadSeleccionada = ref<number>(0);
  const informacionAdicional = ref('');
  const precioVenta = ref<number>(0);
  const precioCompra = ref<number>(0);
  
  const props = defineProps<{
    producto: Producto;
    index: number;
  }>();
  
  const emit = defineEmits(['borrar_producto', 'actualizar_producto']);
  
  const emitDelete = () => {
    emit('borrar_producto');
  };
  
  const URL_IMAGE = 'http://localhost:8000';
  
  // Genera un array de opciones de cantidad basado en el stock disponible
  const opcionesCantidad = computed(() => {
    if (stockDisponible.value !== null && stockDisponible.value > 0) {
      return Array.from({ length: stockDisponible.value }, (_, i) => i + 1);
    }
    return [];
  });
  
  const actualizarStockDisponible = () => {
    const bodega = props.producto.ProductoBodegas.find(b => b.id === bodegaSeleccionada.value);
    if (bodega) {
      stockDisponible.value = bodega.stock;
    } else {
      stockDisponible.value = 0;
    }
    //cantidadSeleccionada.value = 0; // Reinicia la cantidad seleccionada al cambiar de bodega
  };
  
  // Función para emitir los cambios automáticamente
  const emitActualizar = () => {
    const nuevoProducto: ProductoEditado = {
      ...props.producto,
      bodegaSeleccionada: bodegaSeleccionada.value,
      cantidadSeleccionada: cantidadSeleccionada.value,
      informacionAdicional: informacionAdicional.value,
      precioVenta: precioVenta.value,
      precioCompra: precioCompra.value,
      index: props.index,
    };
    emit('actualizar_producto', nuevoProducto);
  };
  
  // Observar cambios en los campos y emitir automáticamente
  watch([cantidadSeleccionada, precioVenta, precioCompra], () => {
    emitActualizar();
  });
  
  onMounted(() => {
    if (props.producto.ProductoBodegas.length > 0) {
      precioVenta.value = props.producto.precio_venta;
      precioCompra.value = props.producto.Precio_compra_usd;
    }
  });
  </script>
  
  <style scoped>
  .delete-button {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 1.5rem;
    z-index: 10;
  }
  </style>