<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Pedidos</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-searchbar 
                placeholder="Buscar pedidos" 
                animated 
                debounce="500"
            />
            <ion-searchbar 
                placeholder="Buscar cliente" 
                animated 
                debounce="500"
            />

            <ion-grid>
                <ion-row>
                    <ion-col size="6">
                        <ion-item>
                            <ion-label>Desde</ion-label>
                            <ion-datetime-button datetime="desde"></ion-datetime-button>
                        </ion-item>
                    </ion-col>
                    <ion-col size="6">
                        <ion-item>
                            <ion-label>Hasta</ion-label>
                            <ion-datetime-button datetime="hasta"></ion-datetime-button>
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-select placeholder="Estado" label="Estado del pedido" label-placement="stacked">
                                <ion-select-option 
                                    v-for="estado in estadoPedido" 
                                    :key="estado.id" 
                                    :value="estado.id">{{ estado.estado_pedido }}
                                </ion-select-option>
                            </ion-select>
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-select placeholder="Region" label="Región" label-placement="stacked">
                                <ion-select-option value="centro">Centro</ion-select-option>
                                <ion-select-option value="norte">Norte</ion-select-option>
                                <ion-select-option value="sur">Sur</ion-select-option>
                            </ion-select>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col v-for="pedido in pedidos" :key="pedido.id" size="12" size-md="6" size-lg="4">
                        <PedidoCard 
                            :conCheckBox="false"
                            :pedido="pedido"
                        />
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>

            <!-- Modal Desde -->
        <ion-modal :keep-contents-mounted="true">
            <ion-datetime 
                id="desde"
                presentation="date"        >
                <span slot="title">Selecciona una fecha de inicio</span>
            </ion-datetime>
        </ion-modal>

        <!-- Modal Hasta -->
        <ion-modal :keep-contents-mounted="true">
            <ion-datetime 
                id="hasta"
                presentation="date"        >
                <span slot="title">Selecciona una fecha de fin</span>
            </ion-datetime>
        </ion-modal>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage,
    IonHeader,
    IonContent,
    IonSearchbar,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonLabel,
    IonButtons,
    IonMenuButton,
    IonToolbar,
    IonTitle
} from '@ionic/vue';
import PedidoCard from '@/components/PedidoCard.vue';
import estadoPedidoService from '@/services/estadoPedidoService';
import { onBeforeMount, ref } from 'vue';
import { EstadoPedido, Pedido } from '@/interfaces/interfaces';
import pedidoService from '@/services/pedidoService';

// Variables
const estadoPedido = ref<EstadoPedido[]>([]);
const pedidos = ref<Pedido[]>([]);


onBeforeMount(async () => {
    estadoPedido.value = await estadoPedidoService.getEstadosPedido();
    pedidos.value = await pedidoService.getPedido();
    console.log("Pedidos desde pedidoPage",pedidos.value);
    console.log("Estados desde pedidoPage",estadoPedido.value);
});
</script>

<style scoped>
</style>

