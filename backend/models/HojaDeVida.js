const mongoose = require("mongoose");


const FormacionAcademicaSchema = new mongoose.Schema({
  nivel: {
    type: String,
    enum: ["PREGRADO", "ESPECIALIZACION", "MAESTRIA", "DOCTORADO", "POSDOCTORADO"],
    required: true,
  },
  tituloObtenido: { type: String, required: true },
  institucion: { type: String, required: true },
  paisInstitucion: { type: String, required: true },
  fechaGrado: { type: Date },
  tarjetaProfesional: { type: String, default: "" },
  soporteUrl: { type: String, default: "" },         
  validado: { type: Boolean, default: false },
});

const ExperienciaLaboralSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ["PUBLICA", "PRIVADA", "DOCENTE"],
    required: true,
  },
  entidadEmpresa: { type: String, required: true },
  cargo: { type: String, required: true },
  fechaIngreso: { type: Date, required: true },
  fechaRetiro: { type: Date },              
  trabajoActual: { type: Boolean, default: false },
  descripcionFunciones: { type: String, default: "" },
  soporteUrl: { type: String, default: "" },
  validado: { type: Boolean, default: false },
});

const GerenciaPublicaSchema = new mongoose.Schema({
  nivelDirectivo: { type: String, default: "" },
  entidad: { type: String, default: "" },
  cargo: { type: String, default: "" },
  fechaIngreso: { type: Date },
  fechaRetiro: { type: Date },
  soporteUrl: { type: String, default: "" },
  validado: { type: Boolean, default: false },
});


const HojaDeVidaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true,
    },

    datosPersonales: {
      nombres: { type: String, default: "" },
      apellidos: { type: String, default: "" },
      tipoDocumento: { type: String, default: "" },
      numeroDocumento: { type: String, default: "" },
      fechaNacimiento: { type: Date },
      genero: {
        type: String,
        enum: ["MASCULINO", "FEMENINO", "NO_BINARIO", "PREFIERO_NO_DECIR", ""],
        default: "",
      },
      correoElectronico: { type: String, default: "" },
      celular: { type: String, default: "" },
      telefono: { type: String, default: "" },
      tipoZona: { type: String, enum: ["URBANA", "RURAL", ""], default: "" },
      departamento: { type: String, default: "" },
      municipio: { type: String, default: "" },
      direccion: { type: String, default: "" },
      complementoDireccion: { type: String, default: "" },
      validado: { type: Boolean, default: false },
    },


    formacionAcademica: [FormacionAcademicaSchema],


    experienciaLaboral: [ExperienciaLaboralSchema],

    
    tieneGerenciaPublica: { type: Boolean, default: false },
    gerenciaPublica: [GerenciaPublicaSchema],


    seccionesGuardadas: {
      datosPersonales: { type: Boolean, default: false },
      formacionAcademica: { type: Boolean, default: false },
      experienciaLaboral: { type: Boolean, default: false },
      gerenciaPublica: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HojaDeVida", HojaDeVidaSchema);