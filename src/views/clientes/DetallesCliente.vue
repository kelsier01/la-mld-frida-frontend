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
            <ion-list>
                <ion-item>
                    <ion-label>
                        <h2>Nombre del Cliente</h2>
                        <p>{{ cliente?.persona?.nombre }}</p>
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        <h2>RUT</h2>
                        <p>{{ cliente?.persona?.n_identificacion }}</p>
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        <h2>Teléfono</h2>
                        <p>{{ cliente?.persona?.fono}}</p>
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        <h2>Instagram</h2>
                        <p>{{ cliente?.cta_instagram || "N/D" }}</p>
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        <h2>Mail</h2>
                        <p>{{ cliente?.persona?.correo }}</p>
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        <h2>Direcciones</h2>
                        <ion-list>
                            <ion-item v-for="(direccion, index) in cliente?.Direccions" :key="index">
                                <p>{{ direccion.Region.nombre }}, {{ direccion.Comuna.nombre }}, {{ direccion.direccion }}</p>
                                <ion-buttons slot="end">
                                    <ion-button @click="abrirModalEditarDireccion(index)">
                                        <ion-icon :icon="pencil" slot="icon-only"/>
                                    </ion-button>
                                    <ion-button @click="confirmarEliminarDireccion(index)" color="danger">
                                        <ion-icon :icon="trashOutline" slot="icon-only"/>
                                    </ion-button>
                                </ion-buttons>
                            </ion-item>
                        </ion-list>
                        <ion-button @click="abrirModalAgregarDireccion">Agregar Dirección</ion-button>
                    </ion-label>
                </ion-item>
            </ion-list>  
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
                        v-model="clienteEditado"
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
                        v-model="nuevaDireccion.region_id"
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
                        v-model="nuevaDireccion.comuna_id"
                        label="Comuna"
                        label-placement="stacked"
                        placeholder="Seleccione la comuna"
                        :disabled="!nuevaDireccion.region_id"
                    >
                        <ion-select-option 
                            v-for="comuna in comunasChile" 
                            :key="comuna.id" 
                            :value="comuna.id"
                        >
                            {{ comuna.nombre }}
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
                        v-model="direccionEditada.region_id"
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
                        v-model="direccionEditada.comuna_id"
                        label="Comuna"
                        label-placement="stacked"
                        placeholder="Seleccione la comuna"
                        :disabled="!direccionEditada?.Region"
                    >
                        <ion-select-option 
                            v-for="comuna in comunasPorRegion(direccionEditada.region_id)" 
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
import { onBeforeMount, ref, watch } from 'vue';
import { pencil, trashOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useClientesStore } from '@/stores/clienteStore';
import { Cliente, Comuna, Region } from '@/interfaces/interfaces';
import regionService from '@/services/regionService';
import comunaService from '@/services/comunaService';

const router = useRouter();
const clienteStore = useClientesStore();

// Datos del cliente (simulados)
const cliente = ref<Cliente>();
const direccionEditada = {
    region_id: 0,
    comuna_id: 0 || null,
    direccion: "",
};
const regionesChile = ref<Region[]>();
const comunasChile = ref<Comuna[]>();

// Obtener comunas por región
const comunasPorRegion = (region_id: number) => {
    console.log("Región seleccionada:", region_id);
    const comunasFiltradas = comunasChile.value ? comunasChile.value.filter(comuna => comuna.region_id === region_id) : [];
    console.log("Comunas filtradas:", comunasFiltradas);
    return comunasFiltradas;
};

// Observar cambios en la región seleccionada
watch(() => direccionEditada.region_id, (newValue) => {
    console.log("Región seleccionada (watch):", newValue);
    if (newValue) {
        // Limpiar la comuna seleccionada cuando cambia la región
        direccionEditada.comuna_id = null;
    }
});

// Estado del modal de edición
const modalEditarAbierto = ref(false);

// Datos editados del cliente
const clienteEditado = ref<Cliente>({
    id: cliente.value?.id || 0,
    personas_id: cliente.value?.personas_id || 0,
    cta_instagram: cliente.value?.cta_instagram || null,
    eliminado: cliente.value?.eliminado || false,
    createdAt: cliente.value?.createdAt,
    updatedAt: cliente.value?.updatedAt,
    persona: cliente.value?.persona,
    Direccions: cliente.value?.Direccions || []
});

// Abrir modal de edición
const abrirModalEditar = () => {
    clienteEditado.value = {
        id: cliente.value?.id || 0,
        personas_id: cliente.value?.personas_id || 0,
        cta_instagram: cliente.value?.cta_instagram || null,
        eliminado: cliente.value?.eliminado || false,
        createdAt: cliente.value?.createdAt,
        updatedAt: cliente.value?.updatedAt,
        persona: cliente.value?.persona,
        Direccions: cliente.value?.Direccions || []
    }; // Copiar datos actuales
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
    region_id: 0,
    comuna_id: 0,
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
    if (cliente.value?.Direccions) {
        cliente.value.Direccions.push({ ...nuevaDireccion.value }); // Agregar nueva dirección
    }
    cerrarModalAgregarDireccion();
};

// Estado del modal para editar dirección
const modalEditarDireccionAbierto = ref(false);

// Índice de la dirección seleccionada para editar
const indiceDireccionEditada = ref<number | null>(null);


// Abrir modal para editar dirección
const abrirModalEditarDireccion = (index: number) => {
    indiceDireccionEditada.value = index; // Guardar el índice de la dirección
    if (cliente.value?.Direccions) {
        direccionEditada.value = { ...cliente.value.Direccions[index] }; // Copiar datos actuales
    }
    modalEditarDireccionAbierto.value = true;
};

// Cerrar modal para editar dirección
const cerrarModalEditarDireccion = () => {
    modalEditarDireccionAbierto.value = false;
};

// Guardar cambios en la dirección editada
const guardarCambiosDireccion = () => {
    if (indiceDireccionEditada.value !== null && cliente.value && cliente.value.Direccions) {
        cliente.value.Direccions[indiceDireccionEditada.value] = { ...direccionEditada.value }; // Actualizar dirección
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
    cliente.value?.Direccions?.splice(index, 1); // Eliminar la dirección
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


onBeforeMount(async() => {
    // Cargar datos del cliente desde el store
    cliente.value = clienteStore.getCliente() || undefined;
    // Cargar regiones de Chile
    regionesChile.value = await regionService.getRegiones();
    // Cargar comunas de Chile
    comunasChile.value = await comunaService.getComunas();
});
</script>

<style scoped>
/* Estilos personalizados si es necesario */
</style>