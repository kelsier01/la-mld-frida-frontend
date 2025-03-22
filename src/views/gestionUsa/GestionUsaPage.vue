<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Gestion USA</ion-title>
            </ion-toolbar>
        </ion-header>
    
        <ion-content>
            <IonGrid>
                <IonRow>
                    <IonCol>
                        <IonItem>
                            <IonSelect 
                                label="Region"
                                placeholder="Seleccionar" 
                                interface="modal"
                                v-model="regionSeleccionada"
                                @update:modelValue="onChangeRegion"
                                >
                                
                                <IonSelectOption
                                    v-for="region in regiones"
                                    :value="region.id"
                                    :key="region.id"
                                    >
                                    {{region.nombre}}
                                </IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </IonCol>
                </IonRow>
            </IonGrid>
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
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import GuiaDespachoCard from '@/components/GuiaDespachoCard.vue';
import { GuiaDespacho, Region } from '@/interfaces/interfaces';
import guiaDespachoService from '@/services/guiaDespachoService';
import regionService from '@/services/regionService';
import { add } from 'ionicons/icons';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { onIonViewWillEnter } from '@ionic/vue';

const router = useRouter();
const regiones = ref<Region[]>([]);
const guiasDespacho = ref<GuiaDespacho[]>([]);
const regionSeleccionada = ref<number | null>(null);

// Función para cargar las guías de despacho
const cargarGuiasDespacho = async () => {
  try {
    guiasDespacho.value = await guiaDespachoService.getGuiasDespacho();
    console.log("Guías de despacho cargadas:", guiasDespacho.value);
  } catch (error) {
    console.error("Error al cargar guías de despacho:", error);
  }
};

// Función que se ejecuta cuando se selecciona una región
const onChangeRegion = (value: number) => {
  console.log('Región seleccionada:', value);
};

const NavegarACrearGuia = () => {
  router.push({ name: 'crearGuia' });
};

// Se ejecuta cuando la página está a punto de entrar en la vista
onIonViewWillEnter(() => {
  cargarGuiasDespacho();
});

onBeforeMount(async () => {
  regiones.value = await regionService.getRegiones();
  // La primera carga de guías se hará en onBeforeMount
  await cargarGuiasDespacho();
});
</script>

<style scoped>
</style>

