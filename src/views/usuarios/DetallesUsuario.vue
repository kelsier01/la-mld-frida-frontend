<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            @click="BackButton"
            default-href="/usuarios"
            text="Volver"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Detalles del Usuario</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="abrirModalEditar">
            <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="confirmarEliminarUsuario" color="danger">
            <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>
          <h2>Nombre Completo</h2>
          <p>{{ usuarioSeleccionado?.empleados[0]?.persona?.nombre }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>RUT</h2>
          <p>
            {{ usuarioSeleccionado?.empleados[0]?.persona?.n_identificacion }}
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Correo</h2>
          <p>{{ usuarioSeleccionado?.empleados[0]?.persona?.correo }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Rol</h2>
          <p>{{ usuarioSeleccionado?.role?.rol }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Teléfono</h2>
          <p>{{ usuarioSeleccionado?.empleados[0]?.persona?.fono }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Fecha de Creación</h2>
          <p>
            {{
              usuarioSeleccionado?.createdAt
                ? new Date(usuarioSeleccionado.createdAt).toLocaleDateString()
                : ""
            }}
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Estado</h2>
          <p>
            {{
              usuarioSeleccionado?.isActive === 1 ? "Activo" : "Deshabilitado"
            }}
          </p>
        </ion-label>
      </ion-item>
    </ion-content>

    <!-- Modal para editar usuario -->
    <ion-modal :is-open="modalEditarAbierto" @didDismiss="cerrarModalEditar">
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Usuario</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalEditar">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="guardarCambios">Guardar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            v-model="usuarioEditado.nombre"
            label="Nombre Completo"
            label-placement="stacked"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="usuarioEditado.n_identificacion"
            label="RUT"
            label-placement="stacked"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="usuarioEditado.correo"
            type="email"
            label="Correo"
            label-placement="stacked"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-select
            v-model="usuarioEditado.roles_id"
            label="Rol"
            label-placement="stacked"
          >
            <ion-select-option
              v-for="(rol, index) in roles"
              :key="index"
              :value="rol.id"
            >
              {{ rol.rol }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="usuarioEditado.fono"
            type="tel"
            label="Teléfono"
            label-placement="stacked"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-select
            v-model="usuarioEditado.isActive"
            label="Estado"
            label-placement="stacked"
          >
            <ion-select-option :value="1">Activo</ion-select-option>
            <ion-select-option :value="0">Deshabilitado</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  alertController,
} from "@ionic/vue";
import { onMounted, reactive, ref } from "vue";
import { pencil, trashOutline } from "ionicons/icons";
import { useRoute, useRouter } from "vue-router";
import usuarioService from "@/services/usuarioService";
import rolesService from "@/services/rolesService";
import { useNavigationStore } from "@/stores/navigations";

const modalEditarAbierto = ref(false);
const roles = ref<Array<{ id: number; rol: string }>>([]);
const idUsuario = ref(0);
const route = useRoute();
const router = useRouter();
const navigationStore = useNavigationStore();

const usuarioSeleccionado = ref<{
  empleados: Array<{
    persona: {
      nombre: string;
      n_identificacion: string;
      correo: string;
      fono: string;
    };
  }>;
  role?: { rol: string };
  createdAt: string;
  isActive: number;
} | null>(null);

const usuarioEditado = reactive({
  username: undefined,
  isActive: undefined,
  roles_id: undefined,
  nombre: undefined,
  correo: undefined,
  n_identificacion: undefined,
  fono: undefined,
});

const abrirModalEditar = () => {
  modalEditarAbierto.value = true;
};

const cerrarModalEditar = () => {
  modalEditarAbierto.value = false;
};

const cargarUsuario = async () => {
  idUsuario.value = Number(route.params.id);
  console.log("ID del usuario:", route.params.id);
  try {
    const usuario = await usuarioService.getUsuarioById(idUsuario.value);
    usuarioEditado.username = usuario.username;
    usuarioEditado.isActive = usuario.isActive;
    usuarioEditado.roles_id = usuario.roles_id;
    usuarioEditado.nombre = usuario.empleados[0].persona.nombre;
    usuarioEditado.correo = usuario.empleados[0].persona.correo;
    usuarioEditado.n_identificacion =
      usuario.empleados[0].persona.n_identificacion;
    usuarioEditado.fono = usuario.empleados[0].persona.fono;
    usuarioSeleccionado.value = usuario;
  } catch (error) {
    console.error("Error al cargar el usuario", error);
  }
};

const guardarCambios = async () => {
  if (
    !usuarioEditado.username ||
    !usuarioEditado.isActive ||
    !usuarioEditado.roles_id ||
    !usuarioEditado.nombre ||
    !usuarioEditado.correo ||
    !usuarioEditado.n_identificacion ||
    !usuarioEditado.fono
  ) {
    console.error("Error: Todos los campos son obligatorios");
    return;
  } else {
    try {
      await usuarioService.updateUsuario(idUsuario.value, usuarioEditado);
      console.log("Usuario actualizado:", usuarioEditado);
      await cargarUsuario();
      await datosGuardados();
      cerrarModalEditar();
      await BackButton();
    } catch (error) {
      console.error("Error al actualizar el usuario", error);
    }
  }
};

const datosGuardados = async () => {
  const alert = await alertController.create({
    header: "Actualizar Usuario",
    message: "Los datos se actualizaron correctamente.",
    buttons: [{ text: "Listo!", handler: cerrarModalEditar }],
  });
  await alert.present();
};

const BackButton = async () => {
  navigationStore.setShouldRefresh(true);
  router.push("/usuarios");
};

const confirmarEliminarUsuario = async () => {
  const alert = await alertController.create({
    header: "Eliminar Usuario",
    message: "¿Estás seguro de que deseas eliminar este usuario?",
    buttons: [
      { text: "Cancelar", role: "cancel" },
      { text: "Eliminar", handler: eliminarUsuario },
    ],
  });
  await alert.present();
};

const eliminarUsuario = async () => {
  // Aquí va la lógica para eliminar el usuario
  try {
    await usuarioService.deleteUsuario(idUsuario.value);
    await cargarUsuario();
    await datosGuardados();
    cerrarModalEditar();
    await BackButton();
  } catch (error) {
    console.error("Error al actualizar el usuario", error);
  }
};

onMounted(async () => {
  await cargarUsuario();
  roles.value = await rolesService.getRoles();
});
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>
