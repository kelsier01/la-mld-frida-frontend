<template>
  <ion-card class="card-cliente">
    <ion-card-header>
      <ion-card-title class="nombre-cliente">
        {{ cliente.persona?.nombre || "Sin nombre" }}
      </ion-card-title>
    </ion-card-header>

    <ion-card-content
      class="contenido-cliente"
      @click="Ir_a(cliente, 'DetallesCliente')"
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
      <ion-button
        expand="block"
        color="warning"
        @click="Ir_a(cliente, 'SaldosCliente')"
      >
        <ion-icon :icon="walletOutline" slot="start" />
        Ver Saldos
      </ion-button>
    </div>
  </ion-card>
  <ion-modal
    :is-open="modalSaldosAbierto"
    class="modal-large"
    @didDismiss="cerrarModalSaldos"
  >
    <SaldosClientes
      :clienteNombre="cliente.persona?.nombre || 'Sin nombre'"
      :clienteId="cliente?.id"
      :clienteFono="cliente.persona?.fono ? Number(cliente.persona.fono) : 0"
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

// const verSaldosCliente = () => {
//   modalSaldosAbierto.value = true;
// };

const cerrarModalSaldos = () => {
  modalSaldosAbierto.value = false;
};

const Ir_a = (cliente: Cliente, ruta: string) => {
  //cargar cliente en el store y navegar a la vista de detalles
  clientesStore.setCliente(cliente);
  router.push({ name: ruta, params: { id: cliente.id } });
};
</script>

<style scoped>
.card-cliente {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: var(
    --ion-card-background,
    #ffffff
  ); /* Fondo claro por defecto */
}

.card-cliente:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.card-cliente.dark {
  background-color: #1e1e1e; /* Fondo oscuro para modo oscuro */
  color: #f5f5f5; /* Texto claro para contraste */
}

.nombre-cliente {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ion-text-color, #1e1e1e); /* Texto oscuro por defecto */
  text-align: center;
  margin-top: 4px;
}

.nombre-cliente.dark {
  color: #ffffff; /* Texto claro para modo oscuro */
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
  color: var(--ion-label-color, #6b6b6b); /* Color de etiqueta por defecto */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.label.dark {
  color: #bbbbbb; /* Color de etiqueta más claro para modo oscuro */
}

.value {
  font-size: 0.95rem;
  color: var(--ion-text-color, #333); /* Texto oscuro por defecto */
}

.value.dark {
  color: #e0e0e0; /* Texto claro para modo oscuro */
}

.card-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
}

.card-footer-custom.dark {
  background-color: #2a2a2a; /* Fondo oscuro para el pie de tarjeta */
}

@media (min-width: 768px) {
  .modal-large {
    --width: 70%;
    --height: 90%;
  }
}
</style>
