import axios from "axios";
import { NuevoProducto, Producto } from "../interfaces/interfaces";
import { useLoginStore } from "@/stores/loginStore";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todos los productos
const getProductos = async (
  page: number,
  categoriaId: number,
  marcasId: number,
  bodegaId: number,
  search: string
) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  console.log(
    `page ${page}, categoriaId ${categoriaId}, marcasId ${marcasId}, bodegaId ${bodegaId}, search ${search}`
  );

  try {
    const response = await axios.get(`${API_URL}/producto`, {
      headers: { "x-token": token },
      params: { page, categoriaId, marcasId, bodegaId, search },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

// Obtener un producto por ID
const getProductoById = async (id: string) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado
  let producto: Producto;

  try {
    const response = await axios.get(`${API_URL}/producto/${id}`, {
      headers: {
        "x-token": token, // Usa el token actualizado
      },
    });
    producto = response.data;
    console.log("producto por id", response.data);
    return producto;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

// Crear un nuevo producto
const postProducto = async (producto: NuevoProducto) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado

  try {
    // Crear el producto
    const productoResponse = await axios.post(
      `${API_URL}/producto`,
      {
        Categoria_id: producto.categoria,
        marcas_id: producto.marca,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio_venta: producto.precioVenta,
        Precio_compra_usd: producto.precioCompra,
      },
      {
        headers: {
          "x-token": token, // Usa el token actualizado
        },
      }
    );

    const productoId = productoResponse.data.id;

    // Registrar el producto en la bodega
    await axios.post(
      `${API_URL}/productoBodega`,
      {
        productos_id: productoId,
        bodegas_id: producto.bodega,
        stock: producto.stock,
      },
      {
        headers: {
          "x-token": token, // Usa el token actualizado
        },
      }
    );

    // Subir la imagen del producto
    if (producto.imagen) {
      const formData = new FormData();
      formData.append("productos_id", productoId.toString());
      formData.append("nombre", producto.nombre);
      formData.append("imagen", producto.imagen);

      await axios.post(`${API_URL}/productoImagen`, formData, {
        headers: {
          "x-token": token, // Usa el token actualizado
          "Content-Type": "multipart/form-data",
        },
      });
    }

    console.log("Producto registrado correctamente");
    return productoId;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

const actualizarProducto = async (producto: any) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado

  try {
    // Actualizar el producto
    const productoResponse = await axios.put(
      `${API_URL}/producto/${producto.id}`,
      {
        Categoria_id: producto.Categoria_id,
        marcas_id: producto.marcas_id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio_venta: producto.precio_venta,
        Precio_compra_usd: producto.Precio_compra_usd,
      },
      {
        headers: {
          "x-token": token, // Usa el token actualizado
        },
      }
    );

    return productoResponse.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
}

//hacer put en eliminado
const eliminarProducto = async (id: number) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado

  try {
    const response = await axios.put(
      `${API_URL}/producto/${id}`,
      {
        eliminado: 1,
      },
      {
        headers: {
          "x-token": token, // Usa el token actualizado
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  } 
}

// Exportar todos los métodos
export default {
  getProductos,
  getProductoById,
  postProducto,
  actualizarProducto,
  eliminarProducto,
};
