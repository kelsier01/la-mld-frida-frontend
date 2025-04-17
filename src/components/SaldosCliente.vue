<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="cerrarModal">Cerrar</ion-button>
        </ion-buttons>
        <ion-title>Saldos del Cliente</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('cerrar')">Cerrar</ion-button>
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
      <!-- Sección Pedidos -->
      <div v-if="segment === 'pedidos'">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Pedidos sin pago completo</ion-card-title>
          </ion-card-header>
        </ion-card>

        <ion-list>
          <ion-item v-for="pedido in pedidos" :key="pedido.id">
            <ion-checkbox
              slot="start"
              v-model="pedido.seleccionado"
              @ionChange="calcularTotal"
            />
            <ion-label>
              <h2>Pedido #{{ pedido.id }}</h2>
              <p>Abonos realizados: {{ formatCurrency(pedido.abono) }}</p>
              <p>Saldo pendiente: {{ formatCurrency(pedido.saldo) }}</p>
            </ion-label>
            <ion-note slot="end" color="dark">
              {{ formatCurrency(pedido.total) }}
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

      <!-- Sección Historial -->
      <div v-if="segment === 'historial'">
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
import { ref, onMounted } from "vue";

const props = defineProps<{
  clienteId?: number;
}>();

const emit = defineEmits(["cerrar"]);

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

const segment = ref("pedidos");

const pedidos = ref<Pedido[]>([
  { id: 1001, abono: 40000, saldo: 40000, total: 80000, seleccionado: true },
  { id: 1002, abono: 70000, saldo: 20000, total: 90000, seleccionado: false },
  { id: 1003, abono: 30000, saldo: 20000, total: 50000, seleccionado: false },
]);

const historialAbonos = ref<Abono[]>([
  { fecha: "2024-03-10", monto: 40000 },
  { fecha: "2024-03-20", monto: 30000 },
  { fecha: "2024-04-05", monto: 50000 },
]);

const totalSeleccionado = ref(0);

const cerrarModal = () => {
  emit("cerrar");
};

const calcularTotal = () => {
  totalSeleccionado.value = pedidos.value
    .filter((p) => p.seleccionado)
    .reduce((sum, p) => sum + p.saldo, 0);
};

const enviarWhatsApp = () => {
  const seleccionados = pedidos.value.filter((p) => p.seleccionado);
  const mensaje = seleccionados
    .map((p) => `Pedido #${p.id}: $${p.saldo}`)
    .join("\n");
  const total = totalSeleccionado.value;
  const texto = `Hola Camila, tienes los siguientes saldos pendientes:\n${mensaje}\nTotal: $${total}\nPor favor, realiza el pago. ¡Gracias!`;
  const url = `https://wa.me/56912345678?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
};

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

onMounted(() => {
  calcularTotal();
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
