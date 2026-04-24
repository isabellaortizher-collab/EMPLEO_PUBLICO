const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

exports.proteger = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ mensaje: 'No autorizado. Token requerido.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario || !usuario.activo)
      return res.status(401).json({ mensaje: 'Usuario no encontrado o inactivo.' });

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ mensaje: 'Sesión expirada. Inicie sesión nuevamente.' });
    return res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

exports.requiereRol = (...roles) => (req, res, next) => {
  const tieneRol = roles.some(rol => req.usuario.tieneRolActivo(rol));
  if (!tieneRol)
    return res.status(403).json({ mensaje: 'No tiene permisos para esta acción.' });
  next();
};