<template>
      <!-- Botón para generar PDF -->
      <!-- <ion-button @click="generatePDF">Generar PDF</ion-button> -->
       <h1>Pruebas</h1>
</template>

<script setup lang="ts">
// import jsPDF from 'jspdf';
// import { ref } from 'vue';

// const total = ref(0);
// const items = ref();

// items.value = [
//   { quantity: 2, unit: 'Uni', description: 'Blazer mujer, diferentes modelos, colores y tallas, ZADIG & VOLTAIRE', unitPrice: 28, total: 56 },
//   { quantity: 2, unit: 'Uni', description: 'Blusas mujer, diferentes modelos, colores y tallas, POLO RALPH LAURENvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', unitPrice: 14.5, total: 29 },
//   { quantity: 2, unit: 'Uni', description: 'Blazer mujer, diferentes modelos, colores y tallas, ZADIG & VOLTAIRE', unitPrice: 28, total: 56 },
//   { quantity: 2, unit: 'Uni', description: 'Blusas mujer, diferentes modelos, colores y tallas, POLO RALPH LAURENvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', unitPrice: 14.5, total: 29 },
//   { quantity: 2, unit: 'Uni', description: 'Blazer mujer, diferentes modelos, colores y tallas, ZADIG & VOLTAIRE', unitPrice: 28, total: 56 },
//   { quantity: 2, unit: 'Uni', description: 'Blusas mujer, diferentes modelos, colores y tallas, POLO RALPH LAURENvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', unitPrice: 14.5, total: 29 },
//   { quantity: "22222", unit: 'Uni', description: 'Blazer mujer, diferentes modelos, colores y tallas, ZADIG & VOLTAIRE', unitPrice: 28, total: "1000000000000000000" },
//   { quantity: 2, unit: 'Uni', description: 'Blusas mujer, diferentes modelos, colores y tallas, POLO RALPH LAURENvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv', unitPrice: 14.5, total: 29 }
// ];


// const generatePDF = () => {

//   const pdf = new jsPDF('p', 'mm', 'a4'); // Crear un nuevo PDF en formato A4
//   const margin = 10; // Márgenes del PDF
//   let y = margin; // Posición vertical inicial

//   // Logo
//   const logo = new Image();
//   logo.src = '/logo.png';
//   pdf.addImage(logo, 'PNG', margin, y, 15, 15); // Ajusta el tamaño del logo
//   y += 20; // Espacio después del logo

//   // Encabezado (Exportador y Consignatario)
//   pdf.setFontSize(6);

//   pdf.setDrawColor(0);
//   pdf.setLineWidth(0.3);
//   pdf.rect(margin, y, 90, 40); // Dibuja un rectángulo alrededor del exportador

//   // Exportador
//   pdf.setFont('helvetica', 'bold');
//   pdf.text('EXPORTER (EXPORTADOR)', margin + 2, y + 6);
//   pdf.setFont('helvetica', 'normal');
//   pdf.text('LA MALETA DE FRIDA LLC', margin + 2, y + 12);
//   pdf.text('1770 W FLAGER ST STE 5', margin + 2, y + 18);
//   pdf.text('MIAMI, FL 33135-2111', margin + 2, y + 24);
//   pdf.text('UNITED STATES', margin + 2, y + 30);
//   pdf.text('Phone (Tel.) : 407 - 412 - 1084', margin + 2, y + 36);


//   // Consignatario
//   pdf.rect(margin + 100, y, 90, 40); // Dibuja un rectángulo alrededor del consignatario
//   pdf.setFont('helvetica', 'bold');
//   pdf.text('CONSIGNEE (CONSIGNATARIO)', margin + 102, y + 6);
//   pdf.setFont('helvetica', 'normal');
//   pdf.text('LA MALETA DE FRIDA / SANTIAGO / NATALIA LIEBNER', margin + 102, y + 12);
//   pdf.text('TENEX  -  56', margin + 102, y + 18);
//   pdf.text('Covadonga 525 - Iquique', margin + 102, y + 24);
//   pdf.text('ZONA FRANCA DE IQUIQUE. - CHILE', margin + 102, y + 30);
//   pdf.text('Tel.: 9  8423 0451   - 57 250 2578', margin + 102, y + 36);
//   y += 50; // Espacio después de los rectángulos


//   // Tabla de productos
//   const tableMargin = margin + 2; // Mueve la tabla un poco más a la derecha
//   pdf.setFont('helvetica', 'bold');
//   pdf.text('Qty (Cantidad)', tableMargin, y);
//   pdf.text('Unit (Unidad)', tableMargin + 30, y);
//   pdf.text('Description of Good (Descripción Mercancía)', tableMargin + 60, y);
//   pdf.text('Unit Price (Precio Unit)', tableMargin + 140, y);
//   pdf.text('Total U$D', tableMargin + 178, y);
//   pdf.setDrawColor(0);
//   pdf.setLineWidth(0.3);
//   pdf.rect(tableMargin - 2, y - 4, 190, 6); // Dibuja un rectángulo alrededor del encabezado
//   pdf.line(tableMargin + 28, y - 4, tableMargin + 28, y + 2); // Línea vertical entre Qty y Unit
//   pdf.line(tableMargin + 58, y - 4, tableMargin + 58, y + 2); // Línea vertical entre Unit y Description
//   pdf.line(tableMargin + 138, y - 4, tableMargin + 138, y + 2); // Línea vertical entre Description y Unit Price
//   pdf.line(tableMargin + 178, y - 4, tableMargin + 178, y + 2); // Línea vertical entre Unit Price y Total
//   y += 6;

//   pdf.setFont('helvetica', 'normal');
//   items.value.forEach((item:any, index:number) => {
//     const quantityLines = pdf.splitTextToSize(item.quantity.toString(), 20);
//     const unitLines = pdf.splitTextToSize(item.unit, 20);
//     const descriptionLines = pdf.splitTextToSize(item.description, 78);
//     const unitPriceLines = pdf.splitTextToSize(item.unitPrice.toString(), 20);
//     const totalLines = pdf.splitTextToSize(item.total.toString(), 20);
    
//     const rowHeight = 6 * Math.max(quantityLines.length, unitLines.length, descriptionLines.length, unitPriceLines.length, totalLines.length);

//     if (index % 2 !== 0) {
//       pdf.setFillColor(240, 255, 240); // Color verde claro
//       pdf.rect(tableMargin - 2, y - 4, 190, rowHeight, 'F'); // Dibuja un rectángulo relleno para filas impares
//     }

//     pdf.text(quantityLines, tableMargin, y);
//     pdf.text(unitLines, tableMargin + 30, y);
//     pdf.text(descriptionLines, tableMargin + 60, y);
//     pdf.text(unitPriceLines, tableMargin + 140, y);
//     pdf.text(totalLines, tableMargin + 180, y);

//     pdf.setDrawColor(0);
//     pdf.setLineWidth(0.1);
//     pdf.rect(tableMargin - 2, y - 4, 190, rowHeight); // Dibuja un rectángulo alrededor de cada fila
//     pdf.line(tableMargin + 28, y - 4, tableMargin + 28, y + rowHeight - 4); // Línea vertical entre Qty y Unit
//     pdf.line(tableMargin + 58, y - 4, tableMargin + 58, y + rowHeight - 4); // Línea vertical entre Unit y Description
//     pdf.line(tableMargin + 138, y - 4, tableMargin + 138, y + rowHeight - 4); // Línea vertical entre Description y Unit Price
//     pdf.line(tableMargin + 178, y - 4, tableMargin + 178, y + rowHeight - 4); // Línea vertical entre Unit Price y Total

//     y += rowHeight; // Espacio entre filas
// });


// // Firma y Total
// // Firma
// const firma = new Image();
// firma.src = '/firma.png';
// pdf.addImage(firma, 'PNG', margin, y+3, 50, 30); // Ajusta el tamaño de la firma

// // Total
// y += 10; // Espacio antes del total
// pdf.setDrawColor(0);
// pdf.setLineWidth(0.3);
// pdf.rect(margin + 138, y - 4, 50, 6); // Dibuja un rectángulo alrededor del subtotal
// pdf.text('Subtotal:', margin + 140, y);
// pdf.text(total.value.toString(), margin + 180, y);
// y += 6;
// pdf.rect(margin + 138, y - 4, 50, 6); // Dibuja un rectángulo alrededor del seguro
// pdf.text('Insurance (Seguro):', margin + 140, y);
// pdf.text('0', margin + 180, y);
// y += 6;
// pdf.rect(margin + 138, y - 4, 50, 6); // Dibuja un rectángulo alrededor de otros
// pdf.text('Others (otros):', margin + 140, y);
// pdf.text('0', margin + 180, y);
// y += 7;
// pdf.rect(margin + 138, y - 4, 50, 6); // Dibuja un rectángulo alrededor del total
// pdf.text('Total:', margin + 140, y);
// pdf.text(total.value.toString(), margin + 180, y);

// // Guardar el PDF
// pdf.save('invoice.pdf');
// };

</script>

<style scoped>
/* Estilos generales */
</style>