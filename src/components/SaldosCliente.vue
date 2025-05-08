<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Saldos del Cliente</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('cerrar')">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-segment v-model="segment" value="pedidos">
        <ion-segment-button value="pedidos">
          <ion-label>Pedidos</ion-label>
        </ion-segment-button>
        <ion-segment-button value="historial">
          <ion-label>Historial</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-header>

    <ion-content class="ion-padding" :fullscreen="true">
      <!-- Pedidos -->
      <div v-if="segment === 'pedidos'">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ props.clienteNombre }}</ion-card-title>
            <ion-card-subtitle>Pedidos por Cliente</ion-card-subtitle>
          </ion-card-header>
        </ion-card>

        <ion-list>
          <ion-item
            v-for="pedido in pedidos"
            :key="pedido.id"
            button
            detail="false"
            @click="toggleSeleccion(pedido)"
          >
            <ion-checkbox
              slot="start"
              :checked="pedido.seleccionado"
              @ionChange="handleCheckboxChange(pedido, $event)"
              @click.stop
            />
            <ion-label>
              <h2>Pedido #{{ pedido.id }}</h2>
              <p>Total pedido: {{ formatCurrency(pedido.total) }}</p>

              <!-- Detalle de productos y abonos -->
              <div v-for="(item, index) in pedido.detalle" :key="index">
                <ion-item lines="none" class="producto-item">
                  <div class="producto-container">
                    <div class="producto-header">
                      <h3 class="producto-titulo">{{ item.producto }}</h3>
                    </div>

                    <div class="abonos-container">
                      <div
                        v-for="(abono, idx) in item.abonos"
                        :key="idx"
                        class="abono-item"
                      >
                        <ion-chip class="abono-chip">
                          <ion-label>{{
                            formatCurrency(abono.monto)
                          }}</ion-label>
                          <ion-note>{{ formatFecha(abono.fecha) }}</ion-note>
                        </ion-chip>
                      </div>
                    </div>
                    <div class="producto-footer">
                      <ion-note class="total-abonado">
                        Total abonado:
                        {{
                          formatCurrency(
                            item.abonos.reduce((sum, a) => sum + a.monto, 0)
                          )
                        }}
                      </ion-note>
                    </div>
                  </div>
                </ion-item>
              </div>
            </ion-label>
            <ion-note slot="end" color="dark">
              Pendiente <br />
              {{ formatCurrency(pedido.saldo) }}
            </ion-note>
          </ion-item>
        </ion-list>

        <ion-item lines="none" v-if="pedidos.length === 0">
          <ion-label>No hay pedidos pendientes</ion-label>
        </ion-item>
        <ion-item lines="none" v-else>
          <ion-label><strong>Total seleccionado</strong></ion-label>
          <ion-note slot="end"
            ><strong>{{ formatCurrency(totalSeleccionado) }}</strong></ion-note
          >
        </ion-item>

        <ion-button expand="block" color="success" @click="enviarWhatsApp">
          <ion-icon slot="start" :icon="logoWhatsapp"></ion-icon>
          Solicitar pago vía WhatsApp
        </ion-button>
        <ion-button
          expand="block"
          color="tertiary"
          @click="
            generarImagenCobranza(
              generarCuadroCobranza(pedidos.filter((p) => p.seleccionado))
                .tablaHTML
            )
          "
        >
          <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
          Descargar cuadro de cobranza
        </ion-button>
      </div>

      <!-- Historial -->
      <div v-else>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Historial de abonos</ion-card-title>
          </ion-card-header>
          <ion-list>
            <ion-item v-for="abono in historialAbonos" :key="abono.fecha">
              <ion-label>
                <h3>{{ formatFecha(abono.fecha) }}</h3>
                <p>
                  Monto abonado: {{ formatCurrency(abono.monto) }} Al Pedido #{{
                    abono.pedidoId
                  }}
                </p>
              </ion-label>
            </ion-item>
            <ion-item lines="none" v-if="historialAbonos.length === 0">
              <ion-label>No hay Abonos realizados</ion-label>
            </ion-item>
          </ion-list>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import pedidoService from "@/services/pedidoService";
import html2canvas from "html2canvas";
import { logoWhatsapp, downloadOutline } from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

interface Pedido {
  id: number;
  abono: number;
  saldo: number;
  total: number;
  seleccionado: boolean;
  fecha: string;
  estado: string;
  detalle: DetallePedido[]; // Asegurar que esta propiedad existe
}

interface DetallePedido {
  id: number;
  producto: string;
  abonos: AbonoProducto[]; // Nueva estructura para abonos por producto
}

interface AbonoProducto {
  monto: number;
  fecha: string;
}

interface Abono {
  pedidoId: number;
  fecha: string;
  monto: number;
}

// Props y emits
const props = defineProps<{
  clienteId?: number;
  clienteNombre: string;
  clienteFono: number;
}>();
const emit = defineEmits(["cerrar"]);

const segment = ref<"pedidos" | "historial">("pedidos");
// Datos de ejemplo
const pedidos = ref<Pedido[]>([]);
const historialAbonos = ref<Abono[]>([]);

const cargarAbonosCliente = async () => {
  try {
    const idParam = props.clienteId;
    if (!idParam || Array.isArray(idParam)) {
      throw new Error("ID de cliente inválido");
    }

    const id = Number(idParam);
    const data = await pedidoService.getPedidosByGastosCliente(id);
    console.log("Datos de pedidos:", data);
    const pedidosData = data.map((pedido: any) => {
      const total = pedido.monto_total;

      // Protección contra undefined
      const abonosPedido =
        pedido.Pagos?.flatMap(
          (p: any) =>
            p.Abonos?.map((a: any) => ({
              monto: a.monto,
              fecha: a.fecha,
            })) || []
        ) || [];

      // Mapeo seguro de detalles
      const detalle = (pedido.DetallePedidos || []).map((d: any) => ({
        id: d.id,
        producto: d.Producto?.nombre || "Producto desconocido",
        abonos: abonosPedido,
      }));

      return {
        id: pedido.id,
        abono: abonosPedido.reduce((sum: number, a: any) => sum + a.monto, 0),
        saldo:
          total -
          abonosPedido.reduce((sum: number, a: any) => sum + a.monto, 0),
        total,
        seleccionado: false,
        fecha: pedido.createdAt, // Nueva propiedad
        estado: pedido.EstadoPedido?.estado_pedido || "Sin estado", // Nueva propiedad
        detalle,
      };
    });

    pedidos.value = pedidosData;

    // Mapeo seguro del historial
    const histAbonos = data
      .flatMap((pedido: any) =>
        (pedido.Pagos || []).flatMap((pago: any) =>
          (pago.Abonos || []).map((abono: any) => ({
            pedidoId: pedido.id,
            fecha: abono.createdAt,
            monto: abono.monto,
          }))
        )
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

    historialAbonos.value = histAbonos;
  } catch (err) {
    console.error("Error al cargar cliente:", err);
    mostrarToast("Error al cargar datos del cliente", "danger");
  } finally {
    console.log("Datos de pedidos mapeado:", pedidos.value);
  }
};
// Computed para recalcular el total seleccionado
const totalSeleccionado = computed(() =>
  pedidos.value
    .filter((p) => p.seleccionado)
    .reduce((sum, p) => sum + p.saldo, 0)
);

const handleCheckboxChange = (pedido: Pedido, event: CustomEvent) => {
  toggleSeleccion(pedido, event.detail.checked);
};

// Modificar la función toggleSeleccion para asegurarnos que siempre actualice el estado
const toggleSeleccion = (pedido: Pedido, checked?: boolean) => {
  pedido.seleccionado =
    typeof checked === "boolean" ? checked : !pedido.seleccionado;
  // Forzar la actualización del cálculo
  pedidos.value = [...pedidos.value];
};

// Envío de WhatsApp
// const enviarWhatsApp = () => {
//   const seleccionados = pedidos.value.filter((p) => p.seleccionado);
//   if (!seleccionados.length) return;

//   const detalle = seleccionados
//     .map((p) => {
//       const totalAbonado = p.detalle.reduce(
//         (sum, d) =>
//           sum + d.abonos.reduce((abonoSum, a) => abonoSum + a.monto, 0),
//         0
//       );

//       const productosDetalle = p.detalle
//         .map((d) => {
//           const totalProducto = d.abonos.reduce((sum, a) => sum + a.monto, 0);
//           const abonosProducto = d.abonos
//             .map(
//               (a) =>
//                 `    📅 ${formatFecha(a.fecha)}: ${formatCurrency(a.monto)}`
//             )
//             .join("\n");

//           return (
//             `  🛍️ *${d.producto}*\n` +
//             `    ✅ Total abonado: ${formatCurrency(totalProducto)}\n` +
//             `    📝 Detalle de abonos:\n${abonosProducto}`
//           );
//         })
//         .join("\n\n");

//       return (
//         `📦 *Pedido #${p.id}*\n` +
//         `💎 Valor total del pedido: ${formatCurrency(p.total)}\n` +
//         `\n${productosDetalle}\n\n` +
//         `✳️ Total abonado: ${formatCurrency(totalAbonado)}\n` +
//         `❗ *Saldo pendiente: ${formatCurrency(p.saldo)}*\n`
//       );
//     })
//     .join("\n");

//   const total = formatCurrency(totalSeleccionado.value);
//   const mensaje =
//     `👋 Hola ${props.clienteNombre},\n\n` +
//     `📊 Detalle de tus saldos pendientes:\n\n` +
//     `${detalle}\n` +
//     `💰 *Total pendiente: ${total}*\n\n` +
//     `🙏 Por favor, realiza el pago. ¡Gracias!`;

//   const url = `https://wa.me/56${props.clienteFono}?text=${encodeURIComponent(
//     mensaje
//   )}`;
//   window.open(url, "_blank");
// };

const enviarWhatsApp = async () => {
  const seleccionados = pedidos.value.filter((p) => p.seleccionado);
  if (!seleccionados.length) {
    mostrarToast("Selecciona al menos un pedido", "warning");
    return;
  }

  // Generar cuadro de cobranza
  const { tablaTexto, tablaHTML } = generarCuadroCobranza(seleccionados);

  // Mensaje con formato para WhatsApp
  const mensaje =
    `👋 Hola ${props.clienteNombre},\n\n` +
    `📊 *Detalle de cobranza:*\n\n` +
    `${tablaTexto}\n\n` +
    `💰 *Total pendiente: ${formatCurrency(totalSeleccionado.value)}*\n\n` +
    `🙏 Por favor, realiza el pago. ¡Gracias!`;

  // Generar imagen
  const imgUrl = await generarImagenCobranza(tablaHTML);

  // Enviar por WhatsApp
  const url = `https://wa.me/56${props.clienteFono}?text=${encodeURIComponent(
    mensaje
  )}`;
  const nuevaVentana = window.open(url, "_blank");

  // Esperar para adjuntar imagen (necesita servidor para subir imagen)
  if (nuevaVentana && imgUrl) {
    setTimeout(() => {
      nuevaVentana.location.href = `https://web.whatsapp.com/send?media=${encodeURIComponent(
        imgUrl
      )}`;
    }, 2000);
  }
};

const generarCuadroCobranza = (pedidosSeleccionados: Pedido[]) => {
  // Determinar máximo de abonos
  const maxAbonos = Math.max(
    ...pedidosSeleccionados.flatMap((p) =>
      p.detalle.flatMap((d) => d.abonos.length)
    ),
    1
  );

  // Generar headers dinámicos
  const headersAbonos = Array.from({ length: maxAbonos }, (_, i) => [
    `Abono`,
    `Fecha AB${i + 1}`,
  ]).flat();

  const headers = [
    "CLIENTA",
    "ARTÍCULO VENDIDO",
    "VENTA $",
    "FECHA VENTA",
    ...headersAbonos,
    "Total abonos",
    "Deuda pendiente",
    "Estado",
  ];

  // Construir tabla
  let tablaTexto = `\n| ${headers.join(" | ")} |\n|${" --- |".repeat(
    headers.length
  )}`;

  let tablaHTML = `
  <table border="1" style="
    border-collapse: collapse;
    width: 100%;
    font-family: Arial;
    font-size: 12px;
    border: 1px solid #000;
    margin: 15px 0;
    background: white;">
    <thead>
      <tr style="background: #f2f2f2;">
        ${headers
          .map(
            (h) => `
          <th style="
            padding: 10px 5px;
            border: 1px solid #000;
            text-align: center;
            font-weight: 700;
            color: #333;
            vertical-align: middle;">
            ${h}
          </th>`
          )
          .join("")}
      </tr>
    </thead>
    <tbody>`;

  // Procesar filas
  pedidosSeleccionados.forEach((pedido) => {
    pedido.detalle.forEach((producto) => {
      const celdasAbonos = Array(maxAbonos * 2)
        .fill("")
        .map((_, index) => {
          const abonoIndex = Math.floor(index / 2);
          const abono = producto.abonos[abonoIndex];

          if (index % 2 === 0) {
            return abono ? formatCurrency(abono.monto) : "";
          } else {
            return abono ? formatFechaCorta(abono.fecha) : "";
          }
        });

      const totalAbonosProducto = producto.abonos.reduce(
        (sum, a) => sum + a.monto,
        0
      );
      const saldoColor = pedido.saldo > 0 ? "#dc2626" : "#16a34a";

      const fila = [
        props.clienteNombre,
        producto.producto,
        formatCurrency(pedido.total),
        pedido.fecha ? formatFechaCorta(pedido.fecha) : "--",
        ...celdasAbonos,
        `<span style="background: #fef2f2; padding: 2px 5px; border-radius: 3px;">${formatCurrency(
          totalAbonosProducto
        )}</span>`,
        `<span style="color: ${saldoColor}; font-weight: 600;">${formatCurrency(
          pedido.saldo
        )}</span>`,
        `<span style="color: #4f46e5; font-weight: 500;">${pedido.estado}</span>`,
      ];

      tablaTexto += `\n| ${fila.join(" | ").replace(/<[^>]+>/g, "")} |`;

      tablaHTML += `
      <tr>
        ${fila
          .map(
            (celda, i) => `
          <td style="
            padding: 10px 5px;
            border: 1px solid #000;
            vertical-align: top;
            line-height: 1.4;
            ${i === headers.length - 3 ? "background: #fef2f2;" : ""}">
            ${celda}
          </td>`
          )
          .join("")}
      </tr>`;
    });
  });

  // Footer con totales
  const totalDeuda = pedidosSeleccionados.reduce((sum, p) => sum + p.saldo, 0);

  tablaHTML += `
    <tr style="background: #e0e7ff;">
      <td colspan="${headers.length - 3}" style="
        text-align: right;
        font-weight: 700;
        padding: 12px 5px;
        color: #1e3a8a;
        border-top: 2px solid #000;">
        TOTAL
      </td>
      <td style="
        font-weight: 700;
        padding: 12px 5px;
        color: #1e3a8a;
        border-top: 2px solid #000;">
        ${formatCurrency(totalDeuda)}
      </td>
      <td style="padding: 12px 5px; border-top: 2px solid #000;"></td>
    </tr>
  </tbody></table>`;

  tablaTexto += `\n\nTOTAL    ${formatCurrency(totalDeuda)}`;

  return { tablaTexto, tablaHTML };
};

// Función auxiliar para formato de fecha
const formatFechaCorta = (fecha: string) => {
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "--";

    return `${date.getDate()}-${date.toLocaleString("es-ES", {
      month: "short",
    })}.${date.getFullYear().toString().slice(-2)}`;
  } catch {
    return "--";
  }
};

const generarImagenCobranza = async (html: string) => {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.innerHTML = html;
  document.body.appendChild(container);

  // Ajustar estilos para imagen
  const tables = container.getElementsByTagName("table");
  Array.from(tables).forEach((table) => {
    table.style.width = "100%";
    table.style.fontSize = "10px";
  });

  const canvas = await html2canvas(container);
  const imgData = canvas.toDataURL("image/jpeg", 0.9);

  // Descargar
  const link = document.createElement("a");
  link.download = `cobranza-${props.clienteNombre}.jpg`;
  link.href = imgData;
  link.click();

  document.body.removeChild(container);
};

// Helpers de formato
const formatCurrency = (valor: number): string =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(valor);

const formatFecha = (fecha: string): string =>
  new Date(fecha).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
// Toast helper function
const mostrarToast = async (mensaje: string, color: string) => {
  const toast = document.createElement("ion-toast");
  toast.message = mensaje;
  toast.duration = 2000;
  toast.color = color;
  toast.position = "bottom";

  document.body.appendChild(toast);
  await toast.present();
};

onMounted(() => {
  cargarAbonosCliente();
});
</script>

<style scoped>
ion-card-title {
  font-weight: bold;
}
ion-item p {
  margin: 0;
}
.producto-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 1rem;
}

.producto-container {
  width: 100%;
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 1rem;
}

.producto-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--ion-color-medium-tint);
  padding-bottom: 0.5rem;
}

.producto-titulo {
  margin: 0;
  color: var(--ion-color-dark);
  font-size: 1.1rem;
  font-weight: 600;
}

.total-abonado {
  font-weight: 600;
  color: var(--ion-color-success);
}

.producto-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  border-top: 1px solid var(--ion-color-medium-tint);
  padding-top: 0.5rem;
}

.abonos-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.abono-item {
  flex: 0 1 auto;
}

.abono-chip {
  --background: var(--ion-color-light-shade);
  --color: var(--ion-color-dark);
  margin: 0;
}

.abono-chip ion-note {
  font-size: 0.8rem;
  margin-left: 0.5rem;
  color: var(--ion-color-medium);
}
/* Añadir al final del <style> */
table {
  width: 100%;
  border: 1px solid #000;
  font-family: Arial;
  font-size: 12px;
}

th,
td {
  border: 1px solid #000;
  padding: 4px;
  vertical-align: top;
}

th {
  background-color: #e0e0e0;
  font-weight: bold;
}

tfoot td {
  background-color: #f0f0f0;
  font-weight: bold;
}
.table-container {
  overflow-x: auto;
  max-width: 100%;
}

table {
  min-width: 800px;
}

table {
  border: 1px solid #000;
  font-family: Arial;
  font-size: 12px;
  margin: 15px 0;
  background: white;
}

th {
  background-color: #f2f2f2 !important;
  border: 1px solid #000 !important;
  padding: 10px 5px !important;
  color: #333 !important;
  font-weight: 700 !important;
  text-align: center !important;
}

td {
  padding: 10px 5px !important;
  border: 1px solid #000 !important;
  vertical-align: top;
  line-height: 1.4;
}

tfoot td {
  background-color: #f2f2f2;
  font-weight: bold;
  padding: 12px 5px !important;
}
</style>
