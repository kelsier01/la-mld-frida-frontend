<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cerrarModal">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Agregar Producto</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="guardarProducto">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-list>
                <!-- Campo para el código -->
                <ion-item>
                    <ion-input placeholder="Código" v-model="producto.codigo" label="Código" label-placement="stacked"></ion-input>
                </ion-item>

                <!-- Campo para el nombre -->
                <ion-item>
                    <ion-input placeholder="Nombre" v-model="producto.nombre" label="Nombre" label-placement="stacked"></ion-input>
                </ion-item>

                <!-- Campo para la cantidad -->
                <ion-item>
                    <ion-input placeholder="Stock" v-model="producto.stock" type="number" label="Stock" label-placement="stacked"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-input placeholder="Precio de venta (CLP)" v-model="producto.precioVenta" type="number" label="Precio de venta (CLP)" label-placement="stacked"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-input placeholder="Precio de compra (USD)" v-model="producto.precioCompra" type="number" label="Precio de compra (USD)" label-placement="stacked"></ion-input>
                </ion-item>

                <!-- Select para la bodega -->
                <ion-item>
                    <ion-select placeholder="Seleccione una bodega" v-model="producto.bodega" label="Bodega" label-placement="stacked">
                        <ion-select-option
                            v-for="bodega in bodegas.filter(bodega => bodega.id !== 4)"
                            :key="bodega.id"
                            :value="bodega.id"
                        >{{ bodega.nombre }}</ion-select-option>
                    </ion-select>
                </ion-item>

                <!-- Select para la marca -->
                <ion-item>
                    <ion-select placeholder="Seleccione una marca" v-model="producto.marca" label="Marca" label-placement="stacked">
                        <ion-select-option 
                            v-for="marca in marcas"
                            :key="marca.id"
                            :value="marca.id"
                        >{{ marca.nombre }}</ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-item>
                    <ion-select placeholder="Seleccione una categoria" v-model="producto.categoria" label="Categoria" label-placement="stacked">
                        <ion-select-option
                            v-for="categoria in categorias"
                            :key="categoria.id"
                            :value="categoria.id"
                        >
                            {{ categoria.nombre }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>

                <!-- Previsualización de la imagen -->
                <ion-item v-if="producto.imagen">
                    <ion-img :src="imagenPrevisualizada" alt="Previsualización de la imagen" style="max-width: 100%; height: auto; margin-bottom: 10px;" />
                    <ion-button expand="block" color="danger" @click="eliminarImagen">
                        <ion-icon :icon="trash" slot="start"></ion-icon>
                        Eliminar Imagen
                    </ion-button>
                </ion-item>

                <!-- Botón para agregar una imagen -->
                <ion-item>
                    <ion-button expand="block" @click="seleccionarImagen">
                        <ion-icon :icon="camera" slot="start"></ion-icon>
                        {{ producto.imagen ? 'Cambiar Imagen' : 'Agregar Imagen' }}
                    </ion-button>
                </ion-item>
                <ion-note>Archivos permitidos: png, jpeg, jpg y webp</ion-note>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue';
import { camera, trash } from 'ionicons/icons';
import { Bodega, Categoria, Marca, NuevoProducto,  } from '@/interfaces/interfaces';
import bodegaService from '@/services/bodegaService';
import categoriaService from '@/services/categoriaService';
import marcaService from '@/services/marcaService';

const marcas = ref<Marca[]>([]);
const categorias = ref<Categoria[]>([]);
const bodegas = ref<Bodega[]>([]);


const producto = ref<NuevoProducto>({
    codigo: '',
    nombre: '',
    stock: 0,
    precioVenta: 0,
    precioCompra: 0,
    bodega: 0,
    categoria: 0,
    marca: 0,
    imagen: '' as string | File
});

const emit = defineEmits(['cerrar', 'guardar']);

const cerrarModal = () => {
    emit('cerrar');
};

const guardarProducto = () => {
    console.log(producto.value);
    emit('guardar', producto.value);
};

const seleccionarImagen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/jpg, image/webp';
    input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            // Verificar el tipo MIME del archivo
            const fileType = file.type;
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            
            if (validTypes.includes(fileType)) {
                producto.value.imagen = file; // Almacenar el archivo si es válido
            } else {
                // Mostrar mensaje de error si el formato no es válido
                alert('Formato de imagen no válido. Por favor, seleccione una imagen en formato png, jpeg, jpg o webp.');
            }
        }
    };
    input.click();
};

const eliminarImagen = () => {
    producto.value.imagen = ''; // Eliminar la imagen seleccionada
};

// Previsualización de la imagen
const imagenPrevisualizada = computed(() => {
    if (producto.value.imagen instanceof File) {
        return URL.createObjectURL(producto.value.imagen);
    }
    return producto.value.imagen;
});

onBeforeMount(async() => {
   bodegas.value = await bodegaService.getBodegas();
   categorias.value = await categoriaService.getAllCategorias();
   marcas.value = await marcaService.getAllMarcas(); 
});
</script>