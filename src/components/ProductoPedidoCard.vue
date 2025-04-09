<template>
    <ion-card>
      <ion-card-content>
        <ion-list>
          <ion-item>
            <ion-thumbnail slot="start">
              <ion-img 
                :src="`${URL_IMAGE}${props.producto.Producto.ProductoImagens[0].url}`"
                alt="Producto"
              />
            </ion-thumbnail>
            <ion-label>{{ props.producto.Producto.nombre }}</ion-label>
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
                  v-for="(bodega) in props.producto.Producto.ProductoBodegas"
                  :value="bodega.bodegas_id"
                  :key="bodega.bodegas_id"
                >
                  {{ bodega.Bodega.nombre }}
                </ion-select-option>
              </ion-select>
            </ion-col>
            <ion-col size="6">
              <!-- Campo de cantidad libre para Dropshipping (bodega_id = 4) -->
              <ion-input
                v-if="bodegaSeleccionada === 4"
                type="number"
                label="Cantidad"
                label-placement="stacked"
                placeholder="Ingrese cantidad"
                v-model="cantidadSeleccionada"
                :class="{ 'input-error': dropshippingCantidadInvalida }"
              />
              <!-- Select con opciones limitadas por el stock para otras bodegas -->
              <ion-select
                v-else-if="stockDisponible !== null && stockDisponible > 0"
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
                :value="producto.Producto.precio_venta"
                v-model="precioVenta"
              />
            </ion-col>
            <ion-col>
              <ion-input 
                type="number"
                placeholder="Valor de compra"
                label-placement="stacked"
                label="Valor de compra (USD)"
                :value="producto.Producto.Precio_compra_usd"
                v-model="precioCompra"
              />
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>
  </template>
  
  <script setup lang="ts">
  import { DetallePedido } from '@/interfaces/interfaces';
  import { closeCircleOutline } from 'ionicons/icons';
  import { ref, onMounted, computed, watch } from 'vue';
  
  const bodegaSeleccionada = ref<number>(0);
  const stockDisponible = ref<number>(0);
  const cantidadSeleccionada = ref<number>(0);
  const informacionAdicional = ref('');
  const precioVenta = ref<number>(0);
  const precioCompra = ref<number>(0);
  
  const props = defineProps<{
    producto: DetallePedido;
    index: number;
  }>();

  const dropshippingCantidadInvalida = computed(() => {
    return bodegaSeleccionada.value === 4 && (cantidadSeleccionada.value <= 0);
  });
  
  const emit = defineEmits(['borrar_producto', 'actualizar_producto']);
  
  const emitDelete = () => {
    emit('borrar_producto');
  };
  
  const URL_IMAGE:string = import.meta.env.VITE_IMAGES_URL;
  
  // Genera un array de opciones de cantidad basado en el stock disponible
  const opcionesCantidad = computed(() => {
    if (stockDisponible.value !== null && stockDisponible.value > 0) {
      return Array.from({ length: stockDisponible.value }, (_, i) => i + 1);
    }
    return [];
  });
  
  // Modifica la función actualizarStockDisponible para manejar el caso de Dropshipping
  const actualizarStockDisponible = () => {
    // Si es Dropshipping, no limitamos por stock
    if (bodegaSeleccionada.value === 4) {
      stockDisponible.value = 0; // Valor especial para indicar que no hay límite
      return;
    }
    
    // Para otras bodegas, mantener el comportamiento original
    const bodega = props.producto.Producto.ProductoBodegas.find(b => b.bodegas_id === bodegaSeleccionada.value);
    if (bodega) {
      stockDisponible.value = bodega.stock;
    } else {
      stockDisponible.value = 0;
    }
  };
  
  // Función para emitir los cambios automáticamente
  const emitActualizar = () => {
    const detallePedido: DetallePedido = {
      // ...props.producto,
      productos_id: props.producto.Producto.id,
      cantidad: cantidadSeleccionada.value,
      precio_venta: Number(precioVenta.value),
      //Precio estandar del Dolar en CLP
      precio_compra_clp: precioCompra.value * 1000,
      precio_compra_usd: precioCompra.value,
      adicional: informacionAdicional.value,
      bodegas_id: bodegaSeleccionada.value,
      Producto: props.producto.Producto,
      index: props.index,
    };
    emit('actualizar_producto', detallePedido);
  };
  
  // Observar cambios en los campos y emitir automáticamente
  watch(() => props.producto, (newProducto) => {
    if (newProducto && newProducto.Producto) {
      // Reiniciar los valores cuando cambia el producto
      bodegaSeleccionada.value = newProducto.bodegas_id || 0;
      cantidadSeleccionada.value = newProducto.cantidad || 0;
      informacionAdicional.value = newProducto.adicional || '';
      precioVenta.value = newProducto.precio_venta;
      precioCompra.value = newProducto.precio_compra_usd;
      // Actualizar el stock disponible según la bodega seleccionada
      actualizarStockDisponible();
    }
  }, { immediate: true, deep: true });

  // Agrega estos watchers para emitir actualizaciones cuando cualquier valor cambie
  watch([cantidadSeleccionada, precioVenta, precioCompra, informacionAdicional, bodegaSeleccionada], () => {
    emitActualizar();
  }, { deep: true });

  // Añadir un watch específico para bodegaSeleccionada para manejar el cambio entre bodega normal y Dropshipping
  watch(bodegaSeleccionada, () => {
    actualizarStockDisponible();
    // Si cambiamos a Dropshipping, no reseteamos la cantidad para mantener el valor que ingresó el usuario
  });

  onMounted(() => {
    if (props.producto.Producto.ProductoBodegas.length > 0) {
      // Buscar si existe una bodega con ID 4
      const bodegaPreferida = props.producto.Producto.ProductoBodegas.find(b => b.bodegas_id === 4);
      
      // Si existe, seleccionarla por defecto, de lo contrario mantener el valor actual o usar el primero
      if (bodegaPreferida) {
        bodegaSeleccionada.value = 4;
      } else {
        bodegaSeleccionada.value = props.producto.bodegas_id || props.producto.Producto.ProductoBodegas[0]?.bodegas_id || 0;
      }
      
      cantidadSeleccionada.value = props.producto.cantidad || 0;
      informacionAdicional.value = props.producto.adicional || '';
      precioVenta.value = props.producto.precio_venta || props.producto.Producto.precio_venta;
      precioCompra.value = props.producto.precio_compra_usd || props.producto.Producto.Precio_compra_usd;
      actualizarStockDisponible();
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

  .input-error {
    --border-color: var(--ion-color-danger);
    --border-width: 2px;
    --border-style: solid;
    border-radius: 4px;
  }
  </style>