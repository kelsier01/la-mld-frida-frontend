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
        <ion-title>Nuevo Pedido</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Spinner de carga principal -->
      <div class="loading-container" v-if="loading">
        <ion-spinner name="circular" color="primary"></ion-spinner>
        <p>Cargando datos...</p>
      </div>

      <div v-else>
        <ion-alert
          :is-open="showConfirmAlert"
          header="Confirmar Pedido"
          :message="'¿Está seguro de que desea confirmar este pedido?'"
          :buttons="[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                showConfirmAlert = false;
              }
            },
            {
              text: 'Confirmar',
              handler: async () => {
                try {
                  showConfirmAlert = false;
                  await guardarPedido();
                  // El éxito se maneja en la función guardarPedido
                } catch (error) {
                  console.error('Error al confirmar pedido:', error);
                }
              }
            }
          ]"
        />
        
        <!-- Alerta de resultado (éxito o error) -->
        <ion-alert
          :is-open="showResultAlert"
          :header="alertHeader"
          :message="alertMessage"
          :backdropDismiss="false"
          :buttons="[{
            text: 'Aceptar',
            handler: () => {
              if (isSuccess) {
                ionRouter.navigate('/pedidos?refresh=true', 'root', 'replace');
              }
              showResultAlert = false;
            },
          }]"
        />
        
        <ion-grid>
          <!-- Buscador de clientes -->
          <ion-row class="searchbar-container">
            <ion-searchbar
              v-model="clientSearchTerm"
              placeholder="Buscar cliente"
              @ionFocus="handleClientFocus"
            />
            <div v-if="loadingClientes" class="spinner-inline">
              <ion-spinner name="dots" color="medium"></ion-spinner>
            </div>
            <ion-button shape="round" @click="abrirModalAgregarCliente">
              <ion-icon :icon="add" slot="icon-only"/>
            </ion-button>
          </ion-row>

          <!-- Lista de coincidencias para clientes -->
          <ion-list v-if="clientSearchTerm.length > 0">
            <ion-item
              v-for="client in clients"
              :key="client.id"
              button
              @click="selectClient(client)"
            >
              {{ client.persona?.nombre }}
            </ion-item>
          </ion-list>

          <!-- Mostrar cliente seleccionado -->
          <ion-row v-if="selectedClient">
            <ion-col>
              <ion-item>
                <ion-input
                  placeholder="RUT"
                  type="text"
                  label="RUT"
                  label-placement="stacked"
                  :value="selectedClient?.persona?.n_identificacion || 'N/D'"
                />
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-item>
                <ion-input
                  placeholder="Nombre"
                  type="text"
                  label="Nombre"
                  label-placement="stacked"
                  :value="selectedClient?.persona?.nombre || 'N/D'"
                />
              </ion-item>
            </ion-col>
            <div
              v-if="selectedClient?.Direccions && selectedClient.Direccions.length > 0 && selectedClient.Direccions[0]?.direccion"
              style="width: 100%"
            >
              <ion-col size="12">
                <ion-item>
                  <!-- Recibe el id de la direccion -->
                  <ion-select
                    v-model="selectedDireccion.direccion_id"
                    placeholder="Seleccione una dirección"
                    label="Dirección"
                    label-placement="stacked"
                    interface="modal"
                  >
                    <ion-select-option
                      v-for="direccion in selectedClient.Direccions"
                      :key="direccion.id"
                      :value="direccion.id"
                    >
                      {{ direccion.direccion }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item>
                  <ion-label>
                    {{ selectedDireccion.region }}
                  </ion-label>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item>
                  <ion-label>
                    {{ selectedDireccion.comuna }}
                  </ion-label>
                </ion-item>
              </ion-col>
            </div>
            <ion-col size="12" v-else>
              <ion-item>
                <ion-label> No hay dirección disponible </ion-label>
              </ion-item>
            </ion-col>

            <ion-col size="12">
              <ion-button
                expand="block"
                fill="outline"
                @click="abrirModalAgregarDireccion"
              >
                Agregar Nueva Dirección
              </ion-button>
            </ion-col>
          </ion-row>

          <ion-row class="searchbar-container">
            <ion-searchbar
              placeholder="Buscar producto"
              @ionFocus="handleProductFocus"
              v-model="productSearchTerm"
            ></ion-searchbar>
            <div v-if="loadingProductos" class="spinner-inline">
              <ion-spinner name="dots" color="medium"></ion-spinner>
            </div>
            <ion-button shape="round" @click="abrirModalAgregarProducto">
              <ion-icon :icon="add" slot="icon-only" />
            </ion-button>
          </ion-row>
          <!-- Lista de coincidencias para clientes -->
          <ion-list v-if="productSearchTerm.length > 0">
            <ion-item
              v-for="product in productos"
              :key="product.id"
              button
              @click="selectProduct(product)"
            >
              {{ `${product.codigo} - ${product.nombre}` }}
            </ion-item>
          </ion-list>
        </ion-grid>
        <ion-grid>
            <ion-row>
              <ion-col size="12" size-md="6" size-lg="4" v-for="(producto, index) in Detalle_pedido" :key="`producto-${producto.Producto.id}-${index}`">
                <ProductoPedidoCard 
                  :producto="producto"
                  :index="index"
                  @borrar_producto="borrarProducto(index)"
                  @actualizar_producto="actualizarProducto"
                /> 
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="12">
                <TotalCard :total-amount="montoTotal" />
              </ion-col>
            </ion-row>
        </ion-grid>
      </div>
    </ion-content>  
    <ion-footer>
      <ion-toolbar>
        <ion-list>
          <ion-item>
            <ion-select
              placeholder="Seleccione una forma de pago"
              label="Forma de pago"
              v-model="metodoPagoSeleccionado"
            >
              <ion-select-option 
                  v-for="metodo in metodoPago"
                  :key="metodo.id"
                  :value="metodo.id"
                >{{ metodo.nombre }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <div v-if="loginStore.user?.roles_id === 1 || loginStore.user?.roles_id === 2">
            <ion-item>
              <ion-toggle
                v-model="esPagoParcial"
              >
              Pago Parcializado
              </ion-toggle>
            </ion-item>
            <ion-item v-if="esPagoParcial">
              <ion-input 
                type="number" 
                label="Monto Abonado (CLP)" 
                placeholder="3.000" 
                v-model="montoAbonado"
                />
            </ion-item>
          </div>
          <ion-item v-if="!esPagoParcial">
            <ion-label slot="start">Total</ion-label>
            <ion-label slot="end"><strong>{{ montoTotal }}</strong></ion-label>
          </ion-item>
        </ion-list>
        <ion-button 
          expand="full" 
          @click="showConfirmAlert = true" 
          :disabled="!camposCompletos || guardando"
        >
          <ion-spinner v-if="guardando" name="crescent" class="spinner-button"></ion-spinner>
          <span v-else>Crear Pedido</span>
        </ion-button>
      </ion-toolbar>
    </ion-footer>


    <!-- Modal para agregar cliente -->
    <ion-modal 
      :is-open="modalAbierto" 
      @didDismiss="cerrarModal"
    >
      <AgregarClienteModal 
        @cerrar="cerrarModal" 
        @guardar="guardarCliente" 
      />
    </ion-modal>

    <!-- Modal para agregar producto -->
    <ion-modal
      :is-open="modalProductoAbierto"
      @didDismiss="cerrarModalProducto"
    >
      <AgregarProductoModal
        @cerrar="cerrarModalProducto"
        @guardar="guardarProducto"
      />
    </ion-modal>

    <!-- Modal para agregar dirección -->
    <ion-modal
      :is-open="modalDireccionAbierto"
      @didDismiss="cerrarModalDireccion"
    >
      <AgregarDireccionModal
        @cerrar="cerrarModalDireccion"
        @guardar="guardarDireccion"
      />
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">

import { add } from "ionicons/icons";
import ProductoPedidoCard from "@/components/ProductoPedidoCard.vue";
import TotalCard from "@/components/TotalCard.vue";
import AgregarClienteModal from "@/components/AgregarClienteModal.vue";
import AgregarProductoModal from "@/components/AgregarProductoModal.vue";
import AgregarDireccionModal from "@/components/AgregarDireccionModal.vue";
import { onBeforeMount, ref, watch, computed } from "vue";
import clienteService from "@/services/clienteService";
import { Cliente, DetallePedido, Direccion, MetodoPago, NuevoProducto, Producto } from "@/interfaces/interfaces";
import debounce from "lodash.debounce";
import productoService from "@/services/productoService";
import metodoPagoService from "@/services/metodoPagoService";
import { useLoginStore } from "@/stores/loginStore";
import pedidoService from "@/services/pedidoService";
import detallePedidoService from "@/services/detallePedidoService";
import logEstadoPedidoService from "@/services/logEstadoPedidoService";
import direccionService from "@/services/direccionService";
import abonoService from "@/services/abonoService";
import { useIonRouter } from "@ionic/vue";
import productoBodegaService from "@/services/productoBodegaService";

//Es la lista de productos en el pedido, al principio esta vacia
const Detalle_pedido = ref<DetallePedido[]>([]);
//Constante para Metodo de Pago
const metodoPago = ref<MetodoPago[]>([]);
//Forma de pago
const metodoPagoSeleccionado = ref<number>(0);
//Monto Total
const montoTotal = ref<number>(0);
//Monto Abonado
const montoAbonado = ref<number>(0);
//Es pago parcial
const esPagoParcial = ref<boolean>(false);
//Store
const loginStore = useLoginStore();

// Variables para los estados de carga
const loading = ref<boolean>(true);
const loadingClientes = ref<boolean>(false);
const loadingProductos = ref<boolean>(false);
const guardando = ref<boolean>(false);

//Router
const ionRouter = useIonRouter();

//Variables para los alerts
const showConfirmAlert = ref<boolean>(false);
const showResultAlert = ref<boolean>(false);
const alertMessage = ref<string>("");
const alertHeader = ref<string>("");
const isSuccess = ref<boolean>(false);

//Metodo para calcular el monto total

const calcularMontoTotal = () => {
  let total = 0;

  Detalle_pedido.value.forEach(prod => {
    const precio = prod.precio_venta || 0; // Manejo de valores nulos o indefinidos
    const cantidad = prod.cantidad || 0; // Manejo de valores nulos o indefinidos

    total += precio * cantidad;
  });

  return total; // Retorna el monto total calculado
};

const actualizarProducto = (detallePedido: DetallePedido) => {
  console.log("Actualizar nuevo producto:", detallePedido);
  if (detallePedido.index !== undefined) {
    Detalle_pedido.value[detallePedido.index] = detallePedido;
  }
  montoTotal.value = calcularMontoTotal(); // Recalcula el monto total
};

//Metodo para eliminar el productos de Detalle_pedido
const borrarProducto = (index: number) => {
  console.log("Producto eliminado", Detalle_pedido.value[index]);
  Detalle_pedido.value.splice(index, 1);
  
  // Recalcular el monto total
  montoTotal.value = calcularMontoTotal();
  
  // Actualizar los índices de los productos restantes
  Detalle_pedido.value.forEach((detalle, i) => {
    if (detalle.index !== undefined) {
      detalle.index = i;
    }
  });
};

//Metodo para obtener los metodos de pago
const obtenerMetodosPago = async () => {
  try {
    const response = await metodoPagoService.getMetodoPago();
    console.log("Respuesta de la API:", response);
    metodoPago.value = response;
  } catch (error) {
    console.error("Error al cargar metodos de pago", error);
  }
};
 
// Modal de Cliente
const modalAbierto = ref(false);
const abrirModalAgregarCliente = () => {
  modalAbierto.value = true;
};
const cerrarModal = () => {
  modalAbierto.value = false;
};
const guardarCliente = async (cliente: any) => {
  try {
    console.log("Cliente guardado:", cliente);
    const response = await clienteService.postCliente(cliente);
    if(response) {
      console.log("Cliente registrado:", response);
      //clients.value.push(response.cliente);
      //selectedClient.value = response.cliente;
      selectedClient.value = {
        Direccions: [{
          ...response.nuevaDireccion,
          Region: {
            id: response.region.id,
            nombre: response.region.nombre,
            createdAt: response.region.createdAt,
            updatedAt: response.region.updatedAt
          },
          Comuna: {
            id: response.comuna.id,
            nombre: response.comuna.nombre,
            region_id: response.comuna.region_id,
            createdAt: response.comuna.createdAt,
            updatedAt: response.comuna.updatedAt
          }
        }],
        persona: {
          ...response.persona
        },
        personas_id: response.persona.id,
        updatedAt: response.nuevoCliente.updatedAt,
        createdAt: response.nuevoCliente.createdAt,
        id: response.nuevoCliente.id,
        cta_instagram: response.nuevoCliente.cta_instagram,
        eliminado: response.nuevoCliente.eliminado
      };

      selectedDireccion.value.direccion_id = response.nuevaDireccion.id;
      selectedDireccion.value.region = response.region.nombre;
      selectedDireccion.value.comuna = response.comuna.nombre;


      cerrarModal();
    } else {
      console.error("Error al registrar el cliente");
    }
  } catch (error) {
    console.error("Error al guardar cliente:", error);
  } finally {
    cerrarModal();
  }
};

// Modal de Dirección
const modalDireccionAbierto = ref<boolean>(false);
const abrirModalAgregarDireccion = () => (modalDireccionAbierto.value = true);
const cerrarModalDireccion = () => (modalDireccionAbierto.value = false);

const guardarDireccion = async (direccion: Direccion) => {
  try {
    console.log("Dirección guardada:", direccion);
    console.log("ID Cliente", selectedClient.value);

    const nuevaDireccion = {
      clientes_id: selectedClient.value?.id,
      direccion: direccion.direccion,
      region_id: direccion.region_id,
      comuna_id: direccion.comuna_id,
    };

    const nuevaDireccionResponse = await direccionService.postDireccion(nuevaDireccion);

    // selectedDireccion.value.direccion_id = nuevaDireccionResponse.nuevaDireccion.id;
    if(selectedClient.value && selectedClient.value.Direccions) {
      selectedClient.value.Direccions.push({
        direccion: nuevaDireccionResponse.nuevaDireccion.direccion,
        Region: nuevaDireccionResponse.region,
        Comuna: nuevaDireccionResponse.comuna,
        id: nuevaDireccionResponse.nuevaDireccion.id,
        createdAt: nuevaDireccionResponse.nuevaDireccion.createdAt,
        updatedAt: nuevaDireccionResponse.nuevaDireccion.updatedAt,
        region_id: nuevaDireccionResponse.region.id,
        comuna_id: nuevaDireccionResponse.comuna.id
      });
      console.log("Desde crear nueva direccion",selectedClient);
    }

    selectedDireccion.value.direccion_id = nuevaDireccionResponse.nuevaDireccion.id;
    selectedDireccion.value.region = nuevaDireccionResponse.region.nombre;
    selectedDireccion.value.comuna = nuevaDireccionResponse.comuna.nombre;

    console.log("Nueva dirección registrada:", nuevaDireccionResponse);
  } catch (error) {
    console.error("Error al guardar dirección:", error);
  } finally {
    cerrarModalDireccion();
  }
};

//Busqueda de Cliente
// Variable para la dirección seleccionada del cliente
interface DireccionSeleccionada {
  direccion_id: number | null;
  region: string;
  comuna: string;
}


const selectedDireccion = ref<DireccionSeleccionada>({
  direccion_id: null,
  region: "",
  comuna: "",
});

// Búsqueda de Cliente
const clientSearchTerm = ref("");
const selectedClient = ref<Cliente | null>();
const clients = ref<Cliente[]>([]);
const page = ref(1);

watch(() => selectedDireccion.value.direccion_id, (newVal) => {

if(selectedDireccion.value.direccion_id !== null) {
  selectedDireccion.value.region = selectedClient.value?.Direccions?.find(
  direccion => direccion.id === newVal
)?.Region.nombre || "";

selectedDireccion.value.comuna = selectedClient.value?.Direccions?.find(
  direccion => direccion.id === newVal
)?.Comuna.nombre || "";
}

console.log("Dirección seleccionada desde el watch:", selectedDireccion.value);
});

const cargarClientes = async () => {
  loadingClientes.value = true;
  try {
    const response = await clienteService.getAllClientes(
      page.value,
      0,
      clientSearchTerm.value
    );
    console.log("Respuesta de la API:", response);
    if (response.clientes) {
      clients.value.push(...response.clientes);
    }
  } catch (error) {
    console.error("Error al cargar clientes", error);
  } finally {
    loadingClientes.value = false;
  }
};

const filtrarClientes = debounce(async () => {
  page.value = 1;
  clients.value = [];
  await cargarClientes();
}, 300);

watch(clientSearchTerm, async () => {
  console.log("entro");
  await filtrarClientes();
});

const selectClient = (client: Cliente) => {
  selectedClient.value = client;
  console.log("Cliente seleccionado:", client);
  clientSearchTerm.value = "";
  if (client?.Direccions && client.Direccions.length > 0 && client.Direccions[0].direccion) {
    selectedDireccion.value.direccion_id = client.Direccions[0].id;
    selectedDireccion.value.region = client.Direccions[0].Region.nombre;
    selectedDireccion.value.comuna = client.Direccions[0].Comuna.nombre;
  }
};

const handleClientFocus = () => {
  if (selectedClient.value) {
    selectedClient.value = null;
  }
};

// Modal de Producto
const modalProductoAbierto = ref(false);
const abrirModalAgregarProducto = () => {
  modalProductoAbierto.value = true;
};
const cerrarModalProducto = () => {
  modalProductoAbierto.value = false;
};
const guardarProducto = async (producto: NuevoProducto) => {
  try {
    let producto_id = 0;
    
    console.log("Producto guardado:", producto);
    if (
        producto.codigo.trim() !== "" &&
        producto.nombre.trim() !== "" &&
        producto.bodega && producto.categoria && producto.marca
      ) {
        producto_id = await productoService.postProducto(producto);
        const producto_registrado = await productoService.getProductoById(String(producto_id));
        if (producto_registrado) {
          Detalle_pedido.value.push({
            productos_id: producto_id,
            cantidad: 0,
            precio_venta: 0,
            precio_compra_clp: 0,
            precio_compra_usd: 0,
            adicional: "",
            bodegas_id: 0,
            Producto: producto_registrado,
          });
          calcularMontoTotal();
          console.log("Producto registrado:", Detalle_pedido.value);
        } else {
          console.error("Producto registrado es undefined");
        }
        cerrarModalProducto();
    }
  } catch (error) {
    console.error("Error al guardar producto:", error);
  }
};

// Búsqueda de Producto
const productSearchTerm = ref("");
const selectedProduct = ref<DetallePedido | null>(null);
const productos = ref<Producto[]>([]);
const totalProductos = ref(0);
const pageProducto = ref(1);
// Obtener los productos
const obtenerProductos = async () => {
  loadingProductos.value = true;
  try {
    const response = await productoService.getProductos(
      pageProducto.value,
      0,
      0,
      0,
      productSearchTerm.value
    );
    console.log("Respuesta de la API:", response); // Verifica la respuesta
    if (response.productos) {
      productos.value.push(...response.productos);
    }
    totalProductos.value = response.total || 0;
  } catch (error) {
    console.error("Error al cargar productos", error);
  } finally {
    loadingProductos.value = false;
  }
};

const filtrarProductos = debounce(async () => {
  pageProducto.value = 1;
  productos.value = [];
  await obtenerProductos();
}, 300);

watch(productSearchTerm, async () => {
  console.log("entro");
  await filtrarProductos();
});

const selectProduct = (product: Producto) => {
  console.log("Producto seleccionado:", product);
  
  // selectedProduct.value.Producto = product;
  selectedProduct.value = {
    productos_id: product.id,
    cantidad: 0,
    precio_venta: product.precio_venta,
    precio_compra_clp: product.Precio_compra_usd * 1000,
    precio_compra_usd: product.Precio_compra_usd,
    adicional: "",
    bodegas_id: 0,
    Producto: product,
  };
  console.log("Producto seleccionado dentro de selectedProduct:", selectedProduct.value);

  productSearchTerm.value = "";
  if (selectedProduct.value) {
    Detalle_pedido.value.push(selectedProduct.value);
  }
  // calcularMontoTotal();
  console.log("Producto seleccionado:", selectedProduct.value);
};

const handleProductFocus = () => {
  if (selectedProduct.value) {
    selectedProduct.value = null;
  }
};

const guardarPedido = async () => {
  guardando.value = true;
  try {
    const empleado_id = loginStore.user?.empleados[0].id || 3;
    const clientes_id = selectedClient.value?.id;
    const direccion_id = selectedDireccion.value.direccion_id;
    const monto_total = montoTotal.value;
    const monto_abonado = montoAbonado.value;
    const forma_pago = metodoPagoSeleccionado.value;

    //Crear pedido
    if (!clientes_id || !direccion_id || !monto_total) {
      throw new Error("Faltan datos necesarios para crear el pedido");
    }

    // Validar que todos los productos tengan bodega y cantidad seleccionadas
    const productosInvalidos = Detalle_pedido.value.filter(
      detalle => !detalle.bodegas_id || !detalle.cantidad
    );
    
    if (productosInvalidos.length > 0) {
      throw new Error("Algunos productos no tienen bodega o cantidad seleccionada");
    }

    const pedido = {
      empleados_id: empleado_id,
      clientes_id: clientes_id,
      estado_pedidos_id: 1,
      monto_total: monto_total,
      direccion_id: direccion_id
    };

    const response = await pedidoService.postPedido(pedido);

    if (!response || !response.id) {
      throw new Error("No se pudo crear el pedido");
    }

    // Crear log de estado de pedido
    const { id: pedidoId } = response;

    const logEstadoPedido = {
      pedidos_id: pedidoId,
      estado_pedidos_id: 1,
      empleados_id: empleado_id,
    }

    await logEstadoPedidoService.postLogEstadoPedido(logEstadoPedido);

    // Crear los detalles del pedido
    const detallesPromises = Detalle_pedido.value.map(detalle => 
      detallePedidoService.postDetallePedido({
        pedidos_id: pedidoId,
        productos_id: detalle.productos_id,
        cantidad: detalle.cantidad,
        precio_venta: detalle.precio_venta,
        precio_compra_clp: detalle.precio_compra_clp,
        precio_compra_usd: detalle.precio_compra_usd,
        adicional: detalle.adicional,
        bodegas_id: detalle.bodegas_id
      })
    );
    await Promise.all(detallesPromises);

    // Actualizar el stock de los productos en las bodegas
    const actualizacionesStock = Detalle_pedido.value.map(async (detalle) => {
      if (!detalle.bodegas_id || !detalle.cantidad) return;
      
      // No actualizar stock si la bodega es la 4 (bodega con cantidades ilimitadas)
      if (detalle.bodegas_id === 4) {
        console.log(`No se actualiza stock para el producto ${detalle.productos_id} en bodega 4 (ilimitada)`);
        return;
      }
      
      try {
        // Buscar el productoBodega correcto usando la información del producto y la bodega
        const productosBodega = await productoBodegaService.getProductosBodega();
        
        // Encontrar el registro específico para este producto y esta bodega
        const productoBodega = productosBodega.find(
          (pb: any) => 
            pb.productos_id === detalle.productos_id && 
            pb.bodegas_id === detalle.bodegas_id
        );
        
        if (productoBodega) {
          // Calculamos el nuevo stock restando la cantidad vendida
          const nuevoStock = Math.max(0, productoBodega.stock - detalle.cantidad);
          
          // Actualizamos el stock en la base de datos
          await productoBodegaService.actualizarProductoBodega(
            productoBodega.id, 
            { stock: nuevoStock }
          );
          
          console.log(`Stock actualizado: Producto ${detalle.productos_id}, Bodega ${detalle.bodegas_id}, Nuevo stock: ${nuevoStock}`);
        } else {
          console.warn(`No se encontró el registro de producto-bodega para el producto ${detalle.productos_id} en la bodega ${detalle.bodegas_id}`);
        }
      } catch (error) {
        console.error(`Error al actualizar el stock del producto ${detalle.productos_id}:`, error);
      }
    });
    
    // Esperar a que se completen todas las actualizaciones de stock
    await Promise.all(actualizacionesStock);

    // Crear el pago del pedido si es parcial
    if(esPagoParcial.value) {
      if(!monto_abonado || !forma_pago) {
        throw new Error("Faltan datos necesarios para crear el pago del pedido");
      }

      await abonoService.postAbono(
        pedidoId,
        metodoPagoSeleccionado.value,
        monto_abonado,
        1
      );
    } else {
      await abonoService.postAbono(
        pedidoId,
        metodoPagoSeleccionado.value,
        monto_total,
        0
      );
    }
    // Mostrar alerta de éxito después de completar todas las operaciones
    alertHeader.value = "Éxito";
    alertMessage.value = "Pedido registrado correctamente.";
    isSuccess.value = true;
    showResultAlert.value = true;

    console.log("Pedido guardado:", response);
  } catch (error) {
    console.error("Error al guardar el pedido:", error);
    alertHeader.value = "Error";
    alertMessage.value = "No se pudo registrar el pedido. Por favor, intente nuevamente.";
    isSuccess.value = false;
    showResultAlert.value = true;
  } finally {
    guardando.value = false;
  }
};

// Computada para verificar si los campos necesarios están completos
const camposCompletos = computed(() => {
  return (
    selectedClient.value && // Cliente seleccionado
    selectedDireccion.value.direccion_id && // Dirección seleccionada
    Detalle_pedido.value.length > 0 && // Al menos un producto agregado
    metodoPagoSeleccionado.value > 0 && // Método de pago seleccionado
    montoTotal.value > 0
  );
});

onBeforeMount(async() => {
  loading.value = true;
  try {
    await obtenerMetodosPago();
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.searchbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
ion-searchbar {
  flex: 1;
  margin-right: 8px;
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

.spinner-inline {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

spinner-inline ion-spinner {
  width: 24px;
  height: 24px;
}
</style>
