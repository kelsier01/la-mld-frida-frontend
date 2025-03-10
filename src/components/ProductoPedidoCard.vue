<template>
  <ion-card>
    <ion-card-content>
      <ion-list>
          <ion-item>
              <ion-thumbnail slot="start">
                  <ion-img 
                      :src="`${URL_IMAGE}${producto.ProductoImagens[0].url}`"
                      alt="Producto"
                  />
              </ion-thumbnail>
              <ion-label>{{ producto.nombre }}</ion-label>
              <ion-button fill="clear" color="danger" @click="emitDelete" class="delete-button">
                  <ion-icon :icon="closeCircleOutline"></ion-icon>
              </ion-button>
          </ion-item>
      </ion-list>
      <ion-grid>
          <ion-row>
              <ion-col size="6">
                  <ion-select label="Bodega" placeholder="Seleccione una bodega" label-placement="stacked">
                      <ion-select-option 
                        v-for="bodega in producto.ProductoBodegas"
                        :value="bodega.bodegas_id"
                        :key="bodega.bodegas_id"
                       >
                       {{ bodega.Bodega.nombre }}
                       </ion-select-option>
                  </ion-select>
              </ion-col>
              <ion-col size="6">
                  <ion-input 
                      type="number"
                      placeholder="Cantidad"
                      label-placement="stacked"
                      label="Cantidad"/>
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
                      :value="producto.precio_venta"
                  />
              </ion-col>
              <ion-col>
                  <ion-input 
                      type="text"
                      placeholder="Valor de compra"
                      label-placement="stacked"
                      label="Valor de compra (USD)"
                      :value="producto.Precio_compra_usd"
                  />
              </ion-col>
          </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { Producto } from '@/interfaces/interfaces';
import { IonCard, IonCardContent, IonList, IonItem, IonIcon, IonThumbnail, IonLabel, IonImg, IonGrid, IonCol, IonRow, IonSelect, IonSelectOption, IonInput, IonButton } from '@ionic/vue';
import { closeCircleOutline } from 'ionicons/icons';
import { defineEmits } from 'vue';

const URL_IMAGE = 'http://localhost:8000'

const props = defineProps<{
  producto: Producto;
}>();
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
