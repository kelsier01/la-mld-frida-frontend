<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Saldos del Cliente</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('cerrar')">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-segment v-model="segment" value="pedidos">
        <ion-segment-button value="pedidos">
          <ion-label>Pedidos</ion-label>
        </ion-segment-button>
        <ion-segment-button value="historial">
          <ion-label>Historial</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-header>

    <ion-content class="ion-padding" :fullscreen="true">
      <!-- Pedidos -->
      <div v-if="segment === 'pedidos'">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ props.clienteNombre }}</ion-card-title>
            <ion-card-subtitle>Pedidos sin pago completo</ion-card-subtitle>
          </ion-card-header>
        </ion-card>

        <ion-list>
          <ion-item
            v-for="pedido in pedidos"
            :key="pedido.id"
            button
            detail="false"
            @click="toggleSeleccion(pedido)"
          >
            <ion-checkbox
              slot="start"
              :checked="pedido.seleccionado"
              @ionChange="handleCheckboxChange(pedido, $event)"
              @click.stop
            />
            <ion-label>
              <h2>Pedido #{{ pedido.id }}</h2>
              <p>Total pedido: {{ formatCurrency(pedido.total) }}</p>

              <!-- Detalle de productos y abonos -->
              <div v-for="(item, index) in pedido.detalle" :key="index">
                <ion-item lines="none" class="producto-item">
                  <div class="producto-container">
                    <div class="producto-header">
                      <h3 class="producto-titulo">{{ item.producto }}</h3>
                      <ion-note class="total-abonado">
                        Total abonado:
                        {{
                          formatCurrency(
                            item.abonos.reduce((sum, a) => sum + a.monto, 0)
                          )
                        }}
                      </ion-note>
                    </div>

                    <div class="abonos-container">
                      <div
                        v-for="(abono, idx) in item.abonos"
                        :key="idx"
                        class="abono-item"
                      >
                        <ion-chip class="abono-chip">
                          <ion-label>{{
                            formatCurrency(abono.monto)
                          }}</ion-label>
                          <ion-note>{{ formatFecha(abono.fecha) }}</ion-note>
                        </ion-chip>
                      </div>
                    </div>
                  </div>
                </ion-item>
              </div>
            </ion-label>
            <ion-note slot="end" color="dark">
              Pendiente <br />
              {{ formatCurrency(pedido.saldo) }}
            </ion-note>
          </ion-item>
        </ion-list>

        <ion-item lines="none" v-if="pedidos.length === 0">
          <ion-label>No hay pedidos pendientes</ion-label>
        </ion-item>
        <ion-item lines="none" v-else>
          <ion-label><strong>Total seleccionado</strong></ion-label>
          <ion-note slot="end"
            ><strong>{{ formatCurrency(totalSeleccionado) }}</strong></ion-note
          >
        </ion-item>

        <ion-button expand="block" color="success" @click="enviarWhatsApp">
          <ion-icon slot="start" :icon="logoWhatsapp"></ion-icon>
          Solicitar pago vía WhatsApp
        </ion-button>
      </div>

      <!-- Historial -->
      <div v-else>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Historial de abonos</ion-card-title>
          </ion-card-header>
          <ion-list>
            <ion-item v-for="abono in historialAbonos" :key="abono.fecha">
              <ion-label>
                <h3>{{ formatFecha(abono.fecha) }}</h3>
                <p>
                  Monto abonado: {{ formatCurrency(abono.monto) }} Al Pedido #{{
                    abono.pedidoId
                  }}
                </p>
              </ion-label>
            </ion-item>
            <ion-item lines="none" v-if="historialAbonos.length === 0">
              <ion-label>No hay Abonos realizados</ion-label>
            </ion-item>
          </ion-list>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import pedidoService from "@/services/pedidoService";
import { logoWhatsapp } from "ionicons/icons";
import { ref, computed, onMounted } from "vue";

interface Pedido {
  id: number;
  abono: number;
  saldo: number;
  total: number;
  seleccionado: boolean;
  detalle: DetallePedido[]; // Asegurar que esta propiedad existe
}

interface DetallePedido {
  id: number;
  producto: string;
  abonos: AbonoProducto[]; // Nueva estructura para abonos por producto
}

interface AbonoProducto {
  monto: number;
  fecha: string;
}

interface Abono {
  pedidoId: number;
  fecha: string;
  monto: number;
}

// Props y emits
const props = defineProps<{
  clienteId?: number;
  clienteNombre: string;
  clienteFono: number;
}>();
const emit = defineEmits(["cerrar"]);

const segment = ref<"pedidos" | "historial">("pedidos");
// Datos de ejemplo
const pedidos = ref<Pedido[]>([]);
const historialAbonos = ref<Abono[]>([]);

const cargarAbonosCliente = async () => {
  try {
    const idParam = props.clienteId;
    if (!idParam || Array.isArray(idParam)) {
      throw new Error("ID de cliente inválido");
    }

    const id = Number(idParam);
    const data = await pedidoService.getPedidosByGastosCliente(id);
    console.log("Datos de pedidos:", data);
    const pedidosData = data.map((pedido: any) => {
      const total = pedido.monto_total;

      // Protección contra undefined
      const abonosPedido =
        pedido.Pagos?.flatMap(
          (p: any) =>
            p.Abonos?.map((a: any) => ({
              monto: a.monto,
              fecha: a.fecha,
            })) || []
        ) || [];

      // Mapeo seguro de detalles
      const detalle = (pedido.DetallePedidos || []).map((d: any) => ({
        id: d.id,
        producto: d.Producto?.nombre || "Producto desconocido",
        abonos: abonosPedido,
      }));

      return {
        id: pedido.id,
        abono: abonosPedido.reduce((sum: number, a: any) => sum + a.monto, 0),
        saldo:
          total -
          abonosPedido.reduce((sum: number, a: any) => sum + a.monto, 0),
        total,
        seleccionado: false,
        detalle,
      };
    });

    pedidos.value = pedidosData;

    // Mapeo seguro del historial
    const histAbonos = data
      .flatMap((pedido: any) =>
        (pedido.Pagos || []).flatMap((pago: any) =>
          (pago.Abonos || []).map((abono: any) => ({
            pedidoId: pedido.id,
            fecha: abono.createdAt,
            monto: abono.monto,
          }))
        )
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

    historialAbonos.value = histAbonos;
  } catch (err) {
    console.error("Error al cargar cliente:", err);
    mostrarToast("Error al cargar datos del cliente", "danger");
  } finally {
    console.log("Datos de pedidos mapeado:", pedidos.value);
  }
};
// Computed para recalcular el total seleccionado
const totalSeleccionado = computed(() =>
  pedidos.value
    .filter((p) => p.seleccionado)
    .reduce((sum, p) => sum + p.saldo, 0)
);

const handleCheckboxChange = (pedido: Pedido, event: CustomEvent) => {
  toggleSeleccion(pedido, event.detail.checked);
};

// Modificar la función toggleSeleccion para asegurarnos que siempre actualice el estado
const toggleSeleccion = (pedido: Pedido, checked?: boolean) => {
  pedido.seleccionado =
    typeof checked === "boolean" ? checked : !pedido.seleccionado;
  // Forzar la actualización del cálculo
  pedidos.value = [...pedidos.value];
};

// Envío de WhatsApp
const enviarWhatsApp = () => {
  const seleccionados = pedidos.value.filter((p) => p.seleccionado);
  if (!seleccionados.length) return;

  const detalle = seleccionados
    .map((p) => `Pedido #${p.id}: ${formatCurrency(p.saldo)}`)
    .join("\n");
  const total = formatCurrency(totalSeleccionado.value);
  const mensaje = `Hola ${props.clienteNombre}, tienes los siguientes saldos pendientes:\n${detalle}\n\nTotal: ${total}\nPor favor, realiza el pago. ¡Gracias!`;
  const url = `https://wa.me/56${props.clienteFono}?text=${encodeURIComponent(
    mensaje
  )}`;
  window.open(url, "_blank");
};

// Helpers de formato
const formatCurrency = (valor: number): string =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(valor);

const formatFecha = (fecha: string): string =>
  new Date(fecha).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
// Toast helper function
const mostrarToast = async (mensaje: string, color: string) => {
  const toast = document.createElement("ion-toast");
  toast.message = mensaje;
  toast.duration = 2000;
  toast.color = color;
  toast.position = "bottom";

  document.body.appendChild(toast);
  await toast.present();
};

onMounted(() => {
  cargarAbonosCliente();
});
</script>

<style scoped>
ion-card-title {
  font-weight: bold;
}
ion-item p {
  margin: 0;
}
.producto-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 1rem;
}

.producto-container {
  width: 100%;
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 1rem;
}

.producto-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--ion-color-medium-tint);
  padding-bottom: 0.5rem;
}

.producto-titulo {
  margin: 0;
  color: var(--ion-color-dark);
  font-size: 1.1rem;
  font-weight: 600;
}

.total-abonado {
  font-weight: 600;
  color: var(--ion-color-success);
}

.abonos-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.abono-item {
  flex: 0 1 auto;
}

.abono-chip {
  --background: var(--ion-color-light-shade);
  --color: var(--ion-color-dark);
  margin: 0;
}

.abono-chip ion-note {
  font-size: 0.8rem;
  margin-left: 0.5rem;
  color: var(--ion-color-medium);
}
</style>
