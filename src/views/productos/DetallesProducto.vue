<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        default-href="/productos"
                        text="Volver"
                    ></ion-back-button>
                </ion-buttons>
                <ion-title>Detalles del Producto</ion-title>
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
            <ion-item>
                <ion-label>
                    <h2>Código</h2>
                    <p>{{ producto?.codigo }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Nombre</h2>
                    <p>{{ producto?.nombre }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Precio de compra (USD)</h2>
                    <p>${{ producto?.Precio_compra_usd }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Precio de venta (CLP)</h2>
                    <p>${{ producto?.precio_venta }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Marca</h2>
                    <p>{{ producto?.marca.nombre }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Categoria</h2>
                    <p>{{ producto?.categoria.nombre }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Stock por Bodega</h2>
                    <ion-list>
                        <ion-item v-for="(bodega) in producto?.bodegas" :key="bodega">
                            <p>{{ bodega.bodega.nombre }}: {{ bodega.stock }}</p>
                            <ion-buttons slot="end">
                                <ion-button @click="abrirModalEditarStock(bodega.bodegas_id)">
                                    <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
                                </ion-button>
                                <ion-button @click="confirmarEliminarStock(bodega.bodegas_id)" color="danger">
                                    <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                                </ion-button>
                            </ion-buttons>
                        </ion-item>
                    </ion-list>
                    <ion-button @click="abrirModalAgregarStock">Agregar Stock</ion-button>
                </ion-label>
            </ion-item>
        </ion-content>

        <!-- Modal para editar producto -->
        <ion-modal :is-open="modalEditarAbierto" @didDismiss="cerrarModalEditar">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Editar Producto</ion-title>
                    <ion-buttons slot="start">
                        <ion-button @click="cerrarModalEditar">Cancelar</ion-button>
                    </ion-buttons>
                    <ion-buttons slot="end">
                        <ion-button @click="guardarCambios">Guardar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-item>
                    <ion-input
                        v-model="productoEditado.codigo"
                        type="text"
                        label="Código"
                        label-placement="stacked"
                        placeholder="Ingrese el código"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="productoEditado.nombre"
                        type="text"
                        label="Nombre"
                        label-placement="stacked"
                        placeholder="Ingrese el nombre"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="productoEditado.Precio_compra_usd"
                        type="number"
                        label="Precio (USD)"
                        label-placement="stacked"
                        placeholder="Ingrese el precio"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select
                        v-model="productoEditado.categoria"
                        label="Tipo de Producto"
                        label-placement="stacked"
                        placeholder="Seleccione el tipo"
                    >
                        <ion-select-option value="electronica">Electrónica</ion-select-option>
                        <ion-select-option value="ropa">Ropa</ion-select-option>
                        <ion-select-option value="hogar">Hogar</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select
                        v-model="productoEditado.marca"
                        label="Marca"
                        label-placement="stacked"
                        placeholder="Seleccione la marca"
                    >
                        <ion-select-option value="sony">Sony</ion-select-option>
                        <ion-select-option value="samsung">Samsung</ion-select-option>
                        <ion-select-option value="lg">LG</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-content>
        </ion-modal>

        <!-- Modal para agregar stock -->
        <ion-modal :is-open="modalAgregarStockAbierto" @didDismiss="cerrarModalAgregarStock">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Agregar Stock</ion-title>
                    <ion-buttons slot="start">
                        <ion-button @click="cerrarModalAgregarStock">Cancelar</ion-button>
                    </ion-buttons>
                    <ion-buttons slot="end">
                        <ion-button @click="agregarStock">Guardar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-item>
                    <ion-select
                        v-model="nuevoStock.bodega"
                        label="Bodega"
                        label-placement="stacked"
                        placeholder="Seleccione la bodega"
                    >
                        <ion-select-option value="bodega1">Bodega 1</ion-select-option>
                        <ion-select-option value="bodega2">Bodega 2</ion-select-option>
                        <ion-select-option value="bodega3">Bodega 3</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="nuevoStock.cantidad"
                        type="number"
                        label="Cantidad"
                        label-placement="stacked"
                        placeholder="Ingrese la cantidad"
                    ></ion-input>
                </ion-item>
            </ion-content>
        </ion-modal>

        <!-- Modal para editar stock -->
        <ion-modal :is-open="modalEditarStockAbierto" @didDismiss="cerrarModalEditarStock">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Editar Stock</ion-title>
                    <ion-buttons slot="start">
                        <ion-button @click="cerrarModalEditarStock">Cancelar</ion-button>
                    </ion-buttons>
                    <ion-buttons slot="end">
                        <ion-button @click="guardarCambiosStock">Guardar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-item>
                    <ion-input
                        v-model="stockEditado.cantidad"
                        type="number"
                        label="Cantidad"
                        label-placement="stacked"
                        placeholder="Ingrese la cantidad"
                    ></ion-input>
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
    IonBackButton,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonModal,
    IonInput,
    IonList,
    alertController,
    IonSelect,
    IonSelectOption,
} from '@ionic/vue';
import { pencil, trashOutline } from 'ionicons/icons';
import { onBeforeMount, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Producto } from '@/interfaces/interfaces';
import productoService from '@/services/productoService';

const router = useRouter();
const route = useRoute();

// ID del producto
const id = route.params.id as string;

// Productos
const producto = ref<Producto>();
const getProductoById = async (id: string) => {
    producto.value = await productoService.getProductoById(id);
};

// Estado del modal de edición
const modalEditarAbierto = ref<boolean>(false);

// Datos editados del producto
const productoEditado = ref({ ...producto.value });

// Abrir modal de edición
const abrirModalEditar = () => {
    productoEditado.value = { ...producto.value }; // Copiar datos actuales
    modalEditarAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModalEditar = () => {
    modalEditarAbierto.value = false;
};

// Guardar cambios en la edición
const guardarCambios = () => {
    producto.value = { ...productoEditado.value }; // Actualizar datos del producto
    cerrarModalEditar();
};

// Estado del modal para agregar stock
const modalAgregarStockAbierto = ref(false);

// Datos del nuevo stock
const nuevoStock = ref({
    bodega: "",
    cantidad: 0,
});

// Abrir modal para agregar stock
const abrirModalAgregarStock = () => {
    nuevoStock.value = { bodega: "", cantidad: 0 }; // Reiniciar datos
    modalAgregarStockAbierto.value = true;
};

// Cerrar modal para agregar stock
const cerrarModalAgregarStock = () => {
    modalAgregarStockAbierto.value = false;
};

// Agregar stock al producto
const agregarStock = () => {
    producto.value.stockPorBodega[nuevoStock.value.bodega] = nuevoStock.value.cantidad; // Agregar nuevo stock
    cerrarModalAgregarStock();
};

// Estado del modal para editar stock
const modalEditarStockAbierto = ref(false);

// Bodega seleccionada para editar stock
const bodegaEditada = ref("");

// Datos del stock editado
const stockEditado = ref({
    cantidad: 0,
});

// Abrir modal para editar stock
const abrirModalEditarStock = (bodega: string) => {
    bodegaEditada.value = bodega; // Guardar la bodega seleccionada
    stockEditado.value.cantidad = producto.value.stockPorBodega[bodega]; // Copiar datos actuales
    modalEditarStockAbierto.value = true;
};

// Cerrar modal para editar stock
const cerrarModalEditarStock = () => {
    modalEditarStockAbierto.value = false;
};

// Guardar cambios en el stock editado
const guardarCambiosStock = () => {
    producto.value.stockPorBodega[bodegaEditada.value] = stockEditado.value.cantidad; // Actualizar stock
    cerrarModalEditarStock();
};

// Confirmar eliminación de stock
const confirmarEliminarStock = async (bodega: string) => {
    const alert = await alertController.create({
        header: 'Eliminar Stock',
        message: '¿Estás seguro de que deseas eliminar el stock de esta bodega?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: 'Eliminar',
                handler: () => {
                    eliminarStock(bodega);
                },
            },
        ],
    });

    await alert.present();
};

// Eliminar stock
const eliminarStock = (bodega: string) => {
    delete producto.value.stockPorBodega[bodega]; // Eliminar el stock de la bodega
};

// Confirmar eliminación del producto
const confirmarEliminarProducto = async () => {
    const alert = await alertController.create({
        header: 'Eliminar Producto',
        message: '¿Estás seguro de que deseas eliminar este producto?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: 'Eliminar',
                handler: () => {
                    eliminarProducto();
                },
            },
        ],
    });

    await alert.present();
};

// Eliminar producto
const eliminarProducto = () => {
    // Aquí puedes agregar la lógica para eliminar el producto (por ejemplo, enviar una solicitud a una API)
    console.log("Producto eliminado:", producto.value);
    router.push({ name: 'Productos' }); // Redirigir a la lista de productos
};

onBeforeMount(()=>{
    // Cargar los productos
    getProductoById(id);
});
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>