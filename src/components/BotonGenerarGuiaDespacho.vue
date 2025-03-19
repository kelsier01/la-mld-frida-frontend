<template>
  <!-- Botón para generar XLS -->
  <div style="text-align: center;">
    <ion-button @click="generateXLS">Generar Guia de Despacho</ion-button>
  </div>
</template>

<script setup lang="ts">
import { DetallePedido } from '@/interfaces/interfaces';
import { defineProps, defineEmits } from 'vue';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const props = defineProps<{
  detallePedido: DetallePedido[];
  subtotal: string;
  insurage: string;
  otros: string;
  total: string;                                                 
}>();

const emit = defineEmits(['actualizarPrecioGuia']);

const generateXLS = async () => {

  emit('actualizarPrecioGuia');
  try {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();

    // Cargar el archivo template.xlsx
    const response = await fetch('/template.xlsx');
    const buffer = await response.arrayBuffer();
    await workbook.xlsx.load(buffer);

    // Obtener la hoja de trabajo
    const worksheet = workbook.getWorksheet(1); // Obtener la primera hoja

    // Verificar si la hoja de trabajo existe
    if (!worksheet) {
      throw new Error('No se encontró la hoja de trabajo en el archivo.');
    }

    // Definir la fila inicial para los detalles del pedido
    const startRow = 19; // Fila donde empiezan los detalles del pedido

    // Eliminar filas existentes de productos (si las hay)
    const numExistingProductRows = worksheet.rowCount - startRow + 1;
    if (numExistingProductRows > 0) {
      worksheet.spliceRows(startRow, numExistingProductRows);
    }

    // Insertar filas para los nuevos productos
    if (props.detallePedido.length > 0) {
      worksheet.insertRows(startRow, new Array(props.detallePedido.length).fill({}), 'i+'); // 'i+' copia el estilo de la fila anterior
    }

    // Llenar los detalles del pedido
    props.detallePedido.forEach((detalle, index) => {
      const row = worksheet.getRow(startRow + index);

      // Cantidad (Columna B)
      row.getCell(2).value = detalle.cantidad;

      // Unidad (Columna C)
      row.getCell(3).value = 'Uni';

      // Descripción (Columna D)
      row.getCell(4).value = detalle.adicional;

      // Precio Unitario (Columna G)
      row.getCell(7).value = detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd;

      // Total (Columna H)
      row.getCell(8).value = detalle.cantidad * (detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd);
    });

    // Calcular la fila donde comienzan los totales
    const totalStartRow = startRow + props.detallePedido.length + 1; // Dos filas después de la última fila de productos

    // Insertar la firma dinámicamente
    const firmaResponse = await fetch('/firma.png'); // Ruta a la imagen de la firma
    const firmaBuffer = await firmaResponse.arrayBuffer();
    const firmaId = workbook.addImage({
      buffer: firmaBuffer,
      extension: 'png',
    });

    // Posición de la firma (a la izquierda de la tabla de subtotal)
    const firmaRow = totalStartRow; // Misma fila que el subtotal
    worksheet.addImage(firmaId, {
      tl: { col: 1, row: firmaRow }, // Esquina superior izquierda (columna 0, fila dinámica)
      br: { col: 3, row: firmaRow + 4 }, // Esquina inferior derecha (columna 2, fila dinámica + 3)
    });

    // Llenar los totales
    worksheet.getCell(`H${totalStartRow}`).value = props.subtotal; // Subtotal
    worksheet.getCell(`H${totalStartRow + 1}`).value = props.insurage; // Seguro
    worksheet.getCell(`H${totalStartRow + 2}`).value = props.otros; // Otros
    worksheet.getCell(`H${totalStartRow + 4}`).value = props.total; // Total

    // Guardar el archivo modificado
    const bufferModified = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([bufferModified], { type: 'application/octet-stream' }), 'guia_de_despacho.xlsx');
  } catch (error) {
    console.error('Error al generar el archivo Excel:', error);
    alert('Ocurrió un error al generar el archivo. Por favor, inténtalo de nuevo.');
  }
};
</script>

<style scoped>
/* Estilos generales */
</style>