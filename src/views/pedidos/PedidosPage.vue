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
        <ion-content>
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
                            <ion-button>22/12/2024</ion-button>
                        </ion-item>
                    </ion-col>
                    <ion-col size="6">
                        <ion-item>
                            <ion-label>Hasta</ion-label>
                            <ion-button>23/12/2024</ion-button>
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-select placeholder="Estado" label="Estado del pedido" label-placement="stacked">
                                <ion-select-option value="pendiente">Pendiente</ion-select-option>
                                <ion-select-option value="enviado">Enviado</ion-select-option>
                                <ion-select-option value="entregado">Entregado</ion-select-option>
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
            <PedidoCard 
                :conCheckBox="false"
            />
        </ion-content>
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
} from '@ionic/vue';
import PedidoCard from '@/components/PedidoCard.vue';
</script>

<style scoped>
</style>

