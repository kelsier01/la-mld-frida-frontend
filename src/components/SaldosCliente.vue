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
            <ion-card-title> Michael Aguirre</ion-card-title>
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
              Pendiente {{ formatCurrency(pedido.saldo) }}
            </ion-note>
          </ion-item>
        </ion-list>

        <ion-item lines="none">
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
                <p>Monto abonado: {{ formatCurrency(abono.monto) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Pedido {
  id: number;
  abono: number;
  saldo: number;
  total: number;
  seleccionado: boolean;
}

interface Abono {
  fecha: string;
  monto: number;
}

// Props y emits
const props = defineProps<{ clienteId?: number }>();
const emit = defineEmits(["cerrar"]);

const segment = ref<"pedidos" | "historial">("pedidos");

// Datos de ejemplo
const pedidos = ref<Pedido[]>([
  { id: 1001, abono: 40000, saldo: 40000, total: 80000, seleccionado: true },
  { id: 1002, abono: 70000, saldo: 20000, total: 90000, seleccionado: false },
  { id: 1003, abono: 30000, saldo: 20000, total: 50000, seleccionado: true },
]);

const historialAbonos = ref<Abono[]>([
  { fecha: "2024-03-10", monto: 40000 },
  { fecha: "2024-03-20", monto: 30000 },
  { fecha: "2024-04-05", monto: 50000 },
]);

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
  const mensaje = `Hola Michael Aguirre, tienes los siguientes saldos pendientes:\n${detalle}\n\nTotal: ${total}\nPor favor, realiza el pago. ¡Gracias!`;
  const url = `https://wa.me/56959292849?text=${encodeURIComponent(mensaje)}`;
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
</script>

<style scoped>
ion-card-title {
  font-weight: bold;
}
ion-item p {
  margin: 0;
}
</style>
