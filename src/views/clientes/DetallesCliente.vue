<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        default-href="/clientes"
                        text="Volver"
                    ></ion-back-button>
                </ion-buttons>
                <ion-title>Detalles del Cliente</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="abrirModalEditar">
                        <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="confirmarEliminarCliente" color="danger">
                        <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-item>
                <ion-label>
                    <h2>Nombre del Cliente</h2>
                    <p>{{ cliente.nombre }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>RUT</h2>
                    <p>{{ cliente.rut }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Teléfono</h2>
                    <p>{{ cliente.telefono }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Instagram</h2>
                    <p>{{ cliente.instagram }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Mail</h2>
                    <p>{{ cliente.mail }}</p>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <h2>Direcciones</h2>
                    <ion-list>
                        <ion-item v-for="(direccion, index) in cliente.direcciones" :key="index">
                            <p>{{ direccion.region }}, {{ direccion.comuna }}, {{ direccion.direccion }}</p>
                            <ion-buttons slot="end">
                                <ion-button @click="abrirModalEditarDireccion(index)">
                                    <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
                                </ion-button>
                                <ion-button @click="confirmarEliminarDireccion(index)" color="danger">
                                    <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                                </ion-button>
                            </ion-buttons>
                        </ion-item>
                    </ion-list>
                    <ion-button @click="abrirModalAgregarDireccion">Agregar Dirección</ion-button>
                </ion-label>
            </ion-item>
        </ion-content>

        <!-- Modal para editar cliente -->
        <ion-modal :is-open="modalEditarAbierto" @didDismiss="cerrarModalEditar">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Editar Cliente</ion-title>
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
                        v-model="clienteEditado.nombre"
                        type="text"
                        label="Nombre del Cliente"
                        label-placement="stacked"
                        placeholder="Ingrese el nombre del cliente"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="clienteEditado.rut"
                        type="text"
                        label="RUT"
                        label-placement="stacked"
                        placeholder="Ingrese el RUT"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="clienteEditado.telefono"
                        type="text"
                        label="Teléfono"
                        label-placement="stacked"
                        placeholder="Ingrese el teléfono"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="clienteEditado.instagram"
                        type="text"
                        label="Instagram"
                        label-placement="stacked"
                        placeholder="Ingrese el Instagram"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="clienteEditado.mail"
                        type="text"
                        label="Mail"
                        label-placement="stacked"
                        placeholder="Ingrese el mail"
                    ></ion-input>
                </ion-item>
            </ion-content>
        </ion-modal>

        <!-- Modal para agregar dirección -->
        <ion-modal :is-open="modalAgregarDireccionAbierto" @didDismiss="cerrarModalAgregarDireccion">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Agregar Dirección</ion-title>
                    <ion-buttons slot="start">
                        <ion-button @click="cerrarModalAgregarDireccion">Cancelar</ion-button>
                    </ion-buttons>
                    <ion-buttons slot="end">
                        <ion-button @click="agregarDireccion">Agregar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-item>
                    <ion-select
                        v-model="nuevaDireccion.region"
                        label="Región"
                        label-placement="stacked"
                        placeholder="Seleccione la región"
                    >
                        <ion-select-option 
                            v-for="region in regionesChile" 
                            :key="region.nombre" 
                            :value="region.nombre"
                        >
                            {{ region.nombre }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select
                        v-model="nuevaDireccion.comuna"
                        label="Comuna"
                        label-placement="stacked"
                        placeholder="Seleccione la comuna"
                        :disabled="!nuevaDireccion.region"
                    >
                        <ion-select-option 
                            v-for="comuna in comunasPorRegion(nuevaDireccion.region)" 
                            :key="comuna" 
                            :value="comuna"
                        >
                            {{ comuna }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="nuevaDireccion.direccion"
                        type="text"
                        label="Dirección"
                        label-placement="stacked"
                        placeholder="Ingrese la dirección"
                    ></ion-input>
                </ion-item>
            </ion-content>
        </ion-modal>

        <!-- Modal para editar dirección -->
        <ion-modal :is-open="modalEditarDireccionAbierto" @didDismiss="cerrarModalEditarDireccion">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Editar Dirección</ion-title>
                    <ion-buttons slot="start">
                        <ion-button @click="cerrarModalEditarDireccion">Cancelar</ion-button>
                    </ion-buttons>
                    <ion-buttons slot="end">
                        <ion-button @click="guardarCambiosDireccion">Guardar</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-item>
                    <ion-select
                        v-model="direccionEditada.region"
                        label="Región"
                        label-placement="stacked"
                        placeholder="Seleccione la región"
                    >
                        <ion-select-option 
                            v-for="region in regionesChile" 
                            :key="region.nombre" 
                            :value="region.nombre"
                        >
                            {{ region.nombre }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select
                        v-model="direccionEditada.comuna"
                        label="Comuna"
                        label-placement="stacked"
                        placeholder="Seleccione la comuna"
                        :disabled="!direccionEditada.region"
                    >
                        <ion-select-option 
                            v-for="comuna in comunasPorRegion(direccionEditada.region)" 
                            :key="comuna" 
                            :value="comuna"
                        >
                            {{ comuna }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input
                        v-model="direccionEditada.direccion"
                        type="text"
                        label="Dirección"
                        label-placement="stacked"
                        placeholder="Ingrese la dirección"
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
import { ref } from 'vue';
import { pencil, trashOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

// Datos del cliente (simulados)
const cliente = ref({
    nombre: "Juan Pérez",
    rut: "12.345.678-9",
    telefono: "+56912345678",
    instagram: "@juanperez",
    mail: "juan.perez@example.com",
    direcciones: [
        { region: "Arica y Parinacota", comuna: "Arica", direccion: "Calle Falsa 123" },
    ],
});

// Datos de regiones y comunas de Chile (ejemplo con Arica y Parinacota)
const regionesChile = ref([
    {
        nombre: "Arica y Parinacota",
        comunas: ["Arica", "Camarones", "Putre", "General Lagos"],
    },
    // Puedes agregar más regiones y comunas aquí
]);

// Obtener comunas por región
const comunasPorRegion = (region: string) => {
    const regionEncontrada = regionesChile.value.find(r => r.nombre === region);
    return regionEncontrada ? regionEncontrada.comunas : [];
};

// Estado del modal de edición
const modalEditarAbierto = ref(false);

// Datos editados del cliente
const clienteEditado = ref({ ...cliente.value });

// Abrir modal de edición
const abrirModalEditar = () => {
    clienteEditado.value = { ...cliente.value }; // Copiar datos actuales
    modalEditarAbierto.value = true;
};

// Cerrar modal de edición
const cerrarModalEditar = () => {
    modalEditarAbierto.value = false;
};

// Guardar cambios en la edición
const guardarCambios = () => {
    cliente.value = { ...clienteEditado.value }; // Actualizar datos del cliente
    cerrarModalEditar();
};

// Estado del modal para agregar dirección
const modalAgregarDireccionAbierto = ref(false);

// Datos de la nueva dirección
const nuevaDireccion = ref({
    region: "",
    comuna: "",
    direccion: "",
});

// Abrir modal para agregar dirección
const abrirModalAgregarDireccion = () => {
    nuevaDireccion.value = { region: "", comuna: "", direccion: "" }; // Reiniciar datos
    modalAgregarDireccionAbierto.value = true;
};

// Cerrar modal para agregar dirección
const cerrarModalAgregarDireccion = () => {
    modalAgregarDireccionAbierto.value = false;
};

// Agregar dirección al cliente
const agregarDireccion = () => {
    cliente.value.direcciones.push({ ...nuevaDireccion.value }); // Agregar nueva dirección
    cerrarModalAgregarDireccion();
};

// Estado del modal para editar dirección
const modalEditarDireccionAbierto = ref(false);

// Índice de la dirección seleccionada para editar
const indiceDireccionEditada = ref<number | null>(null);

// Datos de la dirección editada
const direccionEditada = ref({
    region: "",
    comuna: "",
    direccion: "",
});

// Abrir modal para editar dirección
const abrirModalEditarDireccion = (index: number) => {
    indiceDireccionEditada.value = index; // Guardar el índice de la dirección
    direccionEditada.value = { ...cliente.value.direcciones[index] }; // Copiar datos actuales
    modalEditarDireccionAbierto.value = true;
};

// Cerrar modal para editar dirección
const cerrarModalEditarDireccion = () => {
    modalEditarDireccionAbierto.value = false;
};

// Guardar cambios en la dirección editada
const guardarCambiosDireccion = () => {
    if (indiceDireccionEditada.value !== null) {
        cliente.value.direcciones[indiceDireccionEditada.value] = { ...direccionEditada.value }; // Actualizar dirección
    }
    cerrarModalEditarDireccion();
};

// Confirmar eliminación de una dirección
const confirmarEliminarDireccion = async (index: number) => {
    const alert = await alertController.create({
        header: 'Eliminar Dirección',
        message: '¿Estás seguro de que deseas eliminar esta dirección?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: 'Eliminar',
                handler: () => {
                    eliminarDireccion(index);
                },
            },
        ],
    });

    await alert.present();
};

// Eliminar dirección
const eliminarDireccion = (index: number) => {
    cliente.value.direcciones.splice(index, 1); // Eliminar la dirección
};

// Confirmar eliminación del cliente
const confirmarEliminarCliente = async () => {
    const alert = await alertController.create({
        header: 'Eliminar Cliente',
        message: '¿Estás seguro de que deseas eliminar este cliente?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: 'Eliminar',
                handler: () => {
                    eliminarCliente();
                },
            },
        ],
    });

    await alert.present();
};

// Eliminar cliente
const eliminarCliente = () => {
    // Aquí puedes agregar la lógica para eliminar el cliente (por ejemplo, enviar una solicitud a una API)
    console.log("Cliente eliminado:", cliente.value);
    router.push({ name: 'Clientes' }); // Redirigir a la lista de clientes
};
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>