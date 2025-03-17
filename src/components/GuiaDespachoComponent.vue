<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Factura Comercial</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div id="invoice">
          <h1>COMMERCIAL INVOICE Nº: 742024</h1>
          <p>DATE (Fecha): 2024-12-05</p>
  
          <table border="1" style="width:100%">
            <tr>
              <th>EXPORTER (EXPORTADOR)</th>
              <th>CONSIGNEE (CONSIGNATARIO)</th>
            </tr>
            <tr>
              <td>
                LA MALETA DE FRIDA LLC<br>
                1770 W FLAGER ST STE 5<br>
                MIAMI, FL 33135-2111<br>
                UNITED STATES<br>
                Phone (Tel.): 407 - 412 - 1084
              </td>
              <td>
                LA MALETA DE FRIDA / SANTIAGO / NATALIA LIEBNER<br>
                TENEX - 56<br>
                Covadonga 525 - Iquique<br>
                ZONA FRANCA DE IQUIQUE. - CHILE<br>
                Tel.: 9 8423 0451 - 57 250 2578
              </td>
            </tr>
          </table>
  
          <h2>Detalle de la Factura</h2>
          <table border="1" style="width:100%">
            <tr>
              <th>Qty (Cantidad)</th>
              <th>Unit (Unidad)</th>
              <th>Description of Good (Descripción Mercancía)</th>
              <th>Unit Price (Precio Unit)</th>
              <th>Total U$D</th>
            </tr>
            <tr v-for="(item, index) in items" :key="index">
              <td>{{ item.quantity }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.description }}</td>
              <td>{{ item.unitPrice }}</td>
              <td>{{ item.quantity * item.unitPrice }}</td>
            </tr>
            <tr>
              <td colspan="4">Subtotal:</td>
              <td>{{ subtotal }}</td>
            </tr>
            <tr>
              <td colspan="4">Insurance (Seguro):</td>
              <td>0</td>
            </tr>
            <tr>
              <td colspan="4">Others (otros):</td>
              <td>0</td>
            </tr>
            <tr>
              <td colspan="4">Total U$D:</td>
              <td>{{ total }}</td>
            </tr>
          </table>
        </div>
  
        <ion-button expand="full" @click="generatePDF">Generar PDF</ion-button>
      </ion-content>
    </ion-page>
  </template>
  
  <script>
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue';
  import html2pdf from 'html2pdf.js';
  
  export default {
    components: {
      IonPage,
      IonHeader,
      IonToolbar,
      IonTitle,
      IonContent,
      IonButton,
    },
    data() {
      return {
        items: [
          { quantity: 2, unit: 'Uni', description: 'Blazer mujer, diferentes modelos, colores y tallas, ZADIG & VOLTAIRE', unitPrice: 28 },
          { quantity: 2, unit: 'Uni', description: 'Blusas mujer, diferentes modelos, colores y tallas, POLO RALPH LAUREN', unitPrice: 14.5 },
          { quantity: 4, unit: 'Uni', description: 'Bolsos mujer, diferentes modelos, colores y tamaños, ZADIG & VOLTAIRE', unitPrice: 48 },
          { quantity: 6, unit: 'Uni', description: 'Bolsos mujer, diferentes modelos, colores y tamaños, MARC JACOBS', unitPrice: 38 },
          { quantity: 1, unit: 'Uni', description: 'Bolso mujer, color negro ALO YOGA', unitPrice: 25 },
          { quantity: 2, unit: 'Uni', description: 'Reloj unisex, diferentes modelos, colores y tamaños, ZADIG & VOLTAIRE', unitPrice: 25 },
          { quantity: 2, unit: 'Uni', description: 'Chaquetas, diferentes modelos, colores y tallas, THE NORTH FACE', unitPrice: 26 },
          { quantity: 1, unit: 'Uni', description: 'Chaqueta mujer, modelo Quilt, POLO RALPH LAUREN', unitPrice: 28 },
          { quantity: 1, unit: 'Uni', description: 'Lentes de sol mujer, CELINE', unitPrice: 48 },
          { quantity: 1, unit: 'Uni', description: 'Lentes de sol mujer, GUCCI', unitPrice: 45 },
          { quantity: 2, unit: 'Uni', description: 'Mochilas mujer, diferentes modelos, colores y tamaños, KIPLING', unitPrice: 17 },
          { quantity: 2, unit: 'Uni', description: 'Mochilas unisex, diferentes modelos, colores y tamaños, THE NORTH FACE', unitPrice: 17 },
          { quantity: 1, unit: 'Uni', description: 'Mochila mujer, modelo animal print, GANNI', unitPrice: 21 },
          { quantity: 1, unit: 'Uni', description: 'Pañuelo mujer, de seda, GUCCI', unitPrice: 25 },
          { quantity: 2, unit: 'Uni', description: 'Gorro de niño, modelo cubrenuca, THE NORTH FACE', unitPrice: 12 },
          { quantity: 2, unit: 'Uni', description: 'Accesorios de pelo, modelo colet, diferentes colores, ALO YOGA', unitPrice: 5 },
          { quantity: 2, unit: 'Uni', description: 'Poleras, diferentes modelos, colores y tallas, POLO RALPH LAUREN', unitPrice: 14.5 },
          { quantity: 1, unit: 'Uni', description: 'Poleron mujer, modelo clasico, ZADIG & VOLTAIRE', unitPrice: 26 },
          { quantity: 1, unit: 'Uni', description: 'Correa para bolso tipo Strapp de tela, ZADIG & VOLTAIRE', unitPrice: 21 },
          { quantity: 4, unit: 'Uni', description: 'Bisuterias varias (3 aros y 1 pulsera), diferentes modelos, ZADIG & VOLTAIRE', unitPrice: 14 },
          { quantity: 1, unit: 'Uni', description: 'Zapatillas mujer, modelo casuales, ZADIG & VOLTAIRE', unitPrice: 34 },
          { quantity: 1, unit: 'Uni', description: 'Zapatillas mujer, modelo deportivas, NEW BALANCE', unitPrice: 33 },
          { quantity: 1, unit: 'Uni', description: 'Zapatos de levantarse, modelo bear, POLO RALPH LAUREN', unitPrice: 25 },
        ],
      };
    },
    computed: {
      subtotal() {
        return this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      },
      total() {
        return this.subtotal + 0; // Aquí puedes agregar seguros u otros gastos si es necesario
      },
    },
    methods: {
      generatePDF() {
        const element = document.getElementById('invoice');
        html2pdf().from(element).save();
      },
    },
  };
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
  }
  </style>