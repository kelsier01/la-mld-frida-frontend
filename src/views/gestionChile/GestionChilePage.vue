<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Gestion Chile</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-segment v-model="segmentoActivo">
                <ion-segment-button value="recepcion">
                    Recepcion
                </ion-segment-button>
                <ion-segment-button value="despacho">
                    Despacho
                </ion-segment-button>
                <ion-segment-button value="entrega">
                    Entrega
                </ion-segment-button>
            </ion-segment>
            
            <div v-if="segmentoActivo === 'recepcion'">
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonSelect label="Region" placeholder="Seleccionar">
                                    <IonSelectOption value="1">Opción 1</IonSelectOption>
                                    <IonSelectOption value="2">Opción 2</IonSelectOption>
                                    <IonSelectOption value="3">Opción 3</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                        </IonCol>
                    </IonRow>
                </IonGrid>

            
                <GuiaDespachoCard />

            </div>

            <div v-if="segmentoActivo === 'despacho'">
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonSearchbar placeholder="Buscar guía de despacho" />
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonSearchbar placeholder="Buscar pedido" />
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <GuiaDespachoCard />
            </div>

            <div v-if="segmentoActivo === 'entrega'">
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonSearchbar placeholder="Buscar guía de despacho" />
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonSearchbar placeholder="Buscar pedido" />
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <GuiaDespachoCard />
            </div>

        </ion-content>
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
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    alertController,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonListHeader,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonSearchbar
} from '@ionic/vue';
import { ref } from 'vue';
import { cardOutline, pencil, trashOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import ProductoResumenCard from '@/components/ProductoResumenCard.vue';
import GuiaDespachoCard from '@/components/GuiaDespachoCard.vue';

const router = useRouter();
const segmentoActivo = ref('recepcion'); // Control del segmento activo

// Datos del producto (simulados)
const producto = ref({
    codigo: "001",
    nombre: "Televisor 50 pulgadas",
    precioUSD: 500,
    stockPorBodega: { "Bodega 1": 10, "Bodega 2": 5 },
    tipo: "electrónica",
    marca: "Sony",
});

// Modal de edición
const modalEditarAbierto = ref(false);
const productoEditado = ref({ ...producto.value });

const abrirModalEditar = () => {
    productoEditado.value = { ...producto.value };
    modalEditarAbierto.value = true;
};

const cerrarModalEditar = () => {
    modalEditarAbierto.value = false;
};

const guardarCambios = () => {
    producto.value = { ...productoEditado.value };
    cerrarModalEditar();
};

// Modal de edición de stock
const modalEditarStockAbierto = ref(false);
const bodegaEditada = ref("");
const stockEditado = ref({ cantidad: 0 });

const abrirModalEditarStock = (bodega: string) => {
    bodegaEditada.value = bodega;
    stockEditado.value.cantidad = producto.value.stockPorBodega[bodega];
    modalEditarStockAbierto.value = true;
};

const cerrarModalEditarStock = () => {
    modalEditarStockAbierto.value = false;
};

const guardarCambiosStock = () => {
    producto.value.stockPorBodega[bodegaEditada.value] = stockEditado.value.cantidad;
    cerrarModalEditarStock();
};

// Confirmación y eliminación de stock
const confirmarEliminarStock = async (bodega: string) => {
    const alert = await alertController.create({
        header: 'Eliminar Stock',
        message: `¿Estás seguro de eliminar el stock de ${bodega}?`,
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', handler: () => eliminarStock(bodega) }
        ],
    });
    await alert.present();
};

const eliminarStock = (bodega: string) => {
    delete producto.value.stockPorBodega[bodega];
};

// Confirmación y eliminación del producto
const confirmarEliminarProducto = async () => {
    const alert = await alertController.create({
        header: 'Eliminar Producto',
        message: '¿Estás seguro de eliminar este producto?',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', handler: eliminarProducto }
        ],
    });
    await alert.present();
};

const eliminarProducto = () => {
    console.log("Producto eliminado:", producto.value);
    router.push({ name: 'Productos' });
};
</script>

<style scoped>
/* Estilos personalizados si es necesario */
ion-card-header {
  padding-bottom: 8px; /* Reducir el espacio inferior del encabezado */
}

ion-card-title {
  display: flex;
  align-items: center;
  justify-content: left;
  font-size: 1.5rem;
  font-weight: bold;
  gap: 8px; /* Espacio entre el ícono y el texto */
}

ion-icon {
  font-size: 1.5rem;
  color: var(--ion-color-primary); /* Color del ícono */
}

ion-card-content {
  padding-top: 8px; /* Reducir el espacio superior del contenido */
}
</style>
