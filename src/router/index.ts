import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

const PruebasDeCodigo = () => import("../views/pruebasDeCodigo.vue");
const Login = () => import("../views/auth/LoginPage.vue");
const Registro = () => import("../views/auth/RegistroPage.vue");
const Pedidos = () => import("../views/pedidos/PedidosPage.vue");
const Productos = () => import("../views/productos/ProductosPage.vue");
const Usuarios = () => import("../views/usuarios/UsuariosPage.vue");
const Marcas = () => import("../views/marcas/MarcasPage.vue");
const Categorias = () => import("../views/categorias/CategoriasPage.vue");
const Currier = () => import("../views/delivery/deliveryPage.vue");
const Clientes = () => import("../views/clientes/ClientesPage.vue");
const Bodegas = () => import("../views/bodegas/BodegasPage.vue");
const GestionChile = () => import("../views/gestionChile/GestionChilePage.vue");
const GestionUsa = () => import("../views/gestionUsa/GestionUsaPage.vue");
const DetallesUsuario = () => import("../views/usuarios/DetallesUsuario.vue");
const DetallesBodega = () => import("../views/bodegas/DetallesBodega.vue");
const DetallesCliente = () => import("../views/clientes/DetallesCliente.vue");
const SaldosCliente = () => import("../views/clientes/SaldosCliente.vue");
const NuevoPedido = () => import("../views/pedidos/NuevoPedido.vue");
const DetallesProducto = () =>
  import("../views/productos/DetallesProducto.vue");
const DetallesPedido = () => import("../views/pedidos/DetallesPedido.vue");
const NuevaGuiaDespacho = () =>
  import("../views/gestionUsa/NuevoGuiaDespacho.vue");
const GuiaDeDespacho = () => import("../views/gestionUsa/GuiaDeDespacho.vue");
const DetallesGuia = () =>
  import("../views/gestionUsa/DetallesGuiaDespacho.vue");
const GestionChileDetalleComprobante = () =>
  import("../views/gestionChile/GestionChileDetalleComprobante.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Login,
    name: "Login",
  },
  {
    path: "/registro",
    component: Registro,
    name: "Registro",
  },
  {
    path: "/pedidos",
    name: "Pedidos",
    component: Pedidos,
  },
  {
    path: "/pedidos/:id",
    name: "DetallesPedido",
    component: DetallesPedido,
  },
  {
    path: "/nuevopedido",
    name: "NuevoPedido",
    component: NuevoPedido,
  },
  {
    path: "/productos",
    name: "Productos",
    component: Productos,
  },
  {
    path: "/productos/:id",
    name: "DetallesProducto",
    component: DetallesProducto,
  },
  {
    path: "/usuarios",
    name: "Usuarios",
    component: Usuarios,
  },
  {
    path: "/usuarios/:id",
    name: "DetallesUsuario",
    component: DetallesUsuario,
  },
  {
    path: "/marcas",
    component: Marcas,
  },
  {
    path: "/categorias",
    component: Categorias,
  },
  {
    path: "/curriers",
    component: Currier,
  },
  {
    path: "/clientes",
    name: "Clientes",
    component: Clientes,
  },
  {
    path: "/clientes/saldos/",
    name: "SaldosCliente",
    component: SaldosCliente,
  },
  {
    path: "/clientes/:id",
    name: "DetallesCliente",
    component: DetallesCliente,
  },
  {
    path: "/bodegas",
    name: "Bodegas",
    component: Bodegas,
  },
  {
    path: "/bodegas/:id",
    name: "DetallesBodega",
    component: DetallesBodega,
  },
  {
    path: "/gestionChile",
    component: GestionChile,
    name: "GestionChile",
  },
  {
    path: "/gestionChile/:id",
    component: GestionChileDetalleComprobante,
    name: "GestionChileDetalleComprobante",
  },
  {
    path: "/gestionUsa",
    component: GestionUsa,
    name: "GestionUsa",
  },
  {
    path: "/gestionUsa/:id",
    component: DetallesGuia,
    name: "DetallesGuia",
  },
  {
    path: "/crearguia",
    component: NuevaGuiaDespacho,
    name: "crearGuia",
  },
  {
    path: "/crearguia/guia",
    component: GuiaDeDespacho,
    name: "guia",
  },
  {
    path: "/pruebaCode",
    component: PruebasDeCodigo,
    name: "pruebaCode",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
