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

export interface Direccion {
  id: number;
  direccion: string;
  clientes_id: Number;
  region_id: Number;
  comuna_id: Number;
  createdAt: string;
  updatedAt: string;
  Region: any[]; // Ajusta este tipo según la estructura de direcciones si es necesario
  Comuna: any[]; // Ajusta este tipo según la estructura de direcciones si es necesario
}

export interface Region {
  id: number;
  nombre: string;
}

export interface Comuna {
  id: number;
  nombre: string;
  region_id: Number;
}
