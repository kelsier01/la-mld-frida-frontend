<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Infinite Scroll</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content @ionInfinite="cargarMas">
      <ion-list>
        <ion-item v-for="(item, index) in items" :key="index">
          {{ item }}
        </ion-item>
      </ion-list>

      <ion-infinite-scroll @ionInfinite="cargarMas" threshold="100px">
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="Cargando más datos..."
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/vue";

const items = ref(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));

const cargarMas = (ev) => {
  console.log("Infinite Scroll Activado");

  setTimeout(() => {
    const nuevoItems = Array.from(
      { length: 10 },
      (_, i) => `Nuevo Item ${items.value.length + i + 1}`
    );
    items.value.push(...nuevoItems);
    ev.target.complete();
  }, 1000);
};
</script>
