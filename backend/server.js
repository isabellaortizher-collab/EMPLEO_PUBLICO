require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));

app.get('/api/health', (req, res) => {
  res.json({ estado: 'OK', sistema: 'SIGEP II', fecha: new Date() });
});

app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada.' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sigep_auth';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
    seedAdminUser();
  })
  .catch(err => {
    console.error('❌ Error MongoDB:', err.message);
    process.exit(1);
  });

async function seedAdminUser() {
  try {
    const Usuario = require('./models/Usuario');
    // Borra el usuario si existe y lo recrea limpio
    await Usuario.deleteOne({ numeroIdentificacion: '00000001' });
    await Usuario.create({
      tipoDocumento: 'CEDULA_CIUDADANIA',
      numeroIdentificacion: '00000001',
      correoElectronico: 'jth@entidad.gov.co',
      contrasena: 'Admin@123',
      roles: [
        { nombre: 'JEFE_TALENTO_HUMANO', activo: true },
        { nombre: 'ADMIN', activo: true }
      ],
      primerIngreso: false
    });
    console.log('👤 JTH recreado: CC 00000001 / Admin@123');
  } catch (e) {
    console.error('Error en seed:', e.message);
  }
}