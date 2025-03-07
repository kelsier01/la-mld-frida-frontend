// Interfaz para una categoría
export interface Categoria {
    id: number;
    nombre: string;
    createdAt: string;
    updatedAt: string;
}

// Interfaz para una marca
export interface Marca {
    id: number;
    nombre: string;
    createdAt: string;
    updatedAt: string;
}

// Interfaz para una bodega
export interface Bodega {
    id: number;
    nombre: string;
    ubicacion: string;
    createdAt: string;
    updatedAt: string;
}

// Interfaz para la relación entre productos y bodegas
export interface Bodegas {
    id: number;
    productos_id: number;
    bodegas_id: number;
    stock: number;
    createdAt: string;
    updatedAt: string;
    bodega: Bodega; // Relación con Bodega (no es un array)
}

// Interfaz para una imagen de producto
export interface Imagen {
    id: number;
    productos_id: number;
    nombre: string;
    url: string;
    createdAt: string;
    updatedAt: string;
}

// Interfaz para un producto
export interface Producto {
    id: number;
    Categoria_id: number;
    marcas_id: number;
    codigo: string;
    nombre: string;
    precio_venta: number;
    Precio_compra_usd: number;
    createdAt: string;
    updatedAt: string;
    categoria: Categoria; // Relación con Categoria
    marca: Marca; // Relación con Marca
    imagenes: Imagen[]; // Relación con Imagen (array)
    bodegas: Bodegas[]; // Relación con Bodegas (array)
}

// Interfaz para la respuesta de la API al crear un producto
export interface ProductoResponse {
    id: number;
    Categoria_id: number;
    marcas_id: number;
    codigo: string;
    nombre: string;
    precio_venta: number;
    Precio_compra_usd: number;
}

// Interfaz para la bodega de productos
export interface ProductoBodega {
    productos_id: number;
    bodegas_id: number;
    stock: number;
}

export interface NuevoProducto {
    codigo: string;
    nombre: string;
    stock: number;
    precioVenta: number;
    precioCompra: number;
    bodega: number;
    categoria: number;
    marca: number;
    imagen: string | File;
}

export interface Persona {
    id: number;
    nombre: string;
    correo: string;
    n_identificacion: string;
    fono: string;
    createdAt: string;
    updatedAt: string;
  }
  
export interface Cliente {
    id: number;
    personas_id: number;
    cta_instagram: string | null;
    eliminado: boolean;
    createdAt: string;
    updatedAt: string;
    persona: Persona;
    Direccions: any[]; // Ajusta este tipo según la estructura de direcciones si es necesario
  }

  export  interface EstadoPedido {
    id: number;
    estado_pedido: string;
    createdAt: string;
    updatedAt: string;
  }

//   export interface Pedido {
//     id: number;
//     empleados_id: number;
//     clientes_id: number;
//     estado_pedidos_id: number;
//     deliverys_id: number;
//     monto_total: number;
//     documento_usa_id: number;
//     n_despacho_chile: string;
//     comprobante_ventas_id: number;
//     createdAt: string;
//     updatedAt: string;
//     empleado: Empleado;
//     cliente: Cliente;
//     estadoPedido: EstadoPedido;
//     delivery: Delivery;
//     documentoUsa: DocumentoUsa;
//     comprobanteVenta: ComprobanteVenta;
//   }

export interface Empleado {
    id: number;
    personas_id: number;
    usuarios_id: number;
    eliminado: boolean;
    createdAt: string;
    updatedAt: string;
    persona: Persona;
}

export interface Delivery{
    id: number;
    empresa: string;
    createdAt: string;
    updatedAt: string;
}

export interface GuiaDespacho{
    id: number;
    codigo: string;
    estados_id: number;
    createdAt: string;
    updatedAt: string;
}

export interface ComprobanteVenta {
    id: number;
    codigo: string;
    estados_id: number;
    createdAt: string;
    updatedAt: string;
}

export interface Pedido {
    id: number;
    empleados_id: number;
    clientes_id: number;
    estado_pedidos_id: number;
    deliverys_id: number;
    monto_total: number;
    documento_usa_id: number;
    n_despacho_chile: string | null;
    comprobante_ventas_id: number;
    createdAt: string;
    updatedAt: string;
    empleado: Empleado;
    cliente: Cliente;
    estadoPedido: EstadoPedido;
    delivery: Delivery;
    documentoUsa: GuiaDespacho;
    comprobanteVenta: ComprobanteVenta;
}

export interface DetallePedido {
    id: number;
    pedidos_id: number;
    productos_id: number;
    cantidad: number;
    precio_venta: number;
    precio_compra_clp: number;
    precio_compra_usd: number;
    precio_compra_guia: number;
    adicional: string | null;
    bodegas_id: number;
    createdAt: string;
    updatedAt: string;
    Pedido: Pedido;
    Producto: Producto;
    Bodega: Bodega;
  }

  export interface LogEstadoPedido {
    id: number;
    pedidos_id: number;
    estado_pedidos_id: number;
    empleados_id: number;
    createdAt: string;
    updatedAt: string;
    estado: EstadoPedido;
  }

  export interface Pago {
    id: number;
    pedidos_id: number;
    monto: number;
    fecha_pago: string;
    pago_parcializado: boolean;
    metodos_pago_id: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface Abono {
    id: number;
    pagos_id: number;
    monto: number;
    fecha: string;
    metodos_pago_id: number;
    empleados_id: number;
    createdAt: string;
    updatedAt: string;
    Pago: Pago;
  }

  export interface MetodoPago {
    id: number;
    nombre: string;
    createdAt: string;
    updatedAt: string;
  }

