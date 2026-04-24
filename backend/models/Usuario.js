const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RolSchema = new mongoose.Schema({
  nombre: {
    type: String,
    enum: ['SERVIDOR_PUBLICO', 'JEFE_TALENTO_HUMANO', 'ADMIN'],
    required: true
  },
  activo: { type: Boolean, default: true },
  fechaInicio: { type: Date, default: Date.now },
  fechaFin: { type: Date, default: null }
});

const UsuarioSchema = new mongoose.Schema({
  tipoDocumento: {
    type: String,
    enum: ['CEDULA_CIUDADANIA', 'CEDULA_EXTRANJERIA', 'PASAPORTE', 'TARJETA_IDENTIDAD'],
    required: true
  },
  numeroIdentificacion: { type: String, required: true },
  correoElectronico: { type: String, required: true, lowercase: true, trim: true },
  contrasena: { type: String, required: true, select: false },
  roles: [RolSchema],
  activo: { type: Boolean, default: true },
  primerIngreso: { type: Boolean, default: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null }
}, { timestamps: true });

UsuarioSchema.index({ tipoDocumento: 1, numeroIdentificacion: 1 }, { unique: true });

UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

UsuarioSchema.methods.compararContrasena = async function(ingresada) {
  return await bcrypt.compare(ingresada, this.contrasena);
};

UsuarioSchema.methods.tieneRolActivo = function(nombreRol) {
  const ahora = new Date();
  return this.roles.some(r =>
    r.nombre === nombreRol && r.activo && (!r.fechaFin || r.fechaFin > ahora)
  );
};

module.exports = mongoose.model('Usuario', UsuarioSchema);