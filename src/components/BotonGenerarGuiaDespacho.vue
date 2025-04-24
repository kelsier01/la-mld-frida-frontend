<template>
  <!-- Botón para generar XLS -->
  <div style="text-align: center;">
    <ion-button 
      @click="handleGenerateXLS" 
      :disabled="disabled || isProcessing"
      expand="block"
      class="generate-button"
    >
      <slot name="content">
        {{ isProcessing ? 'Procesando...' : 'Generar Guia de Despacho' }}
      </slot>
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { DetallePedido } from '@/interfaces/interfaces';
import { formatoUSD } from '@/utilities/useDineroFormato';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ref } from 'vue';

const props = defineProps<{
  detallePedido: DetallePedido[];
  subtotal: string;
  insurage: string;
  otros: string;
  total: string;  
  guiaDespachoId: number;
  fecha?: string;
  codigo: string;
  disabled?: boolean;                                             
}>();

const isProcessing = ref(false);
const emit = defineEmits(['actualizarPrecioGuia', 'guiaGenerada']);

// Nuevo método que maneja la secuencia completa
const handleGenerateXLS = async () => {
  try {
    isProcessing.value = true;
    
    // Paso 1: Emitir evento para actualizar y crear la guía en el componente padre
    // y esperar a que termine usando una promesa
    await new Promise<void>((resolve) => {
      emit('actualizarPrecioGuia', resolve);
    });
    
    // Paso 2: Una vez que la guía se ha generado, generar el Excel
    await generateXLS();
    
    // Paso 3: Notificar que todo el proceso ha terminado
    emit('guiaGenerada');
  } finally {
    isProcessing.value = false;
  }
};

// Este método ahora asume que guiaDespachoId ya está disponible
const generateXLS = async () => {
  try {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();

    // Cargar el archivo template.xlsx
    const response = await fetch('/template.xlsx');
    const buffer = await response.arrayBuffer();
    await workbook.xlsx.load(buffer);

    // Obtener la hoja de trabajo
    const worksheet = workbook.getWorksheet(1);

    // Verificar si la hoja de trabajo existe
    if (!worksheet) {
      throw new Error('No se encontró la hoja de trabajo en el archivo.');
    }

    // Agregar el ID de la guía de despacho
    // console.log("ID RECIBIDO DE GUIA", props.guiaDespachoId);
    worksheet.getCell('H1').value = String(props.codigo);

    // Agregar la fecha actual en formato dd-mm-yyyy
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    if (props.fecha) {
      const formattedFecha = new Date(props.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
      }).replace(/\//g, '-');
      worksheet.getCell('H3').value = formattedFecha;
    }else{
      worksheet.getCell('H3').value = formattedDate;
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
      row.getCell(4).value = detalle.adicional 
        ? `${detalle.adicional}, ${detalle.Producto.nombre}` 
        : detalle.Producto.nombre;

      // Precio Unitario (Columna G)
      row.getCell(7).value = formatoUSD(detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd ?? 0);

      // Total (Columna H)
      row.getCell(8).value = formatoUSD(detalle.cantidad * (detalle.precio_compra_guia ?? detalle.Producto.Precio_compra_usd));
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
      tl: { 
        col: 1, 
        row: firmaRow,
      },
      br: { 
        col: 3, 
        row: firmaRow + 4 },
    });

    // Llenar los totales
    worksheet.getCell(`H${totalStartRow}`).value = formatoUSD(Number(props.subtotal)); // Subtotal
    worksheet.getCell(`H${totalStartRow + 1}`).value = formatoUSD(Number(props.insurage)); // Seguro
    worksheet.getCell(`H${totalStartRow + 2}`).value = formatoUSD(Number(props.otros)); // Otros
    worksheet.getCell(`H${totalStartRow + 4}`).value = formatoUSD(Number(props.total)); // Total

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