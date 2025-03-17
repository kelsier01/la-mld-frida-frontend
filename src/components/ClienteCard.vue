<template>
<ion-card class="card-cliente" @click="verDetallesCliente(cliente)">
    <ion-card-header>
    <ion-card-title class="nombre-cliente">
        {{ cliente.persona?.nombre }}
    </ion-card-title>
    </ion-card-header>
    <ion-card-content class="contenido-cliente">
    <ion-list lines="none" class="lista-cliente">
        <ion-item class="item-cliente">
        <ion-label>
            <strong>Rut:</strong> {{ cliente.persona?.n_identificacion }}
        </ion-label>
        </ion-item>
        <ion-item class="item-cliente">
        <ion-label>
            <strong>Teléfono:</strong> {{ cliente.persona?.fono || "N/D" }}
        </ion-label>
        </ion-item>
        <ion-item class="item-cliente">
        <ion-label>
            <strong>Email:</strong> {{ cliente.persona?.correo || "N/D" }}
        </ion-label>
        </ion-item>
        <ion-item class="item-cliente">
        <ion-label>
            <strong>Región:</strong>
            <span v-if="cliente.Direccions && cliente.Direccions.length > 0">
            {{ cliente.Direccions.map(direccion => direccion.Region.nombre).join(', ') }}
            </span>
            <span v-else>No disponible</span>
        </ion-label>
        </ion-item>
    </ion-list>
    </ion-card-content>
</ion-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Cliente } from '@/interfaces/interfaces';
import { useRouter } from 'vue-router';
import { useClientesStore } from '@/stores/clienteStore';


const clientesStore = useClientesStore();
const router = useRouter();
const props = defineProps<{
cliente: Cliente
}>();
const cliente = props.cliente;

const verDetallesCliente = (cliente: Cliente) => {
    //cargar cliente en el store y navegar a la vista de detalles
    clientesStore.setCliente(cliente);
    router.push({ name: "DetallesCliente", params: { id: cliente.id } });
};

</script>

<style scoped>
.card-cliente {
margin: 16px;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
transition: box-shadow 0.3s ease;
background: var(--ion-card-background, #ffffff); /* Fondo adaptable al tema */
}

.card-cliente:hover {
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.nombre-cliente {
font-size: 24px;
font-weight: bold;
color: var(--ion-text-color, #333); /* Color de texto adaptable al tema */
margin-bottom: 8px;
}

.contenido-cliente {
padding: 16px;
}

.lista-cliente {
padding: 0;
}

.item-cliente {
--padding-start: 0;
--inner-padding-end: 0;
margin-bottom: 0px;
}

.item-cliente ion-label {
font-size: 16px;
color: var(--ion-text-color, #666); /* Color de texto adaptable al tema */
}

.item-cliente strong {
color: var(--ion-text-color, #333); /* Color de texto adaptable al tema */
}

/* Estilos específicos para modo oscuro */
@media (prefers-color-scheme: dark) {
.card-cliente {
    background: var(--ion-card-background-dark, #1e1e1e); /* Fondo oscuro */
    box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}

.card-cliente:hover {
    box-shadow: 0 4px 8px rgba(255, 255, 255, 0.2);
}

.nombre-cliente {
    color: var(--ion-text-color-dark, #ffffff); /* Texto claro en modo oscuro */
}

.item-cliente ion-label {
    color: var(--ion-text-color-dark, #cccccc); /* Texto claro en modo oscuro */
}

.item-cliente strong {
    color: var(--ion-text-color-dark, #ffffff); /* Texto claro en modo oscuro */
}
}
</style>