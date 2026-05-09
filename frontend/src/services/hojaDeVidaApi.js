import API from './api';


export const getProgreso = () => API.get('/hoja-de-vida/progreso');


export const getDatosPersonales = () => API.get('/hoja-de-vida/datos-personales');
export const guardarDatosPersonales = (datos) =>
  API.put('/hoja-de-vida/datos-personales', datos);


export const getFormacionAcademica = () => API.get('/hoja-de-vida/formacion-academica');
export const agregarFormacion = (formData) =>
  API.post('/hoja-de-vida/formacion-academica', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const eliminarFormacion = (itemId) =>
  API.delete(`/hoja-de-vida/formacion-academica/${itemId}`);


export const getExperienciaLaboral = () => API.get('/hoja-de-vida/experiencia-laboral');
export const agregarExperiencia = (formData) =>
  API.post('/hoja-de-vida/experiencia-laboral', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const eliminarExperiencia = (itemId) =>
  API.delete(`/hoja-de-vida/experiencia-laboral/${itemId}`);


export const getGerenciaPublica = () => API.get('/hoja-de-vida/gerencia-publica');
export const agregarGerencia = (formData) =>
  API.post('/hoja-de-vida/gerencia-publica', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });


export const descargarHojaDeVida = () => API.get('/hoja-de-vida/descargar');


export const habilitarGerencia = (usuarioId, habilitar) =>
  API.put(`/hoja-de-vida/admin/habilitar-gerencia/${usuarioId}`, { habilitar });
export const validarSeccion = (usuarioId, seccion, validar) =>
  API.put(`/hoja-de-vida/admin/validar/${usuarioId}`, { seccion, validar });