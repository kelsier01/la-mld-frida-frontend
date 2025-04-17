<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/clientes" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Detalles del Cliente</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="abrirModalEditar">
            <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="confirmarEliminarCliente" color="danger">
            <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list v-if="cliente && cliente.persona">
        <ion-item>
          <ion-label>
            <h2>Nombre del Cliente</h2>
            <p>{{ cliente.persona.nombre || "N/D" }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>RUT</h2>
            <p>{{ cliente.persona.n_identificacion || "N/D" }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Teléfono</h2>
            <p>{{ cliente.persona.fono || "N/D" }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Instagram</h2>
            <p>{{ cliente.cta_instagram || "N/D" }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Mail</h2>
            <p>{{ cliente.persona.correo || "N/D" }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h2>Direcciones</h2>
            <ion-list>
              <ion-item
                v-if="!cliente.Direccions || cliente.Direccions.length === 0"
                >Sin direcciones</ion-item
              >
              <ion-item
                v-for="(direccion, index) in cliente?.Direccions"
                :key="index"
              >
                <p>
                  {{ direccion.Region.nombre }} - {{ direccion.Comuna.nombre }},
                  {{ direccion.direccion }}
                </p>
                <ion-buttons slot="end">
                  <ion-button @click="abrirModalEditarDireccion(index)">
                    <ion-icon :icon="pencil" slot="icon-only" />
                  </ion-button>
                  <ion-button
                    @click="confirmarEliminarDireccion(index)"
                    color="danger"
                  >
                    <ion-icon :icon="trashOutline" slot="icon-only" />
                  </ion-button>
                </ion-buttons>
              </ion-item>
            </ion-list>
            <ion-button @click="abrirModalAgregarDireccion"
              >Agregar Dirección</ion-button
            >
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>

    <EditarClienteModal
      v-if="cliente"
      :modalEditarAbierto="modalEditarAbierto"
      :cliente="cliente"
      @cerrarModalEditar="cerrarModalEditar"
      @guardarCambios="guardarCambios"
    />

    <ion-modal
      :is-open="modalAgregarDireccionAbierto"
      @didDismiss="cerrarModalAgregarDireccion"
    >
      <AgregarDireccionModal
        @cerrar="cerrarModalAgregarDireccion"
        @guardar="agregarDireccion"
      />
    </ion-modal>

    <ion-modal
      :is-open="modalEditarDireccionAbierto"
      @didDismiss="cerrarModalEditarDireccion"
    >
      <AgregarDireccionModal
        :titulo="'Editar Dirección'"
        :direccion="cliente?.Direccions?.[indiceDireccionEditada ?? 0]"
        @cerrar="cerrarModalEditarDireccion"
        @guardar="guardarCambiosDireccion"
      />
    </ion-modal>

    <ion-alert
      :is-open="alertaEliminarDireccionVisible"
      header="Eliminar Dirección"
      message="¿Estás seguro de que deseas eliminar esta dirección?"
      :buttons="[
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => setAlertaEliminarDireccionVisible(false),
        },
        {
          text: 'Eliminar',
          handler: () => eliminarDireccionSeleccionada(),
        },
      ]"
      @didDismiss="setAlertaEliminarDireccionVisible(false)"
    ></ion-alert>

    <ion-alert
      :is-open="alertaEliminarClienteVisible"
      header="Eliminar Cliente"
      message="¿Estás seguro de que deseas eliminar este cliente?"
      :buttons="[
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => setAlertaEliminarClienteVisible(false),
        },
        {
          text: 'Eliminar',
          handler: () => eliminarCliente(),
        },
      ]"
      @didDismiss="setAlertaEliminarClienteVisible(false)"
    ></ion-alert>

    <ion-toast
      :is-open="toastVisible"
      :message="toastMensaje"
      :duration="2000"
      :color="toastColor"
      position="bottom"
      @didDismiss="setToastVisible(false)"
    ></ion-toast>
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { pencil, trashOutline, walletOutline } from "ionicons/icons";
import { useClientesStore } from "@/stores/clienteStore";
import { Cliente, Direccion } from "@/interfaces/interfaces";
import EditarClienteModal from "@/components/EditarClienteModal.vue";
import AgregarDireccionModal from "@/components/AgregarDireccionModal.vue";
import clienteService from "@/services/clienteService";
import direccionService from "@/services/direccionService";

const route = useRoute();
const router = useRouter();
const clienteStore = useClientesStore();

// Estado local
const cliente = ref<Cliente | null>(null);
const modalEditarAbierto = ref<boolean>(false);
const modalAgregarDireccionAbierto = ref<boolean>(false);
const modalEditarDireccionAbierto = ref<boolean>(false);
const indiceDireccionEditada = ref<number | null>(null);
const direccionAEliminarIndex = ref<number | null>(null);

// Estado para alertas
const alertaEliminarDireccionVisible = ref<boolean>(false);
const alertaEliminarClienteVisible = ref<boolean>(false);
const direccionSeleccionada = ref<Direccion | null>(null);
// Estado para toast
const toastVisible = ref<boolean>(false);
const toastMensaje = ref<string>("");
const toastColor = ref<string>("success");

// Funciones para gestionar toast
const mostrarToast = (mensaje: string, color: string = "success") => {
  toastMensaje.value = mensaje;
  toastColor.value = color;
  toastVisible.value = true;
};

const setToastVisible = (visible: boolean) => {
  toastVisible.value = visible;
};

// Funciones para manejar alertas
const setAlertaEliminarDireccionVisible = (visible: boolean) => {
  alertaEliminarDireccionVisible.value = visible;
};

const setAlertaEliminarClienteVisible = (visible: boolean) => {
  alertaEliminarClienteVisible.value = visible;
};

// CAMBIO: Función para cargar cliente desde API
const cargarCliente = async () => {
  try {
    const id = route.params.id as string;
    if (!id) throw new Error("ID de cliente no proporcionado");
    const data = await clienteService.getClienteById(id);
    console.log("Datos del cliente:", data);

    cliente.value = data.cliente ?? data; // Ajuste según respuesta de la API
  } catch (err) {
    console.error("Error al cargar cliente:", err);
    mostrarToast("Error al cargar datos del cliente", "danger");
  }
};

// Abrir modal de edición del cliente
const abrirModalEditar = () => {
  modalEditarAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModalEditar = () => {
  modalEditarAbierto.value = false;
};

// Guardar cambios en la edición
const guardarCambios = async (clienteEditado: Cliente) => {
  try {
    if (!clienteEditado.id || !clienteEditado.persona) {
      throw new Error("Datos incompletos del cliente");
    }
    await clienteService.actualizarCliente(clienteEditado.id, {
      nombre: clienteEditado.persona.nombre,
      n_identificacion: clienteEditado.persona.n_identificacion,
      correo: clienteEditado.persona.correo,
      fono: clienteEditado.persona.fono,
      cta_instagram: clienteEditado.cta_instagram,
    });
    // Actualizar estado local y store
    cliente.value = { ...clienteEditado };
    clienteStore.setCliente(clienteEditado);
    mostrarToast("Cliente actualizado correctamente");
  } catch (error: any) {
    console.error("Error al actualizar cliente:", error);
    mostrarToast(error.message || "Error al actualizar el cliente", "danger");
  } finally {
    cerrarModalEditar();
  }
};

// Abrir modal para agregar dirección
const abrirModalAgregarDireccion = () => {
  modalAgregarDireccionAbierto.value = true;
};

// Cerrar modal para agregar dirección
const cerrarModalAgregarDireccion = () => {
  modalAgregarDireccionAbierto.value = false;
};

// Agregar dirección al cliente
const agregarDireccion = async (nuevaDireccion: Direccion) => {
  try {
    if (!cliente.value?.id) throw new Error("Cliente no válido");
    nuevaDireccion.clientes_id = cliente.value.id;
    await direccionService.postDireccion(nuevaDireccion);
    mostrarToast("Dirección agregada correctamente");
    cerrarModalAgregarDireccion();
    // Recargar los datos del cliente
    await cargarCliente();
  } catch (error) {
    console.error("Error al agregar dirección:", error);
    mostrarToast("Error al agregar dirección", "danger");
  } finally {
    cerrarModalAgregarDireccion();
  }
};

// Abrir modal para editar dirección
const abrirModalEditarDireccion = (index: number) => {
  indiceDireccionEditada.value = index;
  modalEditarDireccionAbierto.value = true;
};

// Cerrar modal para editar dirección
const cerrarModalEditarDireccion = () => {
  modalEditarDireccionAbierto.value = false;
  indiceDireccionEditada.value = null;
};

// Guardar cambios en la dirección editada
const guardarCambiosDireccion = async (direccionEditada: Direccion) => {
  try {
    if (
      !cliente.value ||
      !direccionEditada.id ||
      indiceDireccionEditada.value === null
    )
      throw new Error("Datos de dirección incompletos");

    await direccionService.putDireccion(direccionEditada.id, direccionEditada);

    // Cerrar la modal primero
    mostrarToast("Dirección actualizada correctamente");
    cerrarModalEditarDireccion();
    // Recargar los datos del cliente
    await cargarCliente();
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    mostrarToast("Error al actualizar dirección", "danger");
  } finally {
    cerrarModalEditarDireccion();
  }
};

// Confirmar eliminación de una dirección
const confirmarEliminarDireccion = (index: number) => {
  direccionAEliminarIndex.value = index;
  alertaEliminarDireccionVisible.value = true;
};

// Eliminar dirección seleccionada
const eliminarDireccionSeleccionada = async () => {
  try {
    const index = direccionAEliminarIndex.value;
    if (
      cliente.value &&
      cliente.value.Direccions &&
      index !== null &&
      cliente.value.Direccions[index].id
    ) {
      const direccionId = cliente.value.Direccions[index].id;
      await direccionService.deleteDireccion(direccionId);
      cliente.value.Direccions.splice(index, 1);
      mostrarToast("Dirección eliminada correctamente");
    } else {
      throw new Error("Dirección no válida");
    }
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    mostrarToast("Error al eliminar dirección", "danger");
  } finally {
    setAlertaEliminarDireccionVisible(false);
    direccionAEliminarIndex.value = null;
  }
};

// Confirmar eliminación del cliente
const confirmarEliminarCliente = () => {
  setAlertaEliminarClienteVisible(true);
};

// Eliminar cliente
const eliminarCliente = async () => {
  try {
    if (!cliente.value?.id) throw new Error("Cliente no válido");
    await clienteService.deleteCliente(cliente.value.id);
    mostrarToast("Cliente eliminado correctamente");
    cerrarModalEditar();
    await cargarCliente();
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    mostrarToast("Error al eliminar cliente", "danger");
  } finally {
    setAlertaEliminarClienteVisible(false);
  }
};

onBeforeMount(async () => {
  await cargarCliente();
});
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>
