<template>
  <ion-card>
    <ion-card-content>
      <ion-list>
          <ion-item>
              <ion-thumbnail slot="start">
                  <ion-img 
                      src="https://nikeclprod.vtexassets.com/arquivos/ids/1069254-600-600?v=638570099680070000&width=600&height=600&aspect=true 600w,https://nikeclprod.vtexassets.com/arquivos/ids/1069254-800-800?v=638570099680070000&width=800&height=800&aspect=true 800w,https://nikeclprod.vtexassets.com/arquivos/ids/1069254-1200-1200?v=638570099680070000&width=1200&height=1200&aspect=true 1200w"
                      alt="Producto"
                  />
              </ion-thumbnail>
              <ion-label>Nike Air Force 1</ion-label>
              <ion-button fill="clear" color="danger" @click="emitDelete" class="delete-button">
                  <ion-icon :icon="closeCircleOutline"></ion-icon>
              </ion-button>
          </ion-item>
      </ion-list>
      <ion-grid>
          <ion-row>
              <ion-col size="6">
                  <ion-select label="Bodega" placeholder="Seleccione una bodega" label-placement="stacked">
                      <ion-select-option value="apple">Arica</ion-select-option>
                      <ion-select-option value="banana">E-commerce</ion-select-option>
                      <ion-select-option value="orange">USA</ion-select-option>
                  </ion-select>
              </ion-col>
              <ion-col size="6">
                  <ion-select label="Cantidad" placeholder="Seleccione una cantidad" label-placement="stacked">
                      <ion-select-option value="apple">1</ion-select-option>
                      <ion-select-option value="banana">2</ion-select-option>
                      <ion-select-option value="orange">3</ion-select-option>
                  </ion-select>
              </ion-col>
          </ion-row>
          <ion-row>
              <ion-col>
                  <ion-input 
                      type="text"
                      placeholder="Información adicional"
                      label-placement="stacked"
                      label="Información adicional"
                  />
              </ion-col>
          </ion-row>
          <ion-row>
              <ion-col>
                  <ion-input 
                      type="text"
                      placeholder="Precio venta"
                      label-placement="stacked"
                      label="Precio venta (CLP)"
                  />
              </ion-col>
              <ion-col>
                  <ion-input 
                      type="text"
                      placeholder="Valor de compra"
                      label-placement="stacked"
                      label="Valor de compra (USD)"
                  />
              </ion-col>
          </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonList, IonItem, IonIcon, IonThumbnail, IonLabel, IonImg, IonGrid, IonCol, IonRow, IonSelect, IonSelectOption, IonInput, IonButton } from '@ionic/vue';
import { closeCircleOutline } from 'ionicons/icons';
import { defineEmits } from 'vue';

const emit = defineEmits(['delete']);

const emitDelete = () => {
emit('delete');
};

</script>

<style scoped>
.delete-button {
position: absolute;
top: 8px;
right: 8px;
font-size: 1.5rem;
}
</style>
