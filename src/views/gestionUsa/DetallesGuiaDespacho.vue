<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button text="Volver" />
        </ion-buttons>
        <ion-title>Detalles Guía de Despacho</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Spinner de carga -->
      <div class="loading-container" v-if="isLoading">
        <ion-spinner name="circular" color="primary"></ion-spinner>
        <p>Cargando detalles de la guía...</p>
      </div>

      <div v-else>
        <!-- Tarjeta de detalles de productos -->
        <ion-card>
          <ion-card-content>
            <ion-list>
              <ion-item
                lines="none"
                v-for="(detalle, index) in detallePedido"
                :key="index"
                class="item-minimalista"
              >
                <div>
                  <ion-thumbnail slot="start" class="thumbnail">
                    <ion-img
                      :src="`${IMAGEN_URL}${detalle.Producto.ProductoImagens[0].url}`"
                    />
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
                        :class="{
                          'input-error':
                            !getPrecioUnitario(detalle) ||
                            isNaN(getPrecioUnitario(detalle)),
                        }"
                        placeholder="Precio unit. (usd)"
                        :value="getPrecioUnitario(detalle)"
                        @input="actualizarPrecioGuia(index, $event)"
                      />
                      <ion-label><strong>USD</strong></ion-label>
                      <div
                        v-if="
                          !getPrecioUnitario(detalle) ||
                          isNaN(getPrecioUnitario(detalle))
                        "
                        class="precio-invalido"
                      >
                        <span>Precio inválido</span>
                      </div>
                    </ion-col>
                    <ion-col size="12" size-md="3" class="col-total">
                      <ion-label>
                        <strong>
                          TOTAL: {{ formatoUSD(calcularTotalDetalle(detalle)) }} USD
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
          <ion-card-header>
            <ion-card-title>Resumen de Costos</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item class="item-totales">
                <ion-label><strong>Subtotal:</strong></ion-label>
                <ion-label slot="end"
                  ><strong>{{ formatoUSD(subtotal) }} USD</strong></ion-label
                >
              </ion-item>
              <ion-item class="item-totales">
                <ion-label><strong>Insurage (Seguro):</strong></ion-label>
                <ion-input
                  type="number"
                  class="input-detalle"
                  placeholder="Insurage (USD)"
                  v-model="insurage"
                />
                <ion-label slot="end"><strong>USD</strong></ion-label>
              </ion-item>
              <ion-item class="item-totales">
                <ion-label><strong>Others (Otros):</strong></ion-label>
                <ion-input
                  type="number"
                  class="input-detalle"
                  placeholder="Others (USD)"
                  v-model="otros"
                />
                <ion-label slot="end"><strong>USD</strong></ion-label>
              </ion-item>
              <ion-item class="item-totales">
                <ion-label><strong>Total:</strong></ion-label>
                <ion-label slot="end"
                  ><strong>{{ formatoUSD(total) }} USD</strong></ion-label
                >
              </ion-item>
              <ion-item class="item-totales">
                <ion-label><strong>Codigo</strong></ion-label>
                <ion-input
                  slot="end"
                  class="input-detalle"
                  :class="{ 'input-error': !codigo.trim() }"
                  placeholder="XM-01"
                  v-model="codigo"
                  :disabled="true"
                />
                <!-- Indicador visual para código vacío -->
                <div v-if="!codigo.trim()" class="codigo-invalido">
                  <span>Campo obligatorio</span>
                </div>
              </ion-item>
            </ion-list>

            <!-- Mensaje de error de validación -->
            <div v-if="errorMensaje" class="error-mensaje">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span>{{ errorMensaje }}</span>
            </div>

            <!-- Advertencia de valores NaN -->
            <div v-if="hayValoresNaN" class="nan-advertencia">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span
                >Hay productos sin precio o con valores inválidos. Revise los
                campos marcados en rojo.</span
              >
            </div>

            <!-- Advertencia específica para código faltante -->
            <div
              v-if="!codigo.trim() && !errorMensaje"
              class="codigo-advertencia"
            >
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span
                >Falta el código de la guía de despacho. Este campo es
                obligatorio.</span
              >
            </div>

            <BotonGenerarGuiaDespacho
              :detallePedido="detallePedido"
              :subtotal="subtotal.toString()"
              :insurage="insurage.toString()"
              :otros="otros.toString()"
              :total="total.toString()"
              :guiaDespachoId="guiaDespachoId"
              :fecha="guiaDespacho?.createdAt || ''"
              :disabled="
                isProcessing ||
                hayValoresNaN ||
                !camposValidos ||
                !codigo.trim()
              "
              :codigo="codigo"
              @actualizarPrecioGuia="actualizarPrecioCompraGuia"
              @guiaGenerada="mostrarAlertaExito"
            >
              <template v-slot:content>
                <span v-if="!isProcessing">Guardar y Generar Excel</span>
                <ion-spinner
                  v-else
                  name="crescent"
                  class="spinner-button"
                ></ion-spinner>
              </template>
            </BotonGenerarGuiaDespacho>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
    <!-- Success Alert -->
    <ion-alert
      :is-open="showSuccessAlert"
      header="¡Éxito!"
      message="Guía de despacho generada correctamente."
      :buttons="[
        {
          text: 'Aceptar',
          handler: () => volverAGestionUsa(),
        },
      ]"
    />

    <!-- Error Alert -->
    <ion-alert
      :is-open="showErrorAlert"
      header="Error"
      message="Ocurrió un error al generar la guía de despacho. Por favor, inténtalo de nuevo."
      :buttons="[
        {
          text: 'Aceptar',
          handler: () => {
            showErrorAlert = false;
          },
        },
      ]"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { DetallePedido, GuiaDespacho, Pedido } from "@/interfaces/interfaces";
import detallePedidoService from "@/services/detallePedidoService";
import { computed, onMounted, ref, watch } from "vue";
import BotonGenerarGuiaDespacho from "@/components/BotonGenerarGuiaDespacho.vue";
import guiaDespachoService from "@/services/guiaDespachoService";
import pedidoService from "@/services/pedidoService";
import { onIonViewDidLeave, useIonRouter } from "@ionic/vue";
import { useRoute } from "vue-router";
import { alertCircleOutline } from "ionicons/icons";
import { formatoUSD } from "@/utilities/useDineroFormato";

//Variables de Datos
const pedidos = ref<Pedido[]>([]);
const detallePedido = ref<DetallePedido[]>([]);
const guiaDespacho = ref<GuiaDespacho>();

//Variables de Estado
const isLoading = ref(true); // Estado de carga inicial
const isProcessing = ref(false); // Estado de procesamiento (para generar guía)
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);

//Variables de URL
const IMAGEN_URL = import.meta.env.VITE_IMAGES_URL;

//Variables de Guia de Despacho
const insurage = ref<number>(0);
const otros = ref<number>(0);
const codigo = ref<string>("");

const route = useRoute();
const guiaDespachoId = ref<number>(Number(route.params.id));

//Variables de navegacion
const ionRouter = useIonRouter();

//Variables adicionales para manejo de validación
const errorMensaje = ref<string>("");
const camposValidos = ref<boolean>(true);

// Función para obtener el precio unitario de un detalle con validación
const getPrecioUnitario = (detalle: DetallePedido) => {
  const precio =
    detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd;
  return precio === null || precio === undefined || isNaN(precio) ? 0 : precio;
};

// Función para calcular el total de un detalle con validación
const calcularTotalDetalle = (detalle: DetallePedido) => {
  const precioUnitario = getPrecioUnitario(detalle);
  const total = detalle.cantidad * precioUnitario;
  return isNaN(total) ? 0 : total;
};

// Verificar si hay valores NaN en los detalles
const hayValoresNaN = computed(() => {
  return detallePedido.value.some((detalle) => {
    const precio = getPrecioUnitario(detalle);
    return precio === 0 || isNaN(precio);
  });
});

// Calcular subtotal con validación mejorada
const subtotal = computed(() => {
  const total = detallePedido.value.reduce((acc, item) => {
    const precio = getPrecioUnitario(item);
    return acc + item.cantidad * precio;
  }, 0);
  return isNaN(total) ? 0 : total;
});

// Calcular total con validación mejorada
const total = computed(() => {
  const ins = Number(insurage.value) || 0;
  const otr = Number(otros.value) || 0;
  const tot = subtotal.value + ins + otr;
  return isNaN(tot) ? 0 : tot;
});

// Función para actualizar el precio de la guía con validación
const actualizarPrecioGuia = (index: number, event: Event) => {
  const nuevoPrecio = parseFloat((event.target as HTMLInputElement).value);
  detallePedido.value[index].precio_compra_guia = isNaN(nuevoPrecio)
    ? 0
    : nuevoPrecio;
  validarCampos(); // Validar campos después de cada cambio
};

// Función mejorada para validar campos
const validarCampos = () => {
  // Validar que todos los productos tengan precio válido (no NaN, no 0)
  const todosPreciosCompletos = detallePedido.value.every((detalle) => {
    const precio = getPrecioUnitario(detalle);
    return precio !== 0 && !isNaN(precio);
  });

  // Validar específicamente que el código de guía esté completo
  const codigoCompleto = codigo.value.trim().length > 0;

  // Validar que insurage y otros tengan valores válidos
  const insurageValido = !isNaN(Number(insurage.value));
  const otrosValido = !isNaN(Number(otros.value));

  // Actualizar estado de validación
  camposValidos.value =
    todosPreciosCompletos && codigoCompleto && insurageValido && otrosValido;

  // Establecer mensaje de error apropiado con prioridad al código
  if (!codigoCompleto) {
    errorMensaje.value = "Debe ingresar un código para la guía de despacho.";
  } else if (!todosPreciosCompletos) {
    errorMensaje.value =
      "Todos los productos deben tener un precio mayor a cero.";
  } else if (!insurageValido || !otrosValido) {
    errorMensaje.value =
      "Los valores de Insurage y Others deben ser números válidos.";
  } else {
    errorMensaje.value = "";
  }

  return camposValidos.value;
};

// Observar cambios en el código específicamente
watch(
  codigo,
  (newValue) => {
    // Si el código cambia, validamos inmediatamente
    if (!newValue || !newValue.trim()) {
      errorMensaje.value = "Debe ingresar un código para la guía de despacho.";
      camposValidos.value = false;
    } else {
      // Si el código ahora es válido, ejecutamos la validación completa
      validarCampos();
    }
  },
  { immediate: true }
);

const getPedidos = async () => {
  try {
    pedidos.value = await pedidoService.getPedidosByGuiaDespachoId(
      guiaDespachoId.value
    );
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    showErrorAlert.value = true;
  }
};

// Mejorar la función de actualizar precios para validar antes de enviar
const actualizarPrecioCompraGuia = async (resolve?: () => void) => {
  try {
    // Validar antes de procesar
    if (hayValoresNaN.value || !camposValidos.value) {
      errorMensaje.value =
        "No se puede generar la guía. Hay campos con valores inválidos.";
      if (resolve) resolve();
      return;
    }

    isProcessing.value = true;

    // Crear un array con los detalles actualizados
    const detalles = detallePedido.value.map((detalle) => ({
      id: detalle.id,
      precio_compra_guia:
        detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd,
    }));

    // Enviar todas las actualizaciones en paralelo
    await Promise.all(
      detalles.map((detalle) => detallePedidoService.putDetallePedido(detalle))
    );

    // Si se proporcionó una función resolve, llamarla para indicar que la operación ha terminado
    if (resolve) resolve();
  } catch (error) {
    console.error(
      "Error al actualizar los detalles o generar la guía de despacho:",
      error
    );
    showErrorAlert.value = true;
    if (resolve) resolve();
  } finally {
    isProcessing.value = false;
  }
};

// Nueva función para mostrar alerta de éxito después de completar todo el proceso
const mostrarAlertaExito = () => {
  showSuccessAlert.value = true;
};

// Función para volver a GestionUsa
const volverAGestionUsa = () => {
  ionRouter.navigate("/gestionUsa", "root", "replace");
};

const getGuiaDespachoById = async () => {
  try {
    guiaDespacho.value = await guiaDespachoService.getGuiaDespachoById(
      guiaDespachoId.value
    );
    if (guiaDespacho.value) {
      insurage.value = guiaDespacho.value.insurage;
      otros.value = guiaDespacho.value.other;
      codigo.value = guiaDespacho.value.codigo;
    }
  } catch (error) {
    console.error("Error al cargar guía de despacho:", error);
    showErrorAlert.value = true;
  }
};

const cargarTodosLosDatos = async () => {
  isLoading.value = true;
  try {
    // Cargamos los pedidos y la guía de despacho en paralelo
    await Promise.all([getPedidos(), getGuiaDespachoById()]);

    // Una vez que tenemos los pedidos, obtenemos los detalles
    if (pedidos.value.length > 0) {
      const detallesPromises = pedidos.value.map((pedido) =>
        detallePedidoService.getDetallePedidoByPedido_Id(String(pedido.id))
      );
      const detalles = await Promise.all(detallesPromises);
      detalles.forEach((detalle) => detallePedido.value.push(...detalle));
      console.log("Detalles de los pedidos cargados:", detallePedido.value);
    } else {
      console.log("No hay pedidos asociados a esta guía de despacho");
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
    showErrorAlert.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await cargarTodosLosDatos();
  validarCampos(); // Validar campos iniciales después de cargar datos
});

onIonViewDidLeave(() => {
  // Limpiar los datos al salir de la vista
  detallePedido.value = [];
  pedidos.value = [];
  isLoading.value = true;
  isProcessing.value = false;
  showSuccessAlert.value = false;
  showErrorAlert.value = false;
});
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
  position: relative;
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

/* Estilos para los estados de carga */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
  margin: 2rem 0;
}

.loading-container ion-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.spinner-button {
  width: 24px;
  height: 24px;
}

/* Estilos para mensajes de error y validación */
.error-mensaje {
  color: #eb445a;
  margin: 12px 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  background-color: rgba(235, 68, 90, 0.1);
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #eb445a;
}

.error-mensaje ion-icon {
  margin-right: 8px;
  font-size: 20px;
}

.nan-advertencia {
  color: #eb445a;
  margin: 12px 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  background-color: rgba(235, 68, 90, 0.1);
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #eb445a;
}

.nan-advertencia ion-icon {
  margin-right: 8px;
  font-size: 20px;
}

.precio-invalido {
  position: absolute;
  bottom: -20px;
  right: 0;
  color: #eb445a;
  font-size: 12px;
  font-weight: bold;
}

.input-error {
  border: 2px solid #eb445a !important;
  background-color: rgba(235, 68, 90, 0.05);
}

.codigo-invalido {
  color: #eb445a;
  font-size: 12px;
  font-weight: bold;
  margin-top: 4px;
}

.codigo-advertencia {
  color: #eb445a;
  margin: 12px 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  background-color: rgba(235, 68, 90, 0.1);
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #eb445a;
}

.codigo-advertencia ion-icon {
  margin-right: 8px;
  font-size: 20px;
}
</style>
