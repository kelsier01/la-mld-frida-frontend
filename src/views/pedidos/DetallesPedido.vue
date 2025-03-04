<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        default-href="/pedidos"
                        text="Volver"
                    ></ion-back-button>
                </ion-buttons>
                <ion-title>Detalles del Pedido</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="abrirModalEditar">
                        <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="confirmarEliminarProducto" color="danger">
                        <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-segment v-model="segmentoActivo">
                <ion-segment-button value="detalles">
                    Detalles
                </ion-segment-button>
                <ion-segment-button value="abonos">
                    Abonos
                </ion-segment-button>
            </ion-segment>
            
            <div v-if="segmentoActivo === 'detalles'">
                <ion-list>
                    <ion-list-header>
                        Detalles del Pedido
                    </ion-list-header>
                    <ion-item>
                        <ion-label>Cliente</ion-label>
                        <ion-text color="dark">Ana Maria</ion-text>
                    </ion-item>
                    <ion-item>
                        <ion-label>Direccion</ion-label>
                        <ion-text color="dark">Calle 123, Ciudad</ion-text>
                    </ion-item>
                    <ion-item>
                        <ion-label>Email</ion-label>
                        <ion-text color="dark">ana.maria@gmail.com</ion-text>
                    </ion-item>
                    <ion-item>
                        <ion-label>Telefono</ion-label>
                        <ion-text color="dark">1234567890</ion-text>
                    </ion-item>
                    <ion-item>
                        <ion-label>Estado del Pedido</ion-label>
                        <ion-chip color="success">Enviado</ion-chip>
                    </ion-item>
                </ion-list>
                <ion-list>
                    <ion-list-header>
                        Historial del Pedido
                    </ion-list-header>
                    <ion-item>
                        <ion-label>2021-10-01</ion-label>
                        <ion-chip color="success">Enviado</ion-chip>
                    </ion-item>
                    <ion-item>
                        <ion-label>2021-10-01</ion-label>
                        <ion-chip color="warning">Enviado</ion-chip>
                    </ion-item>
                    <ion-item>
                        <ion-label>2021-10-01</ion-label>
                        <ion-chip color="danger">Enviado</ion-chip>
                    </ion-item>
                    <ion-item>
                        <ion-label>2021-10-01</ion-label>
                        <ion-chip color="success">Enviado</ion-chip>
                    </ion-item>
                </ion-list>
                <ProductoResumenCard />
            </div>

            <div v-if="segmentoActivo === 'abonos'">
                <ion-card>
                    <ion-card-header>
                    <ion-card-title>
                        <ion-icon :icon="cardOutline"></ion-icon>
                        Total Pedido
                    </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                    <ion-text color="primary">
                        <h1>$1000</h1>
                    </ion-text>
                    </ion-card-content>
                </ion-card>

                <ion-card>
                    <ion-card-header>
                    <ion-card-title>
                        <ion-icon :icon="cardOutline"></ion-icon>
                        Total Abono
                    </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                    <ion-text color="primary">
                        <h1>$100</h1>
                    </ion-text>
                    </ion-card-content>
                </ion-card>

                <ion-card>
                    <ion-card-header>
                    <ion-card-title>
                        <ion-icon :icon="cardOutline"></ion-icon>
                        Saldo Pendiente
                    </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                    <ion-text color="primary">
                        <h1>$100</h1>
                    </ion-text>
                    </ion-card-content>
                </ion-card>

                <ion-grid>
                    <ion-row>
                        <ion-col size="12">
                            <ion-item>
                                <ion-select label="Metodo de Pago">
                                    <ion-select-option value="1">Efectivo</ion-select-option>
                                    <ion-select-option value="2">Credito</ion-select-option>
                                </ion-select>
                            </ion-item>
                        </ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="6">
                            <ion-item>
                                <ion-input type="number" label="Monto Abono" label-placement="stacked"></ion-input>
                            </ion-item>
                        </ion-col>
                        <ion-col size="6">
                            <ion-button expand="full">Abonar</ion-button>
                        </ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="12">
                            <ion-list>
                                <ion-list-header>
                                    Historial de Abonos
                                </ion-list-header>
                                <ion-item>
                                    <ion-label>2021-10-01</ion-label>
                                    <ion-text color="success">10000</ion-text>
                                </ion-item>
                                <ion-item>
                                    <ion-label>2021-10-01</ion-label>
                                    <ion-text color="success">5000</ion-text>
                                </ion-item>
                                <ion-item>
                                    <ion-label>2021-10-01</ion-label>
                                    <ion-text color="success">400</ion-text>
                                </ion-item>
                            </ion-list>
                        </ion-col>
                    </ion-row>
                </ion-grid>
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
    IonInput
} from '@ionic/vue';
import { ref } from 'vue';
import { cardOutline, pencil, trashOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import ProductoResumenCard from '@/components/ProductoResumenCard.vue';

const router = useRouter();
const segmentoActivo = ref('detalles'); // Control del segmento activo

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
