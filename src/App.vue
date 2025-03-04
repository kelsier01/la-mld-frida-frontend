<template>
  <ion-app>
    <!-- Spinner de carga mientras se verifica el token -->
    <ion-loading
      :is-open="!isAppReady"
      message="Cargando..."
      :duration="0"
    />

    <!-- Split pane y menú (se muestra solo cuando isAppReady es true) -->
    <ion-split-pane v-if="isAppReady" content-id="main-content">
      <ion-menu v-if="!esRutaRaiz" content-id="main-content" type="overlay">
        <ion-content>
          <ion-list id="inbox-list">
            <ion-list-header>
              <div class="container-logo">
                <ion-img class="logo" src="logo.png" alt="Logo"></ion-img>
                <ion-note class="text-lmd-frida">La Maleta de Frida</ion-note>
               </div>
            </ion-list-header>
        
            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" :detail="false" class="hydrated" :class="{ selected: selectedIndex === i }">
                <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <!-- Sección de Mantenedores con menú desplegable -->
            <ion-accordion-group>
              <ion-accordion value="mantenedores">
                <ion-item slot="header">
                  <ion-icon aria-hidden="true" slot="start" :ios="settingsOutline" :md="settingsSharp"></ion-icon>
                  <ion-label>Mantenedores</ion-label>
                </ion-item>
                <ion-list slot="content">
                  <ion-menu-toggle :auto-hide="false" v-for="(m, j) in appMantenedores" :key="j">
                    <ion-item @click="selectedIndex = appPages.length + j" router-direction="root" :router-link="m.url" lines="none" :detail="false" class="hydrated" :class="{ selected: selectedIndex === appPages.length + j }">
                      <ion-icon aria-hidden="true" slot="start" :ios="m.iosIcon" :md="m.mdIcon"></ion-icon>
                      <ion-label>{{ m.title }}</ion-label>
                    </ion-item>
                  </ion-menu-toggle>
                </ion-list>
              </ion-accordion>
            </ion-accordion-group>
          </ion-list>
        </ion-content>
        <div class="profile-container">
          <ion-item>
            <ion-icon :ios="personOutline" :md="personSharp" slot="start"></ion-icon>
            <ion-label>{{ "Juanito" }}</ion-label>
            <ion-button 
              fill="clear"
              @click="cerrarSesion"
            >
              Cerrar sesión
            </ion-button>
          </ion-item>
        </div>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
  IonAccordion,
  IonAccordionGroup,
  IonLoading,
  IonButton,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  bagOutline,
  bagSharp,
  cartOutline,
  cartSharp,
  documentTextOutline,
  documentTextSharp,
  fileTrayFullOutline,
  fileTrayFullSharp,
  peopleOutline,
  peopleSharp,
  personOutline,
  personSharp,
  pricetagOutline,
  pricetagSharp,
  receiptOutline,
  receiptSharp,
  settingsOutline,
  settingsSharp,
  storefrontOutline,
  storefrontSharp,
} from 'ionicons/icons';
import { useLoginStore } from '@/stores/loginStore';

// Estados
const isAppReady = ref(false); // Indica si la aplicación ha terminado de cargar
const selectedIndex = ref(0);
const route = useRoute();
const router = useRouter();

// Store de autenticación
const loginStore = useLoginStore();

// Inicializa la aplicación cuando el componente se monta
onMounted(async () => {
  await loginStore.initializeAuth(); // Verifica el token almacenado

  // Redirige al usuario según su estado de autenticación
  if (loginStore.isAuthenticated) {
    await router.push('/pedidos'); // Redirige a la página protegida
    console.log('Usuario autenticado', loginStore.user);

  } else {
    await router.push('/'); // Redirige al login si no está autenticado
  }

  // Marca la aplicación como lista
  isAppReady.value = true;
});

// Variables
const appPages = [
  {
    title: 'Nuevo Pedido',
    url: '/nuevopedido',
    iosIcon: cartOutline,
    mdIcon: cartSharp,
  },
  {
    title: 'Pedidos',
    url: '/pedidos',
    iosIcon: receiptOutline,
    mdIcon: receiptSharp,
  },
  {
    title: 'Gestión USA',
    url: '/gestionUSA',
    iosIcon: documentTextOutline,
    mdIcon: documentTextSharp,
  },
  {
    title: 'Gestión Chile',
    url: '/gestionChile',
    iosIcon: documentTextOutline,
    mdIcon: documentTextSharp,
  },
];

const appMantenedores = [
  {
    title: 'Productos',
    url: '/productos',
    iosIcon: bagOutline,
    mdIcon: bagSharp,
  },
  {
    title: 'Clientes',
    url: '/clientes',
    iosIcon: peopleOutline,
    mdIcon: peopleSharp,
  },
  {
    title: 'Bodegas',
    url: '/bodegas',
    iosIcon: storefrontOutline,
    mdIcon: storefrontSharp,
  },
  {
    title: 'Usuarios',
    url: '/usuarios',
    iosIcon: personOutline,
    mdIcon: personSharp,
  },
  {
    title: 'Categorias',
    url: '/categorias',
    iosIcon: pricetagOutline,
    mdIcon: pricetagSharp,
  },
  {
    title: 'Marcas',
    url: '/marcas',
    iosIcon: fileTrayFullOutline,
    mdIcon: fileTrayFullSharp,
  },
];

// Métodos
const path = window.location.pathname.split('/')[1];
if (path !== undefined) {
  selectedIndex.value = appPages.findIndex((page) => page.title.toLowerCase() === path.toLowerCase());
}

const esRutaRaiz = computed(() => route.path === '/');

const cerrarSesion = async () => {
  await loginStore.logout(); // Cierra la sesión en el store
  router.push('/'); // Redirige al login
};
</script>

<style scoped>
.logo {
  width: 50px;
  display: inline-block;
  vertical-align: middle;
}

.text-lmd-frida {
  display: inline-block;
  vertical-align: middle;
  margin-left: 10px; /* Ajusta este valor según sea necesario */
  font-size: 16px;
  margin-top: 20px; /* Ajusta este valor según sea necesario para manipular el eje y */
}

.container-logo{
  margin-bottom: 20px;
}
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-background-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
  font-size: 16px;

  margin-bottom: 18px;

  color: #757575;

  min-height: 26px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
  margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}

</style>