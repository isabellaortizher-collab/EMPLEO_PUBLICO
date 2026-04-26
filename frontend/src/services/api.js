import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('sigep_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sigep_token');
      localStorage.removeItem('sigep_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login: (datos) => API.post('/auth/login', datos),
  recuperarContrasena: (datos) => API.post('/auth/recuperar-contrasena', datos),
  cambiarContrasena: (datos) => API.put('/auth/cambiar-contrasena', datos),
  crearUsuario: (datos) => API.post('/auth/crear-usuario', datos),
  inhabilitarRol: (id, datos) => API.put(`/auth/inhabilitar-rol/${id}`, datos),
  getMe: () => API.get('/auth/me'),
  getUsuarios: () => API.get('/auth/usuarios'),
};

export default API;