<template>
  <!-- Botón para generar comprobante de venta -->
  <div style="text-align: center;">
    <ion-button 
      @click="handleGenerateXLS" 
      :disabled="disabled || isProcessing"
      expand="block"
      class="generate-button"
    >
      <ion-spinner v-if="isProcessing" name="crescent" class="spinner-button"/>
      <slot v-else name="content">
        Generar Comprobante de Venta
      </slot>
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { Cliente, DetallePedido, Direccion } from '@/interfaces/interfaces';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ref } from 'vue';

const props = defineProps<{
  detallePedido: DetallePedido[];
  subtotal: string;
  total: string;  
  comprobanteId: number;
  fecha?: string;
  disabled?: boolean;             
  cliente: Cliente;    
  direccion: Direccion;                            
}>();

const isProcessing = ref(false);
const emit = defineEmits(['success', 'error', 'actualizarPrecioComprobante']);

// Método que maneja la secuencia completa
const handleGenerateXLS = async () => {
  try {
    isProcessing.value = true;
    
    // Paso 1: Emitir evento para actualizar precios en el componente padre
    // y esperar a que termine usando una promesa
    await new Promise<void>((resolve) => {
      emit('actualizarPrecioComprobante', resolve);
    });
    
    // Paso 2: Una vez que los precios se han actualizado, generar el Excel
    await generateXLS();
    
    // Paso 3: Notificar que todo el proceso ha terminado correctamente
    emit('success');
  } catch (error) {
    console.error('Error en el proceso de generación del comprobante:', error);
    emit('error', error);
  } finally {
    isProcessing.value = false;
  }
};

// Método para generar el archivo Excel
const generateXLS = async () => {
  try {
    // Validar que todos los productos tengan precios válidos
    const productosInvalidos = props.detallePedido.filter(
      detalle => !detalle.precio_venta || detalle.precio_venta <= 0
    );
    
    if (productosInvalidos.length > 0) {
      throw new Error('Algunos productos no tienen un precio de venta válido.');
    }
    
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();

    // Cargar el archivo template-comprobante-venta.xlsx
    const response = await fetch('/template-comprobante-venta.xlsx');
    const buffer = await response.arrayBuffer();
    await workbook.xlsx.load(buffer);

    // Obtener la hoja de trabajo
    const worksheet = workbook.getWorksheet(1);

    // Verificar si la hoja de trabajo existe
    if (!worksheet) {
      throw new Error('No se encontró la hoja de trabajo en el archivo.');
    }

    worksheet.getCell('C7').value = props.cliente.persona?.nombre || 'Cliente no especificado';

    // Agregar el ID del comprobante de venta
    worksheet.getCell('C8').value = String(props.comprobanteId);

    // Agregar la fecha actual en formato dd-mm-yyyy o usar la fecha proporcionada
    if (props.fecha) {
      const formattedFecha = new Date(props.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      worksheet.getCell('C9').value = formattedFecha;
    } else {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      worksheet.getCell('C9').value = formattedDate;
    }

    // Definir la fila inicial para los detalles del pedido
    const startRow = 13; // Fila donde empiezan los detalles del pedido

    // Eliminar filas existentes de productos (si las hay)
    const numExistingProductRows = worksheet.rowCount - startRow + 1;
    if (numExistingProductRows > 0) {
      worksheet.spliceRows(startRow, numExistingProductRows);
    }

    // Insertar filas para los nuevos productos
    if (props.detallePedido.length > 0) {
      worksheet.insertRows(startRow, new Array(props.detallePedido.length).fill({}), 'i+');
    }

    // Llenar los detalles del pedido
    props.detallePedido.forEach((detalle, index) => {
      const row = worksheet.getRow(startRow + index);

      // Cantidad (Columna A)
      row.getCell(1).value = detalle.cantidad;

      // Descripción (Columna B)
      row.getCell(2).value = `${detalle.adicional}, ${detalle.Producto.nombre}`;

      // Precio Unitario (Columna F)
      row.getCell(6).value = detalle.precio_venta;

      // Total (Columna H)
      row.getCell(7).value = detalle.cantidad * (detalle.precio_venta);
    });

    // Calcular la fila donde comienzan los totales
    const totalStartRow = startRow + props.detallePedido.length + 1;

    // Llenar los totales
    worksheet.getCell(`G${totalStartRow}`).value = parseFloat(props.subtotal); // Subtotal
    worksheet.getCell(`G${totalStartRow + 1}`).value = parseFloat(props.total); // Total

    //Llenar Direccion de Facturacion
    worksheet.getCell(`A${totalStartRow + 4}`).value = props.cliente.persona?.nombre || 'Cliente no especificado';
    worksheet.getCell(`A${totalStartRow + 5}`).value = props.direccion.direccion || 'Dirección no especificada';
    worksheet.getCell(`A${totalStartRow + 6}`).value = props.direccion.Region?.nombre || 'Region no especificada';
    worksheet.getCell(`A${totalStartRow + 7}`).value = props.direccion.Comuna?.nombre || 'Provincia no especificada';
    worksheet.getCell(`A${totalStartRow + 8}`).value = props.cliente.persona?.fono || 'Telefono no especificado';
    worksheet.getCell(`A${totalStartRow + 9}`).value = props.cliente.persona?.correo || 'Email no especificado';

    //Llenar Direccion de Envio
    worksheet.getCell(`F${totalStartRow +  4}`).value = props.cliente.persona?.nombre || 'Cliente no especificado';
    worksheet.getCell(`F${totalStartRow +  5}`).value = props.direccion.direccion || 'Dirección no especificada';
    worksheet.getCell(`F${totalStartRow +  6}`).value = props.direccion.Region?.nombre || 'Region no especificada';
    worksheet.getCell(`F${totalStartRow +  7}`).value = props.direccion.Comuna?.nombre || 'Provincia no especificada';
    worksheet.getCell(`F${totalStartRow +  8}`).value = props.cliente.persona?.fono || 'Telefono no especificado';
    worksheet.getCell(`F${totalStartRow +  9}`).value = props.cliente.persona?.correo || 'Email no especificado';

    // Guardar el archivo modificado
    const bufferModified = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([bufferModified], { type: 'application/octet-stream' }), 'comprobante_de_venta.xlsx');
  } catch (error) {
    console.error('Error al generar el archivo Excel:', error);
    emit('error', error);
    alert('Ocurrió un error al generar el archivo. Por favor, verifica que todos los precios estén correctamente ingresados.');
  }
};
</script>

<style scoped>
.generate-button {
  --border-radius: 8px;
  --box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  text-transform: none;
  height: 44px;
  margin: 8px auto;
  display: block;
  width: 100%;
  max-width: 300px;
}

.spinner-button {
  width: 24px;
  height: 24px;
  opacity: 0.9;
}
</style>