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
              <p>Abonos realizados: {{ formatCurrency(pedido.abono) }}</p>
              <p>Total pedido: {{ formatCurrency(pedido.total) }}</p>
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

        <ion-button expand="block" color="primary" @click="enviarWhatsApp">
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
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

interface Pedido {
  id: number;
  abono: number;
  saldo: number;
  total: number;
  seleccionado: boolean;
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
    console.log("ID de cliente desde la ruta:", idParam);

    if (!idParam || Array.isArray(idParam)) {
      throw new Error("ID de cliente no proporcionado o inválido");
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      throw new Error("ID de cliente no es un número válido");
    }

    if (!id) throw new Error("ID de cliente no proporcionado");
    const data = await pedidoService.getPedidosByGastosCliente(id);
    console.log("Datos del cliente:", data);

    const pedidosData = data
      .map((pedido: any) => {
        const total = pedido.monto_total;
        const abono =
          pedido.Pagos?.flatMap((p: any) => p.Abonos || []).reduce(
            (acc: any, abono: any) => acc + (abono.monto || 0),
            0
          ) || 0;
        const saldo = total - abono;
        return {
          id: pedido.id,
          abono,
          saldo,
          total,
          seleccionado: false,
        };
      })
      .filter((p: any) => p.saldo > 0);
    pedidos.value = pedidosData;

    const histAbonos = data
      .flatMap((pedido: any) =>
        pedido.Pagos.flatMap((pago: any) =>
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
</style>
