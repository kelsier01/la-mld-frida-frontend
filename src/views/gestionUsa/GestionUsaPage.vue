<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Gestion USA</ion-title>
            </ion-toolbar>
        </ion-header>
    
        <ion-content>
            <IonGrid>
                <IonRow>
                    <IonCol>
                        <IonItem>
                            <IonSelect label="Region" placeholder="Seleccionar">
                                <IonSelectOption value="1">Opción 1</IonSelectOption>
                                <IonSelectOption value="2">Opción 2</IonSelectOption>
                                <IonSelectOption value="3">Opción 3</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </IonCol>
                </IonRow>
            </IonGrid>

            <ion-fab
                vertical="bottom"
                horizontal="end"
                slot="fixed"
            >
                <ion-fab-button 
                    color="primary"
                    @click="NavegarACrearGuia"
                    >
                    <IonIcon :icon="add" />
                </ion-fab-button>
            </ion-fab>
            <GuiaDespachoCard />
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import GuiaDespachoCard from '@/components/GuiaDespachoCard.vue';
import {
    IonPage,
    IonHeader,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonFab,
    IonFabButton,
    IonIcon,
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

const NavegarACrearGuia = () => {
    router.push({ name: 'crearGuia' });
}

</script>

<style scoped>
</style>

