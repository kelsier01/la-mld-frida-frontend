<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Usuarios</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Buscar usuario"
          show-clear-button="focus"
          class="searchbar"
        />
      </ion-toolbar>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-select
            label="Filtrar por tipo de usuario"
            interface="popover"
            :multiple="true"
            v-model="rolesFiltrados"
            class="filtro-rol"
            @ionChange="filtrarUsuarios"
          >
            <ion-select-option
              v-for="(rol, index) in roles"
              :key="index"
              :value="rol.id"
              >{{ rol.rol }}</ion-select-option
            >
          </ion-select>
        </ion-item>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" @ionInfinite="loadMoreUsuarios">
      <ion-list class="lista-usuarios">
        <ion-item
          v-for="(usuario, index) in usuarios"
          :key="index"
          class="item-usuario"
          @click="verDetallesUsuario(usuario)"
        >
          <ion-label>
            <h2>{{ usuario.empleados[0].persona.nombre || "Sin Nombre" }}</h2>
            <p>{{ usuario.role.rol }}</p>
            <p>{{ usuario?.isActive === 1 ? "Activo" : "Deshabilitado" }}</p>
          </ion-label>
          <ion-icon :icon="chevronForward" slot="end"/>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll @ionInfinite="loadMoreUsuarios" threshold="500px">
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="Cargando más datos..."
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>

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
            <ion-button @click="confirmarAgregarUsuario" :disabled="isLoading">Guardar</ion-button>
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
          >
          <ion-input-password-toggle slot="end"></ion-input-password-toggle>
        </ion-input>
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
import { InfiniteScrollCustomEvent, onIonViewWillEnter } from "@ionic/vue";
import { alertController } from "@ionic/vue";
import { ref, onMounted, watch } from "vue";
import { add, chevronForward } from "ionicons/icons";
import usuariosService from "@/services/usuarioService";
import { useNavigationStore } from "@/stores/navigations";
import rolesService from "@/services/rolesService";
import debounce from "lodash.debounce";
import { useRouter } from "vue-router";
import { format, validate } from "rut.js"




// Lista de usuarios (inicialmente vacía)
const usuarios = ref<any[]>([]);
const roles = ref<any[]>([]);
const navigationStore = useNavigationStore();
// Estado del modal de agregar
const modalAgregarAbierto = ref(false);
const isLoading = ref<boolean>(false);

// Datos del nuevo usuario
const nuevoUsuario = ref({
  password: "",
  roles_id: "",
  nombre: "",
  correo: "",
  n_identificacion: "",
  fono: "",
});

watch(() => nuevoUsuario.value.n_identificacion, (newVal) => {
  console.log('n_identificacion cambió  a', newVal);
  nuevoUsuario.value.n_identificacion = format(newVal);
  console.log("RUT", nuevoUsuario.value.n_identificacion);
  // Aquí puedes agregar la lógica que necesitas cuando n_identificacion cambia
});
// Estado del filtro de búsqueda y roles
const searchQuery = ref("");
const rolesFiltrados = ref(0);
const page = ref(1);
const totalUsuarios = ref(0);
const loading = ref(false);
const router = useRouter();

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

onIonViewWillEnter(() => {
  if (navigationStore.shouldRefreshUsers) {
    cargarUsuarios();
    navigationStore.setShouldRefresh(false);
  }
});

const cargarUsuarios = async () => {
  try {
    const response = await usuariosService.getAllUsuarios(
      page.value,
      rolesFiltrados.value,
      searchQuery.value
    );

    if (response.usuarios) {
      usuarios.value.push(...response.usuarios);
    }
    totalUsuarios.value = response.total || 0;
    console.log("totalUsuario en cararusuario", response)
  } catch (error) {
    console.error("Error al cargar Usuarios", error);
  } finally {
    loading.value = false;
  }
};

// Función para filtrar clientes
const filtrarUsuarios = debounce(async () => {
  page.value = 1;
  usuarios.value = [];
  await cargarUsuarios();
}, 300);

// Watch para cambios en la búsqueda
watch(searchQuery, async () => {
  await filtrarUsuarios();
});

// Watch para cambios en la región
watch(rolesFiltrados, async () => {
  page.value = 1;
  usuarios.value = [];
  await cargarUsuarios();
});

// Método para cargar más clientes (Infinite Scroll)
const loadMoreUsuarios = async (event: InfiniteScrollCustomEvent) => {
  console.log("loadMoreUsuarios ejecutado");
  console.log("Usuarios lenght", usuarios.value.length);
  console.log(usuarios.value)
  console.log("Total usuario", totalUsuarios.value)
  if (loading.value || usuarios.value.length >= totalUsuarios.value) {
    event.target.complete();
    event.target.disabled = true;
    return;
  }

  loading.value = true;
  page.value++;

  try {
    await cargarUsuarios();
  } catch (error) {
    console.error("Error al cargar más clientes", error);
  } finally {
    event.target.complete();
    loading.value = false;
  }
};

// Confirmar agregar usuario
const confirmarAgregarUsuario = async () => {
  const { password, roles_id, nombre, correo, n_identificacion } =
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

  if(!validate(n_identificacion)){
    const alert = await alertController.create({
      header: "Número de identificación inválido",
      message: "Por favor, ingrese un número de identificación válido.",
      buttons: ["OK"],
    });
    await alert.present();
    return;
  }

  try {
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
    //Paso todas las validaciones, se procede a cargar datos
    isLoading.value = true;

    await usuariosService.createUsuario(nuevoUsuario.value);

    const alert = await alertController.create({
      header: "Usuario agregado",
      message: "El usuario ha sido agregado correctamente.",
      buttons: ["OK"],
    });
    await alert.present();
    await cargarUsuarios();
    cerrarModalAgregar();
    isLoading.value = false;
    console.log("Modal: ", modalAgregarAbierto.value);
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

const verDetallesUsuario = (usuario: any) => {
  //cargar cliente en el store y navegar a la vista de detalles
  // clientesStore.setCliente(cliente);
  console.log("usuario a detalle", usuario);
  router.push({ name: "DetallesUsuario", params: { id: usuario.id } });
};

// Obtener usuarios desde el API al montar el componente
onMounted(async () => {
  cargarUsuarios();
  roles.value = await rolesService.getRoles();
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
