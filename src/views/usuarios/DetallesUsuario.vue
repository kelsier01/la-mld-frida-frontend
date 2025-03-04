<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
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
          <p>{{ usuario?.empleados[0]?.persona?.nombre }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>RUT</h2>
          <p>{{ usuario?.empleados[0]?.persona?.n_identificacion }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Correo</h2>
          <p>{{ usuario?.empleados[0]?.persona?.correo }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Rol</h2>
          <p>{{ usuario?.role?.rol }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Teléfono</h2>
          <p>{{ usuario?.empleados[0]?.persona?.fono }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Fecha de Creación</h2>
          <p>{{ new Date(usuario?.createdAt).toLocaleDateString() }}</p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h2>Estado</h2>
          <p>{{ usuario?.isActive === 1 ? "Activo" : "Deshabilitado" }}</p>
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
import { reactive, ref } from "vue";
import { pencil, trashOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useUsuarioStore } from "@/stores/usuarioStore";
import { useRolesStore } from "@/stores/RolesStore";
import axios from "axios";
import { Storage } from "@ionic/storage"; // Asegúrate de tener @ionic/storage instalado para acceder a localStorage

const store = useUsuarioStore();
const storeRoles = useRolesStore();
const usuario = ref(store.usuario);
const roles = storeRoles.roles;
const router = useRouter();
const modalEditarAbierto = ref(false);
const usuarioEditado = reactive({
  username: null,
  isActive: null,
  roles_id: null,
  nombre: null,
  correo: null,
  n_identificacion: null,
  fono: null,
});
const storage = new Storage();
const API_URL = import.meta.env.VITE_API_URL;

const abrirModalEditar = () => {
  usuarioEditado.username = store.usuario.empleados[0].persona.n_identificacion;
  usuarioEditado.isActive = store.usuario.isActive;
  usuarioEditado.roles_id = store.usuario.roles_id;
  usuarioEditado.nombre = store.usuario.empleados[0].persona.nombre;
  usuarioEditado.correo = store.usuario.empleados[0].persona.correo;
  usuarioEditado.n_identificacion =
    store.usuario.empleados[0].persona.n_identificacion;
  usuarioEditado.fono = store.usuario.empleados[0].persona.fono;

  modalEditarAbierto.value = true;
};

const cerrarModalEditar = () => {
  modalEditarAbierto.value = false;
};

const guardarCambios = async () => {
  await storage.create();
  if (!store.usuario.id) {
    console.error("ID de usuario no encontrado");
    return;
  }

  try {
    const storedToken = await storage.get("authToken");
    const token = JSON.parse(storedToken);
    if (!token) {
      console.error("Token no encontrado");
      return;
    }
    const response = await axios.put(
      `${API_URL}/usuario/${store.usuario.id}`,
      usuarioEditado, // Datos editados
      {
        headers: {
          "x-token": token, // Agregar el token al encabezado
        },
      }
    );

    // Actualizar usuario en el store
    store.usuario = response.data;

    // Mostrar alerta de éxito
    const alert = await alertController.create({
      header: "Éxito",
      message: "Usuario actualizado correctamente.",
      buttons: ["OK"],
    });

    await alert.present();
    cerrarModalEditar();
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);

    // Mostrar alerta de error
    const alert = await alertController.create({
      header: "Error",
      message: "No se pudo actualizar el usuario. Inténtalo nuevamente.",
      buttons: ["OK"],
    });

    await alert.present();
    cerrarModalEditar();
  }
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
  router.push({ name: "Usuarios" });
  try {
    const storedToken = await storage.get("authToken");
    const token = JSON.parse(storedToken);
    if (!token) {
      console.error("Token no encontrado");
      return;
    }
    const response = await axios.delete(
      `${API_URL}/usuario/${store.usuario.id}`,
      {
        headers: {
          "x-token": token, // Agregar el token al encabezado
        },
      }
    );

    // Mostrar alerta de éxito
    const alert = await alertController.create({
      header: "Éxito",
      message: "Usuario eliminado correctamente.",
      buttons: ["OK"],
    });

    await alert.present();
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);

    // Mostrar alerta de error
    const alert = await alertController.create({
      header: "Error",
      message: "No se pudo eliminar el usuario. Inténtalo nuevamente.",
      buttons: ["OK"],
    });

    await alert.present();
    cerrarModalEditar();
  }
};
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>
