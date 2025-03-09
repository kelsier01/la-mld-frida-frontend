<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Productos</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-alert
                :is-open="isOpen"
                header="Error"
                message="Por favor, completa todos los campos."
                :buttons="['OK']"
                @didDismiss="isOpen = false"
            ></ion-alert>
            <!-- Barra de búsqueda y filtros -->
            <ion-searchbar 
                placeholder="Buscar producto" 
                show-clear-button="focus"
                class="search   bar"
            ></ion-searchbar>
            <ion-select 
                label="Filtrar por categoría" 
                interface="popover" 
                v-model="filtroCategoria"
                class="filtro"
            >
                <ion-select-option value="electronica">Electrónica</ion-select-option>
                <ion-select-option value="ropa">Ropa</ion-select-option>
                <ion-select-option value="hogar">Hogar</ion-select-option>
            </ion-select>
            <ion-select 
                label="Filtrar por bodega" 
                interface="popover" 
                v-model="filtroBodega"
                class="filtro"
            >
                <ion-select-option 
                    v-for="(bodega, index) in bodegas"
                    :key="index"
                    :value="bodega.id"
                    >{{ bodega.nombre }}
                </ion-select-option>
            </ion-select>
            <ion-select 
                label="Filtrar por marca" 
                interface="popover" 
                v-model="filtroMarca"
                class="filtro"
            >
                <ion-select-option 
                    v-for="(marca, index) in marcas"
                    :key="index"
                    :value="marca.id"
                    >{{ marca.nombre }}
                </ion-select-option>
                
            </ion-select>

            <!-- Lista de productos -->
            <ion-grid>
                <ion-row>
                    <ion-col size="12" size-md="6" size-lg="4" v-for="(producto, index) in productosFiltrados" :key="index">
                        <ProductoCard 
                            :producto="producto" 
                            @click="verDetallesProducto(producto)" 
                        />
                    </ion-col>
                </ion-row>
            </ion-grid>

            <!-- Botón FAB para agregar nuevo producto -->
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="fab-button">
                <ion-fab-button @click="abrirModalAgregar">
                    <ion-icon :icon="add"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>

        <!-- Modal para agregar nuevo producto -->
        <ion-modal :is-open="modalAgregarAbierto" @didDismiss="cerrarModalAgregar">
            <ModalAgregarProducto 
                @cerrar="cerrarModalAgregar" 
                @guardar="confirmarAgregarProducto" 
            />
        </ion-modal>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonFab,
    IonFabButton,
    IonIcon,
    IonModal,
    IonGrid,
    IonRow,
    IonCol,
    IonAlert
} from '@ionic/vue';
import { ref, computed, onBeforeMount } from 'vue';
import { add } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import ModalAgregarProducto from '@/components/AgregarProductoModal.vue'; // Asegúrate de que la ruta sea correcta
import productoService from "../../services/productoService";
import { Bodega, Marca, NuevoProducto, Producto } from '@/interfaces/interfaces';
import ProductoCard from '@/components/ProductoCard.vue';
import bodegaService from '@/services/bodegaService';
import marcaService from '@/services/marcaService';

const router = useRouter();
const productos = ref<Producto[]>([]);
const bodegas = ref<Bodega[]>([]);
const marcas = ref<Marca[]>([]);


// Obtener los productos
const obtenerProductos = async () => {
    productos.value = await productoService.getProductos();
};

const obtenerBodegas = async () => {
    bodegas.value = await bodegaService.getBodegas();
};

const obtenerMarcas = async () => {
    marcas.value = await marcaService.getMarcas();
};

// Estado del modal de agregar
const modalAgregarAbierto = ref<boolean>(false);

// Filtros
const filtroCategoria = ref<number>();
const filtroBodega = ref<number>();
const filtroMarca = ref<number>();

// Estado del alert
const isOpen = ref<boolean>(false);

// Computed para filtrar los productos
const productosFiltrados = computed(() => {
    return productos.value.filter(producto => {
        const cumpleCategoria = filtroCategoria.value ? producto.Categoria_id === filtroCategoria.value : true;
        const cumpleBodega = filtroBodega.value ? producto.bodegas.some(bodega => bodega.id === filtroBodega.value) : true;
        const cumpleMarca = filtroMarca.value ? producto.marcas_id === filtroMarca.value : true;
        return cumpleCategoria && cumpleBodega && cumpleMarca;
    });
});

// Abrir modal para agregar
const abrirModalAgregar = () => {
    modalAgregarAbierto.value = true;
};

// Cerrar modal de agregar
const cerrarModalAgregar = () => {
    modalAgregarAbierto.value = false;
};

// Confirmar agregar producto
const confirmarAgregarProducto = async(nuevoProducto: NuevoProducto) => {
    // Validar que todos los campos estén completos
    if (
        nuevoProducto.codigo.trim() !== "" &&
        nuevoProducto.nombre.trim() !== "" &&
        nuevoProducto.stock > 0
    ) {
        // Agregar el nuevo producto a la lista
        //productos.value.push({ ...nuevoProducto, tipo: filtroCategoria.value || "sin tipo" });
        //console.log("Producto agregado:", nuevoProducto);
        await productoService.postProducto(nuevoProducto);
        await obtenerProductos();
        cerrarModalAgregar();
    } else {
        isOpen.value = true;
    }
};

// Navegar a la vista de detalles del producto
const verDetallesProducto = (producto: any) => {
    router.push({ name: 'DetallesProducto', params: { id: producto.id }});
};

onBeforeMount(async() => {
    await obtenerProductos();
    await obtenerBodegas();
    await obtenerMarcas();
    console.log("Desde productoService",productos.value);
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

/* Filtros */
.filtro {
    margin-bottom: 16px;
}

/* Estilos para las tarjetas de productos */
.card-producto {
    margin-bottom: 16px;
}

.card-producto ion-card-title {
    font-size: 1.25rem;
    font-weight: bold;
}

.card-producto ion-card-content {
    font-size: 1rem;
    line-height: 1.4;
}

/* Imagen del producto */
.imagen-producto {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 12px;
}

/* Botón FAB */
.fab-button {
    margin-bottom: 24px;
}

/* Estilos para el modal */
.item-formulario {
    margin-bottom: 16px;
}
</style>