<template>
    <ion-content class="ion-padding">
        <ion-item>
            <ion-select 
                label="Región" 
                placeholder="Seleccionar"
                v-model="regionSeleccion"
                interface="modal"
                @ionChange="resetComprobantesYBuscar"
            >
                <ion-select-option value="0">
                    Todas las regiones
                </ion-select-option>
                <ion-select-option
                    v-for="region in regiones"
                    :key="region.id" 
                    :value="region.id"
                >
                    {{ region.nombre }}
                </ion-select-option>
            </ion-select>
        </ion-item>
        
        <!-- Spinner de carga -->
        <div v-if="isLoading" class="loading-container">
            <ion-spinner name="circular"/>
            <p>Cargando comprobantes de venta...</p>
        </div>
        
        <div v-else>
            <ion-card v-if="comprobantes.length === 0 && !loading">
                <ion-card-content class="ion-text-center">
                    <ion-icon :icon="alertCircleOutline" class="no-data-icon"></ion-icon>
                    <p>No se encontraron comprobantes de venta con los filtros seleccionados</p>
                </ion-card-content>
            </ion-card>
            <ion-grid>
                <ion-row>
                    <ion-col 
                        v-for="(comprobante) in comprobantes" 
                        :key="comprobante.id" 
                        size="12" 
                        size-md="6" 
                        size-lg="4">
                            <ComprobanteVentaCard 
                                :conCheckBox="false"
                                :comprobanteVenta="comprobante"
                                @comprobanteEliminado="handleComprobanteEliminado"
                            />
                    </ion-col>
                </ion-row>
            </ion-grid>

            <ion-infinite-scroll 
                @ionInfinite="loadMoreComprobantes" 
                threshold="50px"
                :disabled="loading || comprobantes.length >= totalComprobantes"
            >
                <ion-infinite-scroll-content
                    loading-spinner="bubbles"
                    loading-text="Cargando más comprobantes de venta..."
                />
            </ion-infinite-scroll>
        </div>
    </ion-content>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { InfiniteScrollCustomEvent } from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';
import ComprobanteVentaCard from '@/components/comprobanteVentaCard.vue';
import comprobanteVentaService from '@/services/comprobanteVentaService';
import regionService from '@/services/regionService';
import { Region, ComprobanteVenta } from '@/interfaces/interfaces';

// Variables básicas
const regiones = ref<Region[]>([]);
const comprobantes = ref<ComprobanteVenta[]>([]);
const regionSeleccion = ref<number>(0);

// Variables para el infinite scroll
const totalComprobantes = ref<number>(0);
const page = ref<number>(1);
const loading = ref<boolean>(false);
const isLoading = ref<boolean>(true);

// Función para obtener regiones
const getRegiones = async () => {
    try {
        regiones.value = await regionService.getRegiones();
    } catch (error) {
        console.error("Error al cargar regiones:", error);
    }
};

// Función para obtener comprobantes de venta con paginación
const obtenerComprobantes = async () => {
    try {
        loading.value = true;
        const response = await comprobanteVentaService.getComprobantesVenta();
        console.log("Comprobantes de venta:", response);
        if (response) {
            comprobantes.value.push(...response);
            totalComprobantes.value = response.total || 0;
        }
    } catch (error) {
        console.error("Error al cargar comprobantes de venta:", error);
    } finally {
        loading.value = false;
        isLoading.value = false;
    }
};

// Función para cargar más comprobantes (infinite scroll)
const loadMoreComprobantes = async (event: InfiniteScrollCustomEvent) => {
    if (loading.value || comprobantes.value.length >= totalComprobantes.value) {
        event.target.complete();
        event.target.disabled = true;
        return;
    }
    
    loading.value = true;
    page.value++;
    
    try {
        await obtenerComprobantes();
    } catch (error) {
        console.error("Error al cargar más comprobantes:", error);
    } finally {
        event.target.complete();
        loading.value = false;
    }
};

// Función para resetear y buscar comprobantes al cambiar filtros
const resetComprobantesYBuscar = async () => {
    page.value = 1;
    comprobantes.value = [];
    isLoading.value = true;
    await obtenerComprobantes();
};

// Función para manejar la eliminación de un comprobante
const handleComprobanteEliminado = (comprobanteId: number) => {
    comprobantes.value = comprobantes.value.filter(c => c.id !== comprobanteId);
    totalComprobantes.value--;
};

// Cargar datos iniciales
onMounted(async () => {
    isLoading.value = true;
    await getRegiones();
    await obtenerComprobantes();
});
</script>

<style scoped>
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

.no-data-icon {
  font-size: 48px;
  margin-bottom: 1rem;
  color: var(--ion-color-medium);
}
</style>