<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Usuarios</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Barra de búsqueda y filtro por rol -->
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Buscar usuario"
        show-clear-button="focus"
        class="searchbar"
      ></ion-searchbar>
      <ion-select
        label="Filtrar por tipo de usuario"
        interface="popover"
        :multiple="true"
        v-model="rolesFiltrados"
        class="filtro-rol"
      >
        <ion-select-option
          v-for="(rol, index) in roles"
          :key="index"
          :value="rol.id"
          >{{ rol.rol }}</ion-select-option
        >
      </ion-select>

      <!-- Lista de usuarios filtrados -->
      <ion-list class="lista-usuarios">
        <ion-item
          v-for="(usuario, index) in usuariosFiltrados"
          :key="index"
          @click="verDetallesUsuario(usuario)"
          class="item-usuario"
        >
          <ion-label>
            <h2>{{ usuario.empleados[0].persona.nombre }}</h2>
            <p>{{ usuario.role.rol }}</p>
            <p>{{ usuario?.isActive === 1 ? "Activo" : "Deshabilitado" }}</p>
          </ion-label>
          <ion-icon :icon="chevronForward" slot="end"></ion-icon>
        </ion-item>
      </ion-list>

      <!-- Botón FAB para agregar nuevo usuario -->
      <ion-fab
        slot="fixed"
        vertical="bottom"
        horizontal="end"
        class="fab-button"
      >
        <ion-fab-button @click="abrirModalAgregar">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Modal para agregar nuevo usuario -->
    <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Usuario</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="cerrarModalAgregar">Cancelar</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click="confirmarAgregarUsuario">Guardar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoUsuario.nombre"
            type="text"
            label="Nombre Completo"
            label-placement="stacked"
            placeholder="Ingrese el nombre completo"
            required
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoUsuario.n_identificacion"
            type="text"
            label="RUT"
            label-placement="stacked"
            placeholder="Ingrese el RUT"
            required
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoUsuario.password"
            type="password"
            label="Contraseña"
            label-placement="stacked"
            placeholder="Ingrese la contraseña"
            required
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoUsuario.correo"
            type="email"
            label="Correo"
            label-placement="stacked"
            placeholder="Ingrese el correo"
            required
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-input
            v-model="nuevoUsuario.fono"
            type="tel"
            label="Teléfono"
            label-placement="stacked"
            placeholder="Ingrese el teléfono"
            required
          ></ion-input>
        </ion-item>
        <ion-item class="item-formulario">
          <ion-select
            v-model="nuevoUsuario.roles_id"
            label="Rol"
            label-placement="stacked"
            placeholder="Seleccione el tipo de usuario"
            required
          >
            <ion-select-option
              v-for="(rol, index) in roles"
              :key="index"
              :value="rol.id"
              >{{ rol.rol }}</ion-select-option
            >
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
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonButton,
  IonItem,
  IonInput,
  IonList,
  alertController,
  IonLabel,
} from "@ionic/vue";
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { add, chevronForward } from "ionicons/icons";
import { useRouter } from "vue-router";
import { Storage } from "@ionic/storage"; // Asegúrate de tener @ionic/storage instalado para acceder a localStorage
import { useUsuarioStore } from "@/stores/usuarioStore";
import { useRolesStore } from "@/stores/RolesStore";

const router = useRouter();
const storage = new Storage();
const store = useUsuarioStore();
const storeRoles = useRolesStore();
const API_URL = import.meta.env.VITE_API_URL;

// Lista de usuarios (inicialmente vacía)
const usuarios = ref<any[]>([]);
const roles = ref<any[]>([]);
console.log("users", usuarios);

// Estado del modal de agregar
const modalAgregarAbierto = ref(false);

// Datos del nuevo usuario
const nuevoUsuario = ref({
  password: "",
  roles_id: "",
  nombre: "",
  correo: "",
  n_identificacion: "",
  fono: "",
});

// Estado del filtro de búsqueda y roles
const searchQuery = ref("");
const rolesFiltrados = ref<string[]>([]);

// Computada para filtrar usuarios
const usuariosFiltrados = computed(() => {
  return usuarios.value.filter((usuario) => {
    // Chequear si el nombre o el correo coinciden con la búsqueda
    const matchesSearchQuery = usuario.empleados[0].persona.nombre
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());

    // Filtrado por roles
    const matchesRoleFilter =
      rolesFiltrados.value.length === 0 ||
      rolesFiltrados.value.includes(usuario.roles_id); // Asegurándonos que se compare con el id del rol

    return matchesSearchQuery && matchesRoleFilter;
  });
});

// Abrir modal para agregar
const abrirModalAgregar = () => {
  modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
  modalAgregarAbierto.value = false;
  // Limpiar los campos del formulario
  nuevoUsuario.value = {
    password: "",
    roles_id: "",
    nombre: "",
    correo: "",
    n_identificacion: "",
    fono: "",
  };
};

// Confirmar agregar usuario
const confirmarAgregarUsuario = async () => {
  const { password, roles_id, nombre, correo, n_identificacion, fono } =
    nuevoUsuario.value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validación de campos vacíos
  if (
    !nombre.trim() ||
    !n_identificacion.trim() ||
    !correo.trim() ||
    !password.trim() ||
    !roles_id // Validación de roles_id
  ) {
    const alert = await alertController.create({
      header: "Campos incompletos",
      message: "Por favor, complete todos los campos.",
      buttons: ["OK"],
    });
    await alert.present();
    return;
  }

  if (!emailRegex.test(correo)) {
    const alert = await alertController.create({
      header: "Correo inválido",
      message: "Por favor, ingrese un correo electrónico válido.",
      buttons: ["OK"],
    });
    await alert.present();
    return;
  }

  if (password.length < 6) {
    const alert = await alertController.create({
      header: "Contraseña débil",
      message: "La contraseña debe tener al menos 6 caracteres.",
      buttons: ["OK"],
    });
    await alert.present();
    return;
  }

  try {
    const storedToken = await storage.get("authToken");
    const token = JSON.parse(storedToken);

    if (!token) {
      console.error("Token no encontrado");
      const alert = await alertController.create({
        header: "Sesión expirada",
        message: "Por favor, inicie sesión nuevamente.",
        buttons: ["OK"],
      });
      await alert.present();
      return;
    }

    // Asegurarse de que roles_id es una cadena antes de enviar la solicitud
    const rolesIdString = String(roles_id).trim(); // Convertir roles_id a string y luego recortar los espacios

    // Si roles_id está vacío después de convertirlo a string, muestra una alerta
    if (!rolesIdString) {
      const alert = await alertController.create({
        header: "Campo roles_id vacío",
        message: "Por favor, seleccione un rol.",
        buttons: ["OK"],
      });
      await alert.present();
      return;
    }

    // Realizar la solicitud para agregar el usuario
    const response = await axios.post(
      `${API_URL}/usuario`,
      {
        ...nuevoUsuario.value,
        roles_id: rolesIdString, // Usar el roles_id convertido a string
      },
      {
        headers: {
          "x-token": token,
        },
      }
    );

    usuarios.value.push(response.data.usuario);

    const alert = await alertController.create({
      header: "Usuario agregado",
      message: "El usuario ha sido agregado correctamente.",
      buttons: ["OK"],
    });
    await alert.present();

    cerrarModalAgregar();
  } catch (error: any) {
    console.error("Error al agregar usuario:", error);

    const alert = await alertController.create({
      header: error.response ? "Error del servidor" : "Error de conexión",
      message: error.response
        ? error.response.data.message || "Error al agregar el usuario."
        : "No se pudo conectar con el servidor.",
      buttons: ["OK"],
    });
    await alert.present();
  }
};

// Navegar a la vista de detalles del usuario
const verDetallesUsuario = (usuario: any) => {
  store.setUsuario(usuario); // Almacena el usuario en el store
  router.push({ name: "DetallesUsuario", params: { id: usuario.id } });
};

// Obtener usuarios desde el API al montar el componente
onMounted(async () => {
  await storage.create();
  try {
    const storedToken = await storage.get("authToken");
    const token = JSON.parse(storedToken);
    // const storedUser = JSON.parse(await storage.get("user"));
    if (!token) {
      console.error("Token no encontrado");
      return;
    }

    const response = await axios.get(`${API_URL}/usuario`, {
      headers: {
        "x-token": token, // Agregar el token al encabezado
      },
    });

    const responseRoles = await axios.get(`${API_URL}/rol`, {
      headers: {
        "x-token": token, // Agregar el token al encabezado
      },
    });

    if (response.status === 200) {
      usuarios.value = response.data; // Poblar la lista de usuarios con los datos de la API
    } else {
      console.error("Error al obtener usuarios:", response.status);
    }

    if (responseRoles.status === 200) {
      roles.value = responseRoles.data; // Poblar la lista de usuarios con los datos de la API
      storeRoles.setRoles(responseRoles.data); // Almacena el usuario en el store
    } else {
      console.error("Error al obtener los Roles>:", responseRoles.status);
    }
  } catch (error) {
    console.error("Error de la solicitud:", error);
  }
});
</script>

<style scoped>
/* Estilos generales */
ion-content {
  --padding-top: 16px;
  --padding-bottom: 16px;
}

/* Barra de búsqueda */
.searchbar {
  margin-bottom: 16px;
}

/* Filtro por rol */
.filtro-rol {
  margin-bottom: 24px;
}

/* Lista de usuarios */
.lista-usuarios {
  margin-top: 16px;
}

.item-usuario {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 8px;
}

/* Botón FAB */
.fab-button {
  margin-bottom: 24px; /* Ajusta según sea necesario */
}

/* Estilos para el modal */
.item-formulario {
  margin-bottom: 16px;
}
</style>
