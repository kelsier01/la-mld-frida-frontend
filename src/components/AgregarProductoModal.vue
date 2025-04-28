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
        <ion-item >
          <ion-input
            placeholder="Código"
            v-model="producto.codigo"
            label="Código"
            label-placement="stacked"
          ></ion-input>
        </ion-item>

        <!-- Campo para el nombre -->
        <ion-item>
          <ion-input
            placeholder="Nombre"
            v-model="producto.nombre"
            label="Nombre"
            label-placement="stacked"
          ></ion-input>
        </ion-item>

        <!-- Campo para la cantidad -->
        <ion-item>
          <ion-input
            placeholder="Stock"
            v-model="producto.stock"
            type="number"
            label="Stock"
            label-placement="stacked"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            placeholder="Precio de venta (CLP)"
            v-model="precioVentaFormateado"
            type="text"
            label="Precio de venta (CLP)"
            label-placement="stacked"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            placeholder="Precio de compra (USD)"
            v-model="precioCompraFormateado"
            type="text"
            label="Precio de compra (USD)"
            label-placement="stacked"
          ></ion-input>
        </ion-item>

        <!-- Select para la bodega -->
        <ion-item>
          <ion-select
            placeholder="Seleccione una bodega"
            v-model="producto.bodega"
            label="Bodega"
            label-placement="stacked"
          >
            <ion-select-option
              v-for="bodega in bodegas.filter((bodega) => bodega.id !== 4)"
              :key="bodega.id"
              :value="bodega.id"
              >{{ bodega.nombre }}</ion-select-option
            >
          </ion-select>
        </ion-item>

        <!-- Select para la marca -->
        <ion-item>
          <ion-select
            placeholder="Seleccione una marca"
            v-model="producto.marca"
            label="Marca"
            label-placement="stacked"
          >
            <ion-select-option
              v-for="marca in marcas"
              :key="marca.id"
              :value="marca.id"
              >{{ marca.nombre }}</ion-select-option
            >
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-select
            placeholder="Seleccione una categoria"
            v-model="producto.categoria"
            label="Categoria"
            label-placement="stacked"
          >
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
          <ion-grid>
            <ion-col>
              <ion-row>
                <ion-img
                  :src="imagenPrevisualizada"
                  alt="Previsualización de la imagen"
                  style="max-width: 100%; height: auto; margin-bottom: 10px"
                />
              </ion-row>
              <ion-row>
                <ion-button expand="block" color="danger" @click="eliminarImagen">
                  <ion-icon :icon="trash" slot="start"></ion-icon>
                  Eliminar Imagen
                </ion-button>
              </ion-row>
            </ion-col>
          </ion-grid>
          
        </ion-item>

        <!-- Botón para agregar una imagen -->
        <ion-item>
          <ion-button expand="block" @click="seleccionarImagen">
            <ion-icon :icon="camera" slot="start"></ion-icon>
            {{ producto.imagen ? "Cambiar Imagen" : "Agregar Imagen" }}
          </ion-button>
          <ion-button expand="block" color="warning" @click="tomarFoto">
            <ion-icon :icon="camera" slot="start"></ion-icon>
            Tomar Foto
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
  <!-- Agregar antes del cierre de ion-page -->
  <ion-toast
    :is-open="mostrarError"
    :message="errorMensaje"
    :duration="3000"
    color="danger"
    position="bottom"
    @didDismiss="mostrarError = false"
  ></ion-toast>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from "vue";
import { camera, trash } from "ionicons/icons";
import {
  Bodega,
  Categoria,
  Marca,
  NuevoProducto,
} from "@/interfaces/interfaces";
import bodegaService from "@/services/bodegaService";
import categoriaService from "@/services/categoriaService";
import marcaService from "@/services/marcaService";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// Primero importamos las funciones de formato
import { formatoCLP } from '@/utilities/useDineroFormato';

const errorMensaje = ref<string>("");
const mostrarError = ref<boolean>(false);
const marcas = ref<Marca[]>([]);
const categorias = ref<Categoria[]>([]);
const bodegas = ref<Bodega[]>([]);
const producto = ref<NuevoProducto>({
  codigo: "",
  nombre: "",
  stock: null,
  precioVenta: null,
  precioCompra: null,
  bodega: 0,
  categoria: 0,
  marca: 0,
  imagen: "" as string | File,
});
const emit = defineEmits(["cerrar", "guardar"]);
const cerrarModal = () => {
  emit("cerrar");
};

const validarCampos = (): boolean => {
  if (!producto.value.codigo?.trim()) {
    errorMensaje.value = "El código es obligatorio";
    return false;
  }
  if (!producto.value.nombre?.trim()) {
    errorMensaje.value = "El nombre es obligatorio";
    return false;
  }
  if (!producto.value.stock || producto.value.stock < 0) {
    errorMensaje.value = "El stock debe ser mayor o igual a 0";
    return false;
  }
  if (!producto.value.precioVenta || producto.value.precioVenta <= 0) {
    errorMensaje.value = "El precio de venta debe ser mayor a 0";
    return false;
  }
  if (!producto.value.precioCompra || producto.value.precioCompra <= 0) {
    errorMensaje.value = "El precio de compra debe ser mayor a 0";
    return false;
  }
  if (!producto.value.bodega) {
    errorMensaje.value = "Debe seleccionar una bodega";
    return false;
  }
  if (!producto.value.marca) {
    errorMensaje.value = "Debe seleccionar una marca";
    return false;
  }
  if (!producto.value.categoria) {
    errorMensaje.value = "Debe seleccionar una categoría";
    return false;
  }
  if (!producto.value.imagen) {
    errorMensaje.value = "Debe agregar una imagen del producto";
    return false;
  }
  return true;
};


const guardarProducto = () => {
  if (!validarCampos()) {
    mostrarError.value = true;
    return;
  }
  console.log(producto.value);
  emit("guardar", producto.value);
};

const seleccionarImagen = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png, image/jpeg, image/jpg, image/webp";
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Verificar el tipo MIME del archivo
      const fileType = file.type;
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

      if (validTypes.includes(fileType)) {
        producto.value.imagen = file; // Almacenar el archivo si es válido
      } else {
        // Mostrar mensaje de error si el formato no es válido
        alert(
          "Formato de imagen no válido. Por favor, seleccione una imagen en formato png, jpeg, jpg o webp."
        );
      }
    }
  };
  input.click();
};

const eliminarImagen = () => {
  producto.value.imagen = ""; // Eliminar la imagen seleccionada
};

// Previsualización de la imagen
const imagenPrevisualizada = computed(() => {
  if (producto.value.imagen instanceof File) {
    return URL.createObjectURL(producto.value.imagen);
  }
  return producto.value.imagen;
});

onBeforeMount(async () => {
  bodegas.value = await bodegaService.getBodegas();
  categorias.value = await categoriaService.getAllCategorias();
  marcas.value = await marcaService.getAllMarcas();
});

const tomarFoto = async () => {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    if (photo.dataUrl) {
      producto.value.imagen = photo.dataUrl;
    } else {
      console.error("Error: La foto no contiene un dataUrl válido.");
    }
  } catch (error) {
    // El usuario puede cancelar la cámara
    console.log('Captura cancelada o error:', error);
  }
};

// Agregar después de las referencias existentes
const precioVentaFormateado = computed({
  get: () => {
    return producto.value.precioVenta ? formatoCLP(producto.value.precioVenta) : '';
  },
  set: (value: string) => {
    // Eliminar puntos y convertir a número
    producto.value.precioVenta = Number(value.replace(/\./g, ''));
  }
});

const precioCompraFormateado = computed({
  get: () => {
    return producto.value.precioCompra ? producto.value.precioCompra.toLocaleString('en-US') : '';
  },
  set: (value: string) => {
    // Eliminar puntos, comas y convertir a número
    producto.value.precioCompra = Number(value.replace(/,/g, ''));
  }
});
</script>

<style scoped>
/* Fondo y bordes suaves para el formulario */
ion-list {
  background: var(--ion-background-color, #fff);
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.07);
  padding: 18px 10px;
  margin-top: 18px;
}

/* Inputs minimalistas */
ion-item {
  --background: transparent;
  --border-color: var(--ion-color-medium, #d1d1d1);
  --border-radius: 12px;
  margin-bottom: 14px;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.03);
}

ion-input, ion-select {
  --color: var(--ion-text-color, #222);
  --placeholder-color: var(--ion-color-medium, #aaa);
  font-size: 1rem;
  padding-left: 2px;
}

ion-input[aria-invalid="true"] {
  --highlight-color-focused: var(--ion-color-danger, #eb445a);
}

ion-select {
  --placeholder-color: var(--ion-color-medium, #aaa);
}

ion-label {
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ion-color-step-600, #666);
}

ion-button {
  --border-radius: 10px;
  --box-shadow: none;
  font-weight: 600;
  letter-spacing: 0.02em;
}

ion-button[color="danger"] {
  margin-top: 8px;
}

ion-img {
  border-radius: 12px;
  border: 1px solid var(--ion-color-light, #eee);
  margin-bottom: 8px;
  background: var(--ion-color-light, #f8f8f8);
}

/* Modo oscuro */
:host-context(.dark), :root.ion-color-scheme-dark & {
  ion-list {
    background: var(--ion-background-color, #181818);
    box-shadow: 0 4px 24px 0 rgba(0,0,0,0.25);
  }
  ion-item {
    --background: rgba(40,40,40,0.7);
    --border-color: var(--ion-color-step-150, #333);
    box-shadow: 0 1px 4px 0 rgba(0,0,0,0.10);
  }
  ion-label, ion-input, ion-select {
    --color: var(--ion-color-light, #f4f4f4);
    --placeholder-color: var(--ion-color-medium, #aaa);
  }
  ion-img {
    border: 1px solid var(--ion-color-step-150, #333);
    background: var(--ion-color-step-200, #222);
  }
}

/* Ajuste para el botón de imagen */
ion-item:last-child {
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  box-shadow: none;
  border: none;
  margin-bottom: 0;
}
</style>
