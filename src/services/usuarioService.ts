import axios from "axios";
import { useLoginStore } from "@/stores/loginStore";
import { Usuario } from "@/interfaces/interfaces";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todos los productos
const getAllUsuarios = async () => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.get(`${API_URL}/usuario`, {
      headers: { "x-token": token },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes", error);
    throw new Error("No se pudo cargar la lista de clientes");
  }
};

// Obtener un producto por ID
const getUsuarioById = async (id: number) => {
  const loginStore = useLoginStore(); // Obtén el store de login
  const token = String(loginStore.token); // Obtén el token actualizado

  try {
    const response = await axios.get(`${API_URL}/usuario/${id}`, {
      headers: {
        "x-token": token, // Usa el token actualizado
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener el usuario", error);
    throw new Error("No se pudo cargar el usuario");
  }
};

const createUsuario = async (usuario: any) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.post(`${API_URL}/usuario`, usuario, {
      headers: { "x-token": token },
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear usuario", error);
    throw new Error("No se pudo crear el usuario");
  }
};

// Actualizar un usuario existente
const updateUsuario = async (id: number, usuario: Partial<Usuario>) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.put(`${API_URL}/usuario/${id}`, usuario, {
      headers: { "x-token": token },
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar usuario", error);
    throw new Error("No se pudo actualizar el usuario");
  }
};

// Eliminar un usuario
const deleteUsuario = async (id: number) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.delete(`${API_URL}/usuario/${id}`, {
      headers: { "x-token": token },
    });
    return response.data;
  } catch (error) {
    console.error("Error al eliminar usuario", error);
    throw new Error("No se pudo eliminar el usuario");
  }
};

// Cambiar estado del usuario (activar/desactivar)
const toggleUsuarioStatus = async (id: number, isActive: boolean) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.patch(
      `${API_URL}/usuario/${id}/status`,
      { isActive },
      { headers: { "x-token": token } }
    );
    return response.data;
  } catch (error) {
    console.error("Error al cambiar estado del usuario", error);
    throw new Error("No se pudo cambiar el estado del usuario");
  }
};

// Cambiar contraseña
const changePassword = async (id: number, newPassword: string) => {
  const loginStore = useLoginStore();
  const token = String(loginStore.token);

  try {
    const response = await axios.patch(
      `${API_URL}/usuario/${id}/password`,
      { password: newPassword },
      { headers: { "x-token": token } }
    );
    return response.data;
  } catch (error) {
    console.error("Error al cambiar contraseña", error);
    throw new Error("No se pudo cambiar la contraseña");
  }
};

// Exportar todos los métodos
export default {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  toggleUsuarioStatus,
  changePassword,
};
