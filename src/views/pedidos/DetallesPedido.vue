<template>
    <ion-page>
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button 
                default-href="/pedidos"
                text="Volver"
              />
            </ion-buttons>
            <ion-segment v-model="segmentoActivo" class="custom-segment" style="margin: 0 auto;">
              <ion-segment-button value="detalles">
                Detalles
              </ion-segment-button>
              <ion-segment-button value="abonos" v-if="loginStore.user?.roles_id != 3">
                Abonos
              </ion-segment-button>
            </ion-segment>
            <ion-buttons slot="end">
              <ion-button @click="openAlertaEliminar" color="danger">
                <ion-icon :icon="trashOutline" slot="icon-only" v-if="loginStore.user?.roles_id === 1"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Spinner de carga -->
            <div class="loading-container" v-if="loading">
                <ion-spinner name="circular" color="primary"></ion-spinner>
                <p>Cargando detalles del pedido...</p>
            </div>
            
            <!-- Contenido principal (se muestra cuando no está cargando) -->
            <div v-else>
                
                <div v-if="segmentoActivo === 'detalles'">
                    <!-- Sección de información del cliente -->
                    <ion-card class="info-card">
                        <ion-card-header>
                            <ion-card-title>
                                <ion-icon :icon="personOutline"></ion-icon>
                                Información del Cliente
                            </ion-card-title>
                        </ion-card-header>
                        
                        <ion-card-content>
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">    
                                        <div class="info-value">
                                            <ion-icon :icon="personOutline" size="small" slot="start"/>
                                            {{ cliente?.persona?.nombre || 'N/D' }}
                                        </div>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">                                        
                                        <div class="info-value">
                                            <ion-icon :icon="locationOutline" size="small" slot="start"/>
                                            {{ direccion_pedido }}
                                        </div>
                                    </div>                                    
                                </div>
                                

                                <div class="info-item">
                                    <div class="info-label">                                       
                                        <div class="info-value">
                                            <ion-icon :icon="mailOutline" size="small" slot="start"/>
                                            {{ cliente?.persona?.correo || 'N/D' }}
                                        </div>
                                    </div>                                    
                                </div>                               
                                <div class="info-item">
                                    <div class="info-label">
                                        <div class="info-value">
                                            <ion-icon :icon="callOutline" size="small" slot="start"/>
                                            {{ cliente?.persona?.fono || 'N/D' }}
                                        </div>
                                    </div>   
                                </div>
                                <div class="info-item estado-pedido">
                                    <div class="info-label">
                                        
                                        <div class="info-value">
                                            <ion-icon :icon="flagOutline" size="small" slot="start"/>
                                            <ion-chip color="success" v-if="logEstadoPedido && logEstadoPedido.length > 0">
                                                {{ logEstadoPedido[logEstadoPedido.length - 1].EstadoPedido.estado_pedido}}
                                            </ion-chip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ion-card-content>
                    </ion-card>
                    
                    <!-- Historial del pedido -->
                    <ion-card class="info-card">
                        <ion-card-header>
                            <ion-card-title>
                                <ion-icon :icon="timeOutline"/>
                                Historial del Pedido
                            </ion-card-title>
                        </ion-card-header>
                        
                        <ion-card-content>
                            <div class="timeline">
                                <div class="timeline-item" v-for="(log) in logEstadoPedido?.slice().reverse()" :key="log.id">
                                    <div class="timeline-dot" :class="`dot-${getEstadoColor(log.estado_pedidos_id)}`"></div>
                                    <div class="timeline-content">
                                        <div class="timeline-header">
                                            <div class="timeline-date">
                                                <ion-icon :icon="calendarOutline" size="small"></ion-icon>
                                                {{ formatDate(log.createdAt) }}
                                            </div>
                                            <ion-chip :color="getEstadoColor(log.estado_pedidos_id)" class="estado-chip">
                                                {{ log.EstadoPedido.estado_pedido }}
                                            </ion-chip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ion-card-content>
                    </ion-card>
                    
                    <!-- Productos del pedido -->
                    <ion-card class="info-card">
                        <ion-card-header>
                            <ion-card-title>
                                <ion-icon :icon="bagHandleOutline"></ion-icon>
                                Productos del Pedido
                            </ion-card-title>
                        </ion-card-header>
                        
                        <ion-card-content>
                            <ion-grid>
                                <ion-row>
                                    <ion-col 
                                        size="12" 
                                        size-md="6" 
                                        size-lg="4" 
                                        v-for="(detallePedidoItem, index) in detallePedido" 
                                            :key="index">
                                            <ProductoResumenCard 
                                                :detallePedido="detallePedidoItem" 
                                            />
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </ion-card-content>
                    </ion-card>
                </div>

                <!-- Sección de abonos -->
                <div v-if="segmentoActivo === 'abonos'">
                    <ion-card class="indicadores-card">
                        <ion-card-content>
                            <ion-grid>
                                <ion-row>
                                    <ion-col size="12" size-md="4">
                                        <ion-card class="stat-card">
                                            <ion-card-header>
                                                <ion-card-title>
                                                    <ion-icon :icon="cartOutline"></ion-icon>
                                                    Total Pedido
                                                </ion-card-title>
                                            </ion-card-header>
                                            <ion-card-content>
                                                <ion-text color="primary">
                                                    <h1>${{ formatoCLP(totalValoresPedido.totalPedido) }}</h1>
                                                </ion-text>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>
                                    <ion-col size="12" size-md="4">
                                        <ion-card class="stat-card">
                                            <ion-card-header>
                                                <ion-card-title>
                                                    <ion-icon :icon="cashOutline"></ion-icon>
                                                    Total Abono
                                                </ion-card-title>
                                            </ion-card-header>
                                            <ion-card-content>
                                                <ion-text color="primary">
                                                    <h1>${{ formatoCLP(totalValoresPedido.totalAbono) }}</h1>
                                                </ion-text>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>
                                    <ion-col size="12" size-md="4">
                                        <ion-card class="stat-card">
                                            <ion-card-header>
                                                <ion-card-title>
                                                    <ion-icon :icon="walletOutline"/>
                                                    Saldo Pendiente
                                                </ion-card-title>
                                            </ion-card-header>
                                            <ion-card-content>
                                                <ion-text color="primary">
                                                    <h1>${{ formatoCLP(totalValoresPedido.totalPedido - totalValoresPedido.totalAbono) }}</h1>
                                                </ion-text>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </ion-card-content>
                    </ion-card>
                    
                    
                    <!-- Formulario de abono -->
                    <ion-card class="form-card">
                        <ion-card-header>
                            <ion-card-title>
                                <ion-icon :icon="addCircleOutline"></ion-icon>
                                Registrar Abono
                            </ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-grid>
                                <ion-row>
                                    <ion-col size="12">
                                        <ion-item class="custom-select">
                                            <ion-select 
                                                label="Método de Pago"
                                                v-model="metodoPagoSeleccionado"
                                                placeholder="Seleccione un método de pago"
                                                interface="action-sheet"
                                                >
                                                <ion-select-option 
                                                    v-for="metodo in metodoPago"
                                                    :key="metodo.id"
                                                    :value="metodo.id"
                                                    >{{ metodo.nombre}}
                                                </ion-select-option>
                                            </ion-select>
                                        </ion-item>
                                    </ion-col>
                                </ion-row>
                                <ion-row>
                                    <ion-col size="7" size-md="8">
                                        <ion-item class="custom-input">
                                            <ion-input 
                                                v-model="montoAbonoMostrado"
                                                type="text" 
                                                label="Monto Abono" 
                                                label-placement="stacked"
                                                placeholder="Ingrese un monto"
                                                @input="manejarCambioMonto()"
                                                class="abono-input"
                                                :clear-input="true"
                                            />
                                        </ion-item>
                                    </ion-col>

                                    <ion-col size="5" size-md="4">
                                        <ion-button 
                                            expand="block"
                                            @click="confirmarAbono"
                                            :disabled="procesandoAbono || !puedeAbonar"
                                            color="primary"
                                            class="abono-button"
                                            >
                                            <ion-icon 
                                                :icon="cashOutline" 
                                                slot="start" 
                                                v-if="!procesandoAbono"
                                            />
                                            <ion-spinner 
                                                v-if="procesandoAbono" 
                                                name="crescent" 
                                                class="spinner-button"
                                            />
                                            <span v-else>Registrar Abono</span>
                                        </ion-button>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </ion-card-content>
                    </ion-card>
                    
                    <!-- Historial de abonos -->
                    <ion-card class="abonos-card">
                        <ion-card-header>
                            <ion-card-title>
                                <ion-icon :icon="receiptOutline"></ion-icon>
                                Historial de Abonos
                            </ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <div class="empty-state" v-if="abonos.length === 0">
                                <ion-icon :icon="cashOutline" class="empty-icon"></ion-icon>
                                <p>No hay abonos registrados</p>
                            </div>
                            <div class="abono-item" v-for="abono in abonos" :key="abono.id">
                                <div class="abono-monto">
                                    <ion-text color="success">+${{ formatoCLP(abono.monto) }}</ion-text>
                                </div>
                                <div class="abono-detalles">
                                    <ion-chip :color="getMetodoPagoColor(abono.metodos_pago_id)" v-if="abono.MetodoPago">
                                        {{ abono.MetodoPago.nombre }}
                                    </ion-chip>
                                    <div class="abono-fecha">
                                        <ion-icon :icon="calendarOutline" size="small"></ion-icon>
                                        <span>{{ formatDate(abono.createdAt) }}</span>
                                    </div>
                                </div>
                            </div>
                        </ion-card-content>
                    </ion-card>
                </div>
            </div>
        </ion-content>

        <!-- Alerts -->
        <ion-alert
            :is-open="alertConfig.isOpen"
            :header="alertConfig.header"
            :message="alertConfig.message"
            :buttons="alertConfig.buttons"
            @didDismiss="alertConfig.isOpen = false"
        />
    </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { 
    cashOutline, 
    walletOutline, 
    receiptOutline, 
    calendarOutline,
    personOutline,
    locationOutline,
    mailOutline,
    callOutline,
    flagOutline,
    timeOutline,
    cartOutline,
    bagHandleOutline,
    addCircleOutline,
    trashOutline
} from 'ionicons/icons';
import { useRoute } from 'vue-router';
import ProductoResumenCard from '@/components/ProductoResumenCard.vue';
import { Abono, Cliente, LogEstadoPedido, MetodoPago } from '@/interfaces/interfaces';
import { useClientesStore } from '@/stores/clienteStore';
import logEstadoPedidoService from '@/services/logEstadoPedidoService';
import detallePedidoService from '@/services/detallePedidoService';
import abonoService from '@/services/abonoService';
import { DetallePedido } from '@/interfaces/interfaces';
import metodoPagoService from '@/services/metodoPagoService';
import { IonAlert } from '@ionic/vue';
import { formatoCLP } from '@/utilities/useDineroFormato';
import { useLoginStore } from '@/stores/loginStore';
import pedidoService from '@/services/pedidoService';
import { useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const pedidoId = ref<string>(String(route.params.id));
const clientesStore = useClientesStore();
const loginStore = useLoginStore();
const cliente = ref<Cliente>()
const logEstadoPedido = ref<LogEstadoPedido[]>();
const detallePedido = ref<DetallePedido[]>();
const abonos = ref<Abono[]>([]);
const metodoPago = ref<MetodoPago[]>();
const totalValoresPedido = ref<any>({
    totalPedido: 0,
    totalAbono: 0,
    saldoPendiente: 0
});
const segmentoActivo = ref('detalles'); // Control del segmento activo
const montoAbono = ref<number>(); // Monto del abono
const montoAbonoMostrado = ref<string>(''); // Monto del abono mostrado con formato
const metodoPagoSeleccionado = ref<number>(0); // Metodo de pago seleccionado
const direccion_pedido = ref<string>('');

// Variables para el estado de carga
const loading = ref<boolean>(true);
const procesandoAbono = ref<boolean>(false);

// Estructura para los alerts
const alertConfig = ref({
    isOpen: false,
    header: '',
    message: '',
    buttons: []
});

const eliminarPedido = async() =>{
    try {
        await pedidoService.putPedido({ id: pedidoId.value, eliminado: 1 });
        // Redirigir a la lista de pedidos con el parámetro refresh
        router.push('/pedidos?refresh=true');
    } catch (error) {
        console.error("Error al eliminar el pedido:", error);
        mostrarAlert(
            'Error', 
            'No se pudo eliminar el pedido. Intente nuevamente.',
            ['OK']
        );
    }
};

const openAlertaEliminar = () => {
    mostrarAlert(
        'Confirmar Eliminación del Pedido', 
        `¿Está seguro de eliminar el pedido ${pedidoId.value}?`,
        [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Confirmar', handler: () => eliminarPedido() }
        ]
    );
}


// Valores computados para mejor manejo
const saldoPendiente = computed(() => {
    return totalValoresPedido.value.totalPedido - totalValoresPedido.value.totalAbono;
});

// Validación para habilitar el botón de abono
const puedeAbonar = computed(() => {
    if (!montoAbono.value || montoAbono.value <= 0) {
        return false;
    }
    
    if (!metodoPagoSeleccionado.value) {
        return false;
    }
    
    if (montoAbono.value > saldoPendiente.value) {
        return false;
    }
    
    return true;
});

const direccionPedido = () => {
    if (!detallePedido.value || detallePedido.value.length === 0) {
        direccion_pedido.value = 'N/D';
        return;
    }

    direccion_pedido.value = detallePedido.value[0]?.Pedido?.Direccion?.direccion ?? 'N/D';
};

const getEstadoColor = (estado: number) => {
  return ['warning', 'success', 'danger', 'primary', 'secondary'][estado - 1] || 'primary';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// Función para formatear montos con separadores de miles
const formatMonto = (valor: number): string => {
    return new Intl.NumberFormat('es-CL').format(valor);
};

// Función para manejar el cambio en el input
const manejarCambioMonto = () => {
    // Obtener el valor del input
    const inputValue = montoAbonoMostrado.value;
    console.log("Input Value:", inputValue);
    
    // Limpiar cualquier carácter que no sea número
    const numeroLimpio = inputValue.replace(/\D/g, '');
    
    if (numeroLimpio === '') {
        montoAbono.value = undefined;
        montoAbonoMostrado.value = '';
        return;
    }
    
    // Convertir a número para cálculos
    montoAbono.value = parseInt(numeroLimpio, 10);
    
    // Formatear con puntos para mostrar
    montoAbonoMostrado.value = formatMonto(montoAbono.value);
};

// Método para mostrar alerts
const mostrarAlert = (header:string, message:string, buttons:any) => {
    alertConfig.value = {
        isOpen: true,
        header,
        message,
        buttons
    };
};

// Método para confirmar antes de realizar el abono
const confirmarAbono = () => {
    if (!puedeAbonar.value) {
        let mensaje = '';
        if (!montoAbono.value || montoAbono.value <= 0) {
            mensaje = 'El monto debe ser mayor a 0';
        } else if (!metodoPagoSeleccionado.value) {
            mensaje = 'Debe seleccionar un método de pago';
        } else if (montoAbono.value > saldoPendiente.value) {
            mensaje = `El monto no puede ser mayor al saldo pendiente ($${formatMonto(saldoPendiente.value)})`;
        }
        
        mostrarAlert('Error', mensaje, ['OK']);
        return;
    }
    
    mostrarAlert(
        'Confirmar Abono', 
        `¿Está seguro de registrar un abono de $${formatMonto(montoAbono.value || 0)}?`,
        [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Confirmar', handler: () => registrarAbono() }
        ]
    );
};

// Método para registrar el abono
const registrarAbono = async () => {
    if (!puedeAbonar.value) {
        return;
    }
    
    procesandoAbono.value = true;
    
    try {

        const nuevoAbono = await abonoService.postAbono(
            pedidoId.value,
            metodoPagoSeleccionado.value,
            Number(montoAbono.value || 0),
            1 // Usuario ID
        );

        if (nuevoAbono) {
            console.log("Abono registrado:", nuevoAbono);
            // Agregar el método de pago al objeto de abono para mostrarlo en el historial
            const metodoPagoInfo = metodoPago.value?.find(m => m.id === metodoPagoSeleccionado.value);
            if (metodoPagoInfo) {
                nuevoAbono.MetodoPago = metodoPagoInfo;
            }
            
            abonos.value.unshift(nuevoAbono);
            
            // Actualizar totales directamente para evitar cálculos innecesarios
            totalValoresPedido.value.totalAbono += Number(montoAbono.value);
            
            // Mostrar mensaje de éxito con formato
            mostrarAlert(
                'Abono Registrado', 
                `El abono de $${formatMonto(montoAbono.value || 0)} se ha registrado correctamente.`,
                ['OK']
            );
            
            // Resetear el formulario
            montoAbono.value = undefined;
            montoAbonoMostrado.value = '';
            metodoPagoSeleccionado.value = 0;
        }
    } catch (error) {
        console.error("Error al registrar abono:", error);
        
        mostrarAlert(
            'Error', 
            'No se pudo registrar el abono. Intente nuevamente.',
            ['OK']
        );
    } finally {
        procesandoAbono.value = false;
    }
};

// Método optimizado para calcular todos los totales en un solo lugar
const calcularTotales = () => {
    if (detallePedido.value) {
        totalValoresPedido.value.totalPedido = detallePedido.value.reduce(
            (total, detalle) => total + detalle.cantidad * detalle.precio_venta, 
            0
        );
    } else {
        totalValoresPedido.value.totalPedido = 0;
    }
    
    totalValoresPedido.value.totalAbono = abonos.value.reduce(
        (total, abono) => total + Number(abono.monto), 
        0
    );
};

// Reemplazar el watch existente con uno más eficiente
watch(abonos, () => {
    calcularTotales();
}, { deep: true });


const getMetodoPagoColor = (metodoPagoId: number) => {
  // Asigna colores según el ID del método de pago
  const colores = {
    1: 'success',   // Efectivo
    2: 'primary',   // Transferencia
    3: 'warning',  // Tarjeta de crédito
  };

  // Retorna el color correspondiente o 'primary' como valor por defecto
  return colores[metodoPagoId as keyof typeof colores] || 'primary';
};

onMounted(async () => {
    loading.value = true;
    try {
        // Cargar datos en paralelo para mejor rendimiento
        const [detallePedidoData, abonosData, metodoPagoData, logEstadoPedidoData] = await Promise.all([
            detallePedidoService.getDetallePedidoByPedido_Id(pedidoId.value),
            abonoService.getAbonoByPedidoId(pedidoId.value),
            metodoPagoService.getMetodoPago(),
            logEstadoPedidoService.getLogEstadoPedido(pedidoId.value)
        ]);
        
        detallePedido.value = detallePedidoData;
        abonos.value = abonosData.reverse();
        metodoPago.value = metodoPagoData ?? [];
        logEstadoPedido.value = logEstadoPedidoData;
        cliente.value = clientesStore.getCliente() ?? undefined;
        
        // Calcular todos los totales en un solo lugar
        calcularTotales();
        direccionPedido();
    } catch (error) {
        console.error("Error al cargar datos del pedido:", error);
        mostrarAlert(
            'Error', 
            'No se pudieron cargar los datos del pedido correctamente.',
            ['OK']
        );
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
/* Estilos personalizados si es necesario */
ion-card-header {
  padding-bottom: 8px; /* Reducir el espacio inferior del encabezado */
}

ion-card-title {
  display: flex;
  align-items: center;
  justify-content: center; /* Cambiar de left a center */
  font-size: 1.5rem;
  font-weight: bold;
  gap: 8px; /* Espacio entre el ícono y el texto */
  text-align: center; /* Asegurar que el texto esté centrado */
}

ion-card-content {
  padding-top: 8px; /* Reducir el espacio superior del contenido */
}

ion-card-content h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    padding: 0;
    text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: 3rem 0;
}

.loading-container ion-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.spinner-button {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

/* Estilos adicionales para mejorar la UI */
ion-select, ion-input {
    --padding-start: 8px;
    --padding-end: 8px;
}

ion-input {
    font-size: 1.1rem;
    font-weight: 500;
}

ion-button {
    margin-top: 19px; /* Alinear con el input */
    height: 40px;
}

ion-list-header {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--ion-color-dark);
    padding-left: 0;
}

.ion-text-center {
    text-align: center;
    width: 100%;
    color: var(--ion-color-medium);
}

.abono-button {
    margin-top: 19px;
    height: 45px;
    font-weight: 600;
    font-size: 1rem;
    --border-radius: 8px;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.abono-button:hover:not(:disabled) {
    --box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
}

.abono-button:active:not(:disabled) {
    --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
}

.abono-button:disabled {
    opacity: 0.7;
}

.abonos-card {
    margin-top: 1rem;
}

.abono-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--ion-color-light);
}

.abono-monto {
    font-size: 1.2rem;
    font-weight: bold;
}

.abono-detalles {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.abono-fecha {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.9rem;
    color: var(--ion-color-medium);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--ion-color-medium);
    margin: 1rem 0;
}

.empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

/* Timeline mejorado para mejor visualización en móvil y escritorio */
.timeline {
    position: relative;
    margin: 0 0 0 20px;
    padding: 0;
}

.timeline::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    background: rgba(var(--ion-color-medium-rgb), 0.2);
    z-index: 0;
}

.timeline-item {
    position: relative;
    padding: 16px 0 16px 30px;
    margin-bottom: 8px;
}

.timeline-item:last-child {
    margin-bottom: 0;
}

.timeline-dot {
    position: absolute;
    top: 20px;
    left: -6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    z-index: 1;
    box-shadow: 0 0 0 3px rgba(var(--ion-color-light-rgb), 0.8);
}

.dot-success { background-color: var(--ion-color-success); }
.dot-primary { background-color: var(--ion-color-primary); }
.dot-warning { background-color: var(--ion-color-warning); }
.dot-danger { background-color: var(--ion-color-danger); }
.dot-secondary { background-color: var(--ion-color-secondary); }

.timeline-content {
    background-color: rgba(var(--ion-color-light-rgb), 0.5);
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
}

.timeline-content:hover {
    transform: translateX(2px);
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.timeline-date {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
    color: var(--ion-color-medium);
}

.estado-chip {
    margin: 0;
    font-size: 0.8rem;
    height: 24px;
}

.timeline-description {
    margin-top: 8px;
    font-size: 0.95rem;
    color: var(--ion-color-dark);
    line-height: 1.4;
}

/* Ajustes responsivos específicos */
@media (max-width: 768px) {
    .timeline-item {
        padding-left: 24px;
    }
    
    .timeline-dot {
        width: 12px;
        height: 12px;
        left: -5px;
    }
    
    .timeline-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .estado-chip {
        margin-top: 4px;
        align-self: flex-start;
    }
}

/* Mejoras para tablets y dispositivos medianos */
@media (min-width: 768px) and (max-width: 1024px) {
    ion-card {
        margin: 12px;
    }
    
    .timeline-item {
        padding-left: 28px;
    }
}

/* Mejoras específicas para dispositivos grandes */
@media (min-width: 1024px) {
    .timeline-content {
        max-width: 90%;
    }
    
    .info-card, .stat-card, .form-card, .abonos-card, .indicadores-card {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
    }
}

/* Resto de los estilos... */
</style>
