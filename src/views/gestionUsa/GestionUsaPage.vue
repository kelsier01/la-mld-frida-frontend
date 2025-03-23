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
                />
            </ion-toolbar>
            <ion-toolbar>
                <ion-item>
                    <IonSelect 
                    label="Region"
                    placeholder="Seleccionar" 
                    interface="modal"
                    v-model="regionSeleccionada"
                    @update:modelValue="onChangeRegion"
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

        <ion-content class="ion-padding" @ionInfinite="loadMoreGuias">
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
            
            <!-- Lista de guias de despacho -->
            <ion-grid>
                <ion-row>
                    <ion-label 
                        v-show="guiasDespacho.length == 0"
                        >Sin Guias de Despacho Disponibles</ion-label>
                    <ion-col
                        size="12"
                        size-md="6"
                        size-lg="4"
                        v-for="guiaDespacho in guiasDespacho"
                        :key="guiaDespacho.id"
                    >
                        <GuiaDespachoCard 
                            :guiaDespacho="guiaDespacho"
                        />
                    </ion-col>
              </ion-row>
            </ion-grid>
            
            <!-- Infinite Scroll Component -->
            <ion-infinite-scroll @ionInfinite="loadMoreGuias" threshold="50px">
                <ion-infinite-scroll-content
                    loading-spinner="bubbles"
                    loading-text="Cargando más guías de despacho..."
                ></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import GuiaDespachoCard from '@/components/GuiaDespachoCard.vue';
import { GuiaDespacho, Region } from '@/interfaces/interfaces';
import guiaDespachoService from '@/services/guiaDespachoService';
import regionService from '@/services/regionService';
import { add } from 'ionicons/icons';
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { onIonViewWillEnter, InfiniteScrollCustomEvent } from '@ionic/vue';


const router = useRouter();
const regiones = ref<Region[]>([]);
const guiasDespacho = ref<GuiaDespacho[]>([]);
const regionSeleccionada = ref<number | null>(null);
const searchText = ref<string>('');
const page = ref(1);
const totalGuias = ref(0);
const loading = ref(false);

// Función para cargar las guías de despacho con mejor manejo de errores y logging
const cargarGuiasDespacho = async () => {
  try {
    loading.value = true;
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
  cargarGuiasDespacho();
};

watch(searchText, ()=>{ cargarGuiasDespacho() });

// Se ejecuta cuando la página está a punto de entrar en la vista
onIonViewWillEnter(() => {
  resetearGuias();
});

onBeforeMount(async () => {
  // Cargar regiones
  regiones.value = await regionService.getRegiones();
});
</script>

<style scoped>
.ion-padding {
  --padding-bottom: 80px; /* Añadir espacio para el FAB */
}
</style>

