<template>
  <ion-card class="card-cliente">
    <ion-card-header>
      <ion-card-title class="nombre-cliente">
        {{ cliente.persona?.nombre || "Sin nombre" }}
      </ion-card-title>
    </ion-card-header>

    <ion-card-content
      class="contenido-cliente"
      @click="verDetallesCliente(cliente)"
    >
      <div class="grid-info">
        <div class="info-item">
          <label class="label">RUT</label>
          <p class="value">{{ cliente.persona?.n_identificacion || "N/D" }}</p>
        </div>

        <div class="info-item">
          <label class="label">Teléfono</label>
          <p class="value">{{ cliente.persona?.fono || "N/D" }}</p>
        </div>

        <div class="info-item">
          <label class="label">Email</label>
          <p class="value">{{ cliente.persona?.correo || "N/D" }}</p>
        </div>

        <div class="info-item wide">
          <label class="label">Región</label>
          <p class="value">
            <span v-if="cliente.Direccions && cliente.Direccions.length > 0">
              {{ cliente.Direccions.map((d) => d.Region?.nombre).join(", ") }}
            </span>
            <span v-else>No disponible</span>
          </p>
        </div>
      </div>
    </ion-card-content>

    <div class="card-footer-custom">
      <ion-button expand="block" color="primary" @click="verSaldosCliente()">
        <ion-icon :icon="walletOutline" slot="start" />
        Ver Saldos
      </ion-button>
    </div>
  </ion-card>
  <ion-modal :is-open="modalSaldosAbierto" @didDismiss="cerrarModalSaldos">
    <SaldosClientes
      :clienteNombre="cliente.persona?.nombre || 'Sin nombre'"
      :clienteId="cliente?.id"
      @cerrar="cerrarModalSaldos"
    />
  </ion-modal>
</template>

<script setup lang="ts">
import { Cliente } from "@/interfaces/interfaces";
import { useRouter } from "vue-router";
import { useClientesStore } from "@/stores/clienteStore";
import { walletOutline } from "ionicons/icons";
import SaldosClientes from "@/components/SaldosCliente.vue";
import { ref } from "vue";

const clientesStore = useClientesStore();
const router = useRouter();
const props = defineProps<{
  cliente: Cliente;
}>();
const cliente = props.cliente;
const modalSaldosAbierto = ref(false);

const verSaldosCliente = () => {
  modalSaldosAbierto.value = true;
};

const cerrarModalSaldos = () => {
  modalSaldosAbierto.value = false;
};

const verDetallesCliente = (cliente: Cliente) => {
  //cargar cliente en el store y navegar a la vista de detalles
  clientesStore.setCliente(cliente);
  router.push({ name: "DetallesCliente", params: { id: cliente.id } });
};
</script>

<style scoped>
.card-cliente {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
}

.card-cliente:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.nombre-cliente {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e1e1e;
  text-align: center;
  margin-top: 4px;
}

.grid-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-top: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.wide {
  grid-column: span 2;
}

.label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.value {
  font-size: 0.95rem;
  color: #333;
}

.card-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
}
</style>
