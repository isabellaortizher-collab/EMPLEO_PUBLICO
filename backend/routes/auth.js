const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { proteger, requiereRol } = require('../middleware/auth');
const { enviarCorreoRecuperacion } = require('../utils/email');

const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

const generarContrasenaAleatoria = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const especiales = '!@#$%';
  let pass = '';
  for (let i = 0; i < 7; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  pass += especiales[Math.floor(Math.random() * especiales.length)];
  return pass.split('').sort(() => Math.random() - 0.5).join('');
};

const validarContrasena = (p) =>
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+]).{6,}$/.test(p);

// HU-001: Login
router.post('/login', async (req, res) => {
  try {
    const { tipoDocumento, numeroIdentificacion, contrasena } = req.body;
    if (!tipoDocumento || !numeroIdentificacion || !contrasena)
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });

    const usuario = await Usuario.findOne({ tipoDocumento, numeroIdentificacion }).select('+contrasena');
    if (!usuario || !usuario.activo)
      return res.status(401).json({ mensaje: 'Credenciales inválidas o usuario inactivo.' });

    const ahora = new Date();
    const rolesActivos = usuario.roles.filter(r => r.activo && (!r.fechaFin || r.fechaFin > ahora));
    if (rolesActivos.length === 0)
      return res.status(403).json({ mensaje: 'Sin roles activos. Contacte al Jefe de Talento Humano.' });

    const ok = await usuario.compararContrasena(contrasena);
    if (!ok) return res.status(401).json({ mensaje: 'Credenciales inválidas.' });

    const token = generarToken(usuario._id);
    res.json({
      mensaje: 'Sesión iniciada.',
      token,
      usuario: {
        id: usuario._id,
        tipoDocumento: usuario.tipoDocumento,
        numeroIdentificacion: usuario.numeroIdentificacion,
        correoElectronico: usuario.correoElectronico,
        roles: rolesActivos.map(r => r.nombre),
        primerIngreso: usuario.primerIngreso
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// HU-002: Recuperar contraseña
router.post('/recuperar-contrasena', async (req, res) => {
  try {
    const { tipoDocumento, numeroIdentificacion } = req.body;
    const respuesta = { mensaje: 'Si el usuario existe, recibirá una nueva contraseña en su correo.' };
    if (!tipoDocumento || !numeroIdentificacion) return res.json(respuesta);

    const usuario = await Usuario.findOne({ tipoDocumento, numeroIdentificacion });
    if (!usuario || !usuario.activo) return res.json(respuesta);

    const nuevaContrasena = generarContrasenaAleatoria();
    usuario.contrasena = nuevaContrasena;
    usuario.primerIngreso = true;
    await usuario.save();

    try {
      await enviarCorreoRecuperacion({ correo: usuario.correoElectronico, nuevaContrasena });
    } catch (e) {
      console.error('Error enviando correo:', e);
    }
    res.json(respuesta);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// HU-003: Cambiar contraseña
router.put('/cambiar-contrasena', proteger, async (req, res) => {
  try {
    const { contrasenaActual, nuevaContrasena, confirmarContrasena } = req.body;
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena)
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    if (nuevaContrasena !== confirmarContrasena)
      return res.status(400).json({ mensaje: 'Las contraseñas nuevas no coinciden.' });
    if (!validarContrasena(nuevaContrasena))
      return res.status(400).json({ mensaje: 'La contraseña debe tener mínimo 6 caracteres, letras, números y al menos un carácter especial.' });

    const usuario = await Usuario.findById(req.usuario._id).select('+contrasena');
    const ok = await usuario.compararContrasena(contrasenaActual);
    if (!ok) return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta.' });

    usuario.contrasena = nuevaContrasena;
    usuario.primerIngreso = false;
    await usuario.save();
    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (e) {
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// HU-004: Crear usuario (JTH)
router.post('/crear-usuario', proteger, requiereRol('JEFE_TALENTO_HUMANO', 'ADMIN'), async (req, res) => {
  try {
    const { tipoDocumento, numeroIdentificacion, correoElectronico, rol } = req.body;
    if (!tipoDocumento || !numeroIdentificacion || !correoElectronico)
      return res.status(400).json({ mensaje: 'Tipo de documento, número e identificación y correo son obligatorios.' });

    const existe = await Usuario.findOne({ tipoDocumento, numeroIdentificacion });
    if (existe) return res.status(409).json({ mensaje: 'Ya existe un usuario con ese documento.' });

    const contrasenaInicial = numeroIdentificacion + '@Sigep1';
    const nuevoUsuario = await Usuario.create({
      tipoDocumento, numeroIdentificacion, correoElectronico,
      contrasena: contrasenaInicial,
      roles: [{ nombre: rol || 'SERVIDOR_PUBLICO', activo: true }],
      primerIngreso: true,
      creadoPor: req.usuario._id
    });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente.',
      usuario: {
        id: nuevoUsuario._id,
        tipoDocumento: nuevoUsuario.tipoDocumento,
        numeroIdentificacion: nuevoUsuario.numeroIdentificacion,
        correoElectronico: nuevoUsuario.correoElectronico,
        roles: nuevoUsuario.roles.map(r => r.nombre),
        contrasenaInicial
      }
    });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ mensaje: 'Ya existe un usuario con ese documento.' });
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// HU-005: Inhabilitar rol (JTH)
router.put('/inhabilitar-rol/:usuarioId', proteger, requiereRol('JEFE_TALENTO_HUMANO', 'ADMIN'), async (req, res) => {
  try {
    const { nombreRol, fechaFin } = req.body;
    if (!nombreRol) return res.status(400).json({ mensaje: 'El nombre del rol es obligatorio.' });

    const usuario = await Usuario.findById(req.params.usuarioId);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

    const rol = usuario.roles.find(r => r.nombre === nombreRol && r.activo);
    if (!rol) return res.status(404).json({ mensaje: `El usuario no tiene el rol activo: ${nombreRol}` });

    rol.activo = false;
    rol.fechaFin = fechaFin ? new Date(fechaFin) : new Date();

    if (usuario.roles.filter(r => r.activo).length === 0) usuario.activo = false;

    await usuario.save();
    res.json({ mensaje: `Rol ${nombreRol} inhabilitado correctamente.`, usuario });
  } catch (e) {
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// GET /me
router.get('/me', proteger, async (req, res) => {
  const u = req.usuario;
  const ahora = new Date();
  res.json({
    id: u._id,
    tipoDocumento: u.tipoDocumento,
    numeroIdentificacion: u.numeroIdentificacion,
    correoElectronico: u.correoElectronico,
    roles: u.roles.filter(r => r.activo && (!r.fechaFin || r.fechaFin > ahora)).map(r => r.nombre),
    primerIngreso: u.primerIngreso
  });
});

// GET /usuarios (JTH)
router.get('/usuarios', proteger, requiereRol('JEFE_TALENTO_HUMANO', 'ADMIN'), async (req, res) => {
  try {
    const usuarios = await Usuario.find({}).select('-__v');
    res.json(usuarios);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error obteniendo usuarios.' });
  }
});

module.exports = router;