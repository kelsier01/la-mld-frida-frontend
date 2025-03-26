<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Gestion USA</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar
                    v-model="searchText"
                    placeholder="Buscar por código"
                    debounce="500"
                    :disabled="loading"
                />
                <div v-if="searchLoading" class="search-spinner">
                    <ion-spinner name="dots" color="medium"></ion-spinner>
                </div>
            </ion-toolbar>
            <ion-toolbar>
                <ion-item lines="none">
                    <IonSelect 
                    label="Region"
                    placeholder="Seleccionar" 
                    interface="modal"
                    v-model="regionSeleccionada"
                    @update:modelValue="onChangeRegion"
                    :disabled="loading"
                    >
                        <IonSelectOption :value="null">
                            Todas las regiones
                        </IonSelectOption>    
                        <IonSelectOption
                            v-for="region in regiones"
                            :value="region.id"
                            :key="region.id"
                            >
                            {{region.nombre}}
                        </IonSelectOption>
                    </IonSelect>  
                </ion-item>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Spinner de carga principal -->
            <div class="loading-container" v-if="initialLoading">
                <ion-spinner name="circular" color="primary"></ion-spinner>
                <p>Cargando guías de despacho...</p>
            </div>

            <div v-else>
                <!-- Lista de guias de despacho -->
                <ion-grid>
                    <ion-row>
                        <ion-col
                            size="12"
                            size-md="6"
                            size-lg="4"
                            v-for="guiaDespacho in guiasDespacho"
                            :key="guiaDespacho.id"
                        >
                            <GuiaDespachoCard
                                :guiaDespacho="guiaDespacho"
                                :conCheckBox="false"
                                @guia-eliminada="handleGuiaEliminada"
                            />
                        </ion-col>
                        <!-- Mensaje cuando no hay guías -->
                        <ion-col size="12" v-if="guiasDespacho.length === 0 && !initialLoading">
                            <div class="no-data-container">
                                <ion-icon :icon="alertCircleOutline" class="no-data-icon"></ion-icon>
                                <h2>No se encontraron guías de despacho</h2>
                                <p>Intente con otra búsqueda o cree una nueva guía</p>
                            </div>
                        </ion-col>
                    </ion-row>
                </ion-grid>
                
                <!-- Infinite Scroll Component -->
                <ion-infinite-scroll @ionInfinite="loadMoreGuias" threshold="50px" :disabled="loading || guiasDespacho.length >= totalGuias">
                    <ion-infinite-scroll-content
                        loading-spinner="bubbles"
                        loading-text="Cargando más guías de despacho..."
                    ></ion-infinite-scroll-content>
                </ion-infinite-scroll>
            </div>

            <ion-fab
                vertical="bottom"
                horizontal="end"
                slot="fixed"
            >
                <ion-fab-button 
                    color="primary"
                    @click="NavegarACrearGuia"
                    >
                    <IonIcon :icon="add" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>
        
        <!-- Toast para notificaciones -->
        <ion-toast
            :is-open="mostrarToast"
            :message="mensajeToast"
            :duration="3000"
            :color="toastColor"
            @didDismiss="mostrarToast = false"
        ></ion-toast>
    </ion-page>
</template>

<script setup lang="ts">
import GuiaDespachoCard from '@/components/GuiaDespachoCard.vue';
import { GuiaDespacho, Region } from '@/interfaces/interfaces';
import guiaDespachoService from '@/services/guiaDespachoService';
import regionService from '@/services/regionService';
import { add, alertCircleOutline } from 'ionicons/icons';
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { onIonViewWillEnter, InfiniteScrollCustomEvent } from '@ionic/vue';
import debounce from 'lodash.debounce';

//Variables Datos
const router = useRouter();
const regiones = ref<Region[]>([]);
const guiasDespacho = ref<GuiaDespacho[]>([]);
const regionSeleccionada = ref<number | null>(null);

// Variables para los filtros
const searchText = ref<string>('');
const page = ref(1);
const totalGuias = ref(0);

// Variables para estados de carga
const loading = ref(false);
const initialLoading = ref(true);
const searchLoading = ref(false);

// Variables para el toast
const mostrarToast = ref(false);
const mensajeToast = ref('');
const toastColor = ref('success');

// Función para cargar las guías de despacho con mejor manejo de errores y logging
const cargarGuiasDespacho = async (isInitial = false) => {
  try {
    loading.value = true;
    if (isInitial) {
      initialLoading.value = true;
    } else if (page.value === 1) {
      searchLoading.value = true;
    }
    
    console.log("Cargando guías con parámetros:", {
      page: page.value,
      region: regionSeleccionada.value,
      search: searchText.value
    });
    
    const response = await guiaDespachoService.getGuiasDespacho(
      page.value, 
      regionSeleccionada.value,
      searchText.value
    );

    // Si estamos en la página 1, reiniciamos el array
    if (page.value === 1) {
      guiasDespacho.value = [];
    }
    
    // Verificar si la respuesta está en el formato esperado
    if (response && response.guiasDespacho) {
      guiasDespacho.value.push(...response.guiasDespacho);
      totalGuias.value = response.total || 0;
      console.log(`Se cargaron ${response.guiasDespacho.length} guías, total: ${response.total}`);
    } else if (Array.isArray(response)) {
      // Si la API devuelve directamente un array
      guiasDespacho.value.push(...response);
      console.log(`Se cargaron ${response.length} guías`);
    } else {
      console.warn("Formato de respuesta no reconocido:", response);
    }
    
  } catch (error) {
    console.error("Error al cargar guías de despacho:", error);
  } finally {
    loading.value = false;
    initialLoading.value = false;
    searchLoading.value = false;
  }
};

// Función que se ejecuta cuando se selecciona una región
const onChangeRegion = (value: number | null) => {
  console.log('Región seleccionada:', value);
  // Reiniciar paginación y filtrar por la región seleccionada
  page.value = 1;
  guiasDespacho.value = [];
  cargarGuiasDespacho();
};

// Método para cargar más guías de despacho (Infinite Scroll)
const loadMoreGuias = async (event: InfiniteScrollCustomEvent) => {
  console.log("Cargando más guías de despacho...");
  
  // Si estamos cargando o ya tenemos todas las guías, completar el evento
  if (loading.value || guiasDespacho.value.length >= totalGuias.value) {
    event.target.complete();
    // Deshabilitar el infinite scroll si ya cargamos todas las guías
    if (guiasDespacho.value.length >= totalGuias.value) {
      event.target.disabled = true;
    }
    return;
  }
  
  // Incrementar la página y cargar más guías
  page.value++;
  
  try {
    await cargarGuiasDespacho();
  } finally {
    event.target.complete();
  }
};

const NavegarACrearGuia = () => {
  router.push({ name: 'crearGuia' });
};

// Resetear la paginación y las guías cuando la vista se active
const resetearGuias = () => {
  page.value = 1;
  searchText.value = '';
  regionSeleccionada.value = null;
  guiasDespacho.value = [];
  initialLoading.value = true;
  cargarGuiasDespacho(true);
};

// Filtrado con debounce para el searchText
const filtrarPorBusqueda = debounce(() => {
  page.value = 1;
  guiasDespacho.value = [];
  cargarGuiasDespacho();
}, 500);

watch(searchText, () => {
  if (searchText.value.length > 0) {
    searchLoading.value = true;
  }
  filtrarPorBusqueda();
});

// Se ejecuta cuando la página está a punto de entrar en la vista
onIonViewWillEnter(() => {
  resetearGuias();
});

onBeforeMount(async () => {
  try {
    // Cargar regiones
    regiones.value = await regionService.getRegiones();
  } catch (error) {
    console.error("Error al cargar regiones:", error);
  }
});

// Función para manejar la eliminación de una guía de despacho
const handleGuiaEliminada = (guiaId: number) => {
    // Eliminar la guía del array de guías desplegadas
    guiasDespacho.value = guiasDespacho.value.filter(guia => guia.id !== guiaId);
    
    // Decrementar el total de guías
    if (totalGuias.value > 0) {
        totalGuias.value--;
    }
    
    // Mostrar mensaje de confirmación
    mensajeToast.value = 'Guía de despacho eliminada correctamente y pedidos desvinculados';
    toastColor.value = 'success';
    mostrarToast.value = true;
    
    // Si la lista queda vacía, recargar la página actual
    if (guiasDespacho.value.length === 0 && page.value > 1) {
        page.value--;
        cargarGuiasDespacho();
    }
};
</script>

<style scoped>
.ion-padding {
  --padding-bottom: 80px; /* Añadir espacio para el FAB */
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  margin: 2rem 0;
}

.loading-container ion-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.no-data-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 3rem 0;
  text-align: center;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 1rem;
  color: var(--ion-color-medium);
}

.search-spinner {
  position: absolute;
  right: 50px;
  top: 15px;
  height: 24px;
}

.search-spinner ion-spinner {
  width: 24px;
  height: 24px;
}
</style>

