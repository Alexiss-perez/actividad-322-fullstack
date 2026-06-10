import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 1. Obtener todos los productos del inventario
export const obtenerProductos = async () => {
    const respuesta = await axios.get(`${API_URL}/productos`);
    return respuesta.data;
};

// 2. Iniciar sesión (Login) para obtener el token
export const iniciarSesion = async (email, password) => {
    const respuesta = await axios.post(`${API_URL}/auth/login`, { email, password });
    return respuesta.data; // Retorna { token, usuario }
};

// 3. Crear un pedido protegido (Requiere pasar el Token obtenido)
export const crearPedido = async (datosPedido, token) => {
    const respuesta = await axios.post(`${API_URL}/pedidos`, datosPedido, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return respuesta.data;
};