<template>
  <ion-page>
    <ion-content class="ion-padding">
      <ion-loading
        :is-open="loginStore.isLoading"
        message="Iniciando sesión..."
        :duration="0"
      />

      <div class="login-container">
        <div class="logo-container">
          <ion-img src="logo.png" alt="Logo de la aplicación" />
        </div>
        <ion-card>
          <ion-card-content>
            <form @submit.prevent="handleLogin">
              <!-- Input de RUT -->
              <ion-item :class="{ 'input-error': hasError }">
                <ion-input
                  v-model="rut"
                  type="text"
                  placeholder="Ingresa tu rut"
                  :clear-input="true"
                  @input="handleInputChange"
                >
                  <ion-icon
                    slot="start"
                    :icon="personOutline"
                    aria-label="Icono de persona"
                  ></ion-icon>
                </ion-input>
              </ion-item>
              <!-- Input de Contraseña -->
              <ion-item :class="{ 'input-error': hasError }">
                <ion-input
                  v-model="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  @input="handleInputChange"
                >
                  <ion-icon
                    slot="start"
                    :icon="lockClosedOutline"
                    aria-label="Icono de candado"
                  ></ion-icon>
                  <ion-input-password-toggle
                    slot="end"
                  ></ion-input-password-toggle>
                </ion-input>
              </ion-item>
              <!-- Mensaje de error -->
              <ion-note v-if="hasError" color="danger" class="error-message">
                {{ error }}
              </ion-note>

              <!-- Botón de Login -->
              <ion-button
                class="button-login"
                color="warning"
                expand="full"
                type="submit"
                :disabled="!rut || !password"
              >
                Iniciar sesión
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { lockClosedOutline, personOutline } from "ionicons/icons";
import { useLoginStore } from "@/stores/loginStore";

// Estados
const rut = ref("");
const password = ref("");
const error = ref("");
const hasError = ref(false);

// Router
const router = useRouter();

// Store
const loginStore = useLoginStore();

// Validación del RUT
const validateRUT = (rut: string) => {
  if (!rut) return false;
  // Lógica de validación del RUT
  return true; // Cambia esto según la validación real
};

// Manejo de cambios en los inputs
const handleInputChange = () => {
  hasError.value = false;
};

// Función de inicio de sesión
const handleLogin = async () => {
  if (!validateRUT(rut.value)) {
    error.value = "RUT inválido";
    hasError.value = true;
    return;
  }

  try {
    await loginStore.login(rut.value, password.value);

    if (loginStore.isAuthenticated) {
      console.log("Usuario autenticado:", loginStore.user);
      router.push("/pedidos");
    }
    if (loginStore.error) {
      error.value = "RUT o contraseña inválidos";
      hasError.value = true;
    }
  } catch (err) {
    error.value = "Error en el servidor";
    hasError.value = true;
  }
};
</script>

<style scoped>
.login-container {
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.button-login {
  margin-top: 50px;
}

ion-button {
  --border-radius: 300;
}

ion-card {
  width: 100%;
  max-width: 400px;
}

/* Estilo para inputs con error */
.input-error {
  --border-color: red;
  --highlight-color-focused: red;
}

/* Estilo para el mensaje de error */
.error-message {
  display: block;
  margin-top: 5px;
  margin-left: 16px; /* Ajusta según el diseño */
  font-size: 14px;
}
</style>
