<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        text="Volver" 
                    />
                </ion-buttons>
                <ion-title>Detalles de la guía de despacho</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Tarjeta de detalles de productos -->
            <ion-card>
                <ion-card-content>
                    <ion-list>
                        <ion-item 
                            lines="none"
                            v-for="(detalle, index) in detallePedido" 
                            :key="index"
                            class="item-minimalista">
                                <div>
                                    <ion-thumbnail slot="start" class="thumbnail">
                                        <ion-img :src="`${IMAGEN_URL}${detalle.Producto.ProductoImagens[0].url}`" />
                                    </ion-thumbnail>
                                </div>
                                <ion-grid class="grid">
                                    <ion-row>
                                        <ion-col size="12" size-md="6" class="col-info">
                                            <p class="codigo">{{ detalle.Producto.codigo }}</p>
                                            <p class="nombre">Pedido ID: {{ detalle.pedidos_id }}</p>
                                            <p class="nombre">{{ detalle.Producto.nombre }}</p>
                                            <p class="adicional">{{ detalle.adicional }}</p>
                                        </ion-col>
                                        <ion-col size="12" size-md="3" class="col-input">
                                            <ion-label>{{ detalle.cantidad }} x</ion-label>
                                            <ion-input
                                                type="number"
                                                class="input-minimalista" 
                                                placeholder="Precio unit. (usd)"
                                                :value="detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd"
                                                @input="actualizarPrecioGuia(index, $event)"
                                            />
                                        </ion-col>
                                        <ion-col size="12" size-md="3" class="col-total">
                                            <ion-label>
                                                <strong>
                                                    Total: ${{ detalle.cantidad * (detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd) }}
                                                </strong>
                                            </ion-label>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                        </ion-item>
                    </ion-list>
                </ion-card-content>
            </ion-card>

            <!-- Tarjeta de totales -->
            <ion-card>
                <ion-card-content>
                    <ion-list>
                        <ion-item class="item-totales">
                            <ion-label><strong>Subtotal:</strong></ion-label>
                            <ion-label slot="end"><strong>${{ subtotal }}</strong></ion-label>
                        </ion-item>
                        <ion-item class="item-totales">
                            <ion-label><strong>Insurage (Seguro):</strong></ion-label>
                            <ion-label slot="end">
                                <ion-input
                                    type="number"
                                    class="input-detalle" 
                                    placeholder="Insurage (USD)"
                                    v-model="insurage"
                                />
                            </ion-label>
                        </ion-item>
                        <ion-item class="item-totales">
                            <ion-label><strong>Others (Otros):</strong></ion-label>
                            <ion-label slot="end">
                                <ion-input
                                    type="number"
                                    class="input-detalle" 
                                    placeholder="Others (USD)"
                                    v-model="otros"
                                />
                            </ion-label>
                        </ion-item>
                        <ion-item class="item-totales">
                            <ion-label><strong>Total:</strong></ion-label>
                            <ion-label slot="end"><strong>${{ total }}</strong></ion-label>
                        </ion-item>
                        <ion-item class="item-totales">
                            <ion-label><strong>Codigo</strong></ion-label>
                            <ion-input 
                                slot="end" 
                                fill="solid"
                                placeholder="XM-01"
                                v-model="codigo"
                                />
                        </ion-item>
                    </ion-list>

                    <BotonGenerarGuiaDespacho 
                        :detallePedido="detallePedido"
                        :subtotal="subtotal.toString()"
                        :insurage="insurage.toString()"
                        :otros="otros.toString()"
                        :total="total.toString()"
                        :guiaDespachoId="guiaDespachoId"
                        @actualizarPrecioGuia="actualizarPrecioCompraGuia"
                        @guiaGenerada="mostrarAlertaExito"
                    />
                </ion-card-content>
            </ion-card>
        </ion-content>
    <!-- Success Alert -->
            <ion-alert
              :is-open="showSuccessAlert"
              header="¡Éxito!"
              message="Guía de despacho generada correctamente."
              :buttons="[{
                text: 'Aceptar',
                handler: () => {
                  router.replace({ name: 'GestionUsa' });
                }
              }]"
            />
    
            <!-- Error Alert -->
            <ion-alert
              :is-open="showErrorAlert"
              header="Error"
              message="Ocurrió un error al generar la guía de despacho. Por favor, inténtalo de nuevo."
              :buttons="[{
                text: 'Aceptar',
                handler: () => {
                  router.replace({ name: 'GestionUsa' });
                }
              }]"
            />
        </ion-page>
</template>

<script setup lang="ts">
import { DetallePedido, Pedido } from '@/interfaces/interfaces';
import detallePedidoService from '@/services/detallePedidoService';
import { Storage } from '@ionic/storage';
import { computed, onMounted, ref, watch } from 'vue';
import BotonGenerarGuiaDespacho from '@/components/BotonGenerarGuiaDespacho.vue';
import guiaDespachoService from '@/services/guiaDespachoService';
import pedidoService from '@/services/pedidoService';
import { useRouter } from 'vue-router';

const pedidos = ref<Pedido[]>([]);
const detallePedido = ref<DetallePedido[]>([]);
const isLoading = ref(true); // Estado de carga
const IMAGEN_URL = import.meta.env.VITE_IMAGES_URL;
const insurage = ref<number>(0);
const otros = ref<number>(0);
const codigo = ref<string>('');
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const router = useRouter();
const guiaDespachoId = ref<number>(0);


const getPedidos = async () => {
    const storage = new Storage();
    await storage.create(); // Asegúrate de que el Storage esté inicializado
    const pedidosStorage = await storage.get('pedidosSeleccionados');
    if (pedidosStorage) {
        pedidos.value = JSON.parse(pedidosStorage);
    }
    isLoading.value = false; // Finaliza la carga
};

onMounted(async () => {
    await getPedidos();

    // Lógica para obtener el detalle de cada pedido
    for (const pedido of pedidos.value) {
        const detalle = await detallePedidoService.getDetallePedidoByPedido_Id(String(pedido.id));
        detallePedido.value.push(...detalle);
    }
    console.log("detalle de los pedidos seleccionados", detallePedido.value);
});

// Función para actualizar el precio de la guía
const actualizarPrecioGuia = (index: number, event: Event) => {
    const nuevoPrecio = parseFloat((event.target as HTMLInputElement).value);
    detallePedido.value[index].precio_compra_guia = nuevoPrecio;
};

// Calcular subtotal
const subtotal = computed(() => {
    return detallePedido.value.reduce((acc, item) => {
        const precio = item.precio_compra_guia ?? item.Producto.Precio_compra_usd;
        return acc + item.cantidad * precio;
    }, 0);
});

// Calcular total
const total = computed(() => {
    return subtotal.value + Number(insurage.value) + Number(otros.value);
});

// Observar cambios en los precios
watch(detallePedido, () => {
    console.log("Precios actualizados:", detallePedido.value);
}, { deep: true });


const actualizarPrecioCompraGuia = async (resolve?: () => void) => {
  try {
    // Crear un array con los detalles actualizados
    const detalles = detallePedido.value.map((detalle) => ({
      id: detalle.id,
      precio_compra_guia: detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd,
    }));

    // Enviar todas las actualizaciones en paralelo
    await Promise.all(detalles.map((detalle) => detallePedidoService.putDetallePedido(detalle)));

    // Crear la guía de despacho
    const response = await guiaDespachoService.postGuiaDespacho({
      codigo: codigo.value,
      estados_id: 1,
      subtotal: subtotal.value,
      insurage: insurage.value,
      other: otros.value,
      total: total.value,
    });

    // Guardar el ID de la guía en la variable reactiva
    guiaDespachoId.value = response.id;
    console.log("Guía de despacho generada con ID:", guiaDespachoId.value);

    // Asociar los pedidos a la guía de despacho
    const pedidosActualizados = detallePedido.value.map((detalle) => ({
      id: detalle.pedidos_id,
      guia_despacho_id: guiaDespachoId.value,
    }));

    // Actualizar los pedidos con el ID de la guía de despacho
    await Promise.all(pedidosActualizados.map((pedido) => pedidoService.putPedido(pedido)));

    console.log("Pedidos actualizados con guía:", pedidosActualizados);
    console.log("DETALLES actualizados", detalles);
    
    // Si se proporcionó una función resolve, llamarla para indicar que la operación ha terminado
    if (resolve) resolve();
  } catch (error) {
    console.error("Error al actualizar los detalles o generar la guía de despacho:", error);
    showErrorAlert.value = true;
    if (resolve) resolve();
  }
};

// Nueva función para mostrar alerta de éxito después de completar todo el proceso
const mostrarAlertaExito = () => {
  showSuccessAlert.value = true;
};
</script>

<style scoped>
/* Estilos generales */
.item-minimalista {
    --padding-start: 0;
    --inner-padding-end: 0;
    margin-bottom: 16px;
    border-bottom: 1px solid #e0e0e0; /* Línea divisoria entre items */
}

.thumbnail {
    min-width: 80px;
    min-height: 80px;
    margin-right: 16px;
    border-radius: 8px;
    overflow: hidden;
}

.grid {
    width: 100%;
}

.col-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.col-input {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.col-total {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.codigo {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.nombre {
    font-size: 12px;
    color: #666;
    margin: 4px 0;
}

.adicional {
    font-size: 12px;
    color: #999;
    margin: 0;
}

.input-minimalista {
    width: 60px;
    max-width: 120px;
    text-align: center;
    margin-left: 4px;
    font-size: 14px;
    border: #666 solid 1px;
    border-radius: 4px;
}

.input-detalle {
    width: 60px;
    max-width: 120px;
    text-align: center;
    margin-left: 4px;
    font-size: 14px;
    border: #666 solid 1px;
    border-radius: 4px;
}

/* Estilos para la tarjeta de totales */
.item-totales {
    --padding-start: 0;
    --inner-padding-end: 0;
}

.grid-totales {
    width: 100%;
}

.col-label {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 14px;
    color: #333;
}

.col-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 14px;
    color: #333;
}
</style>