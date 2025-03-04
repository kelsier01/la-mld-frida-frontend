<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button 
                        default-href="/gestionUSA"
                        text="Volver"
                    ></ion-back-button>
                </ion-buttons>
                <ion-title>Crear Guia de Despacho</ion-title>
            </ion-toolbar>
        </ion-header>
    
        <ion-content>
            <ion-searchbar 
                placeholder="Buscar por cliente" 
                debounce="500"
                animated
                clearIcon="close"             
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
                    <ion-col>
                        <ion-item>
                            <ion-select label="Estado del pedido">
                                <ion-select-option value="1">Pendientes</ion-select-option>
                                <ion-select-option value="2">En proceso</ion-select-option>
                                <ion-select-option value="3">Finalizados</ion-select-option>
                            </ion-select>
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-select label="Region">
                                <ion-select-option value="1">Arica y Parinacota</ion-select-option>
                                <ion-select-option value="2">Pedido de compra</ion-select-option>
                            </ion-select>
                        </ion-item>
                    </ion-col>
                </ion-row>
            </ion-grid>

            <PedidoCard 
                :conCheckBox="true"
            />

            <ion-fab
                vertical="bottom"
                horizontal="end"
                slot="fixed"
            >
                <ion-fab-button>
                    <ion-icon :icon="document" />
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import PedidoCard from '@/components/PedidoCard.vue';
import {
    IonPage,
    IonHeader,
    IonContent,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButtons,
    IonBackButton,
    IonToolbar,
    IonTitle,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
} from '@ionic/vue';
import { document } from 'ionicons/icons';

</script>

<style scoped>
</style>

