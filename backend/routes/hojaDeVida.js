const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { proteger } = require("../middleware/auth");
const HojaDeVida = require("../models/HojaDeVida");
const Usuario = require("../models/Usuario");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.usuario.id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos PDF o JPG"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, 
});


async function obtenerOCrearHV(usuarioId) {
  let hv = await HojaDeVida.findOne({ usuario: usuarioId });
  if (!hv) {
    hv = await HojaDeVida.create({ usuario: usuarioId });
  }
  return hv;
}


router.get("/datos-personales", proteger, async (req, res) => {
  try {
    const hv = await obtenerOCrearHV(req.usuario.id);
    res.json({ ok: true, datos: hv.datosPersonales, guardado: hv.seccionesGuardadas.datosPersonales });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener datos personales" });
  }
});


router.put("/datos-personales", proteger, async (req, res) => {
  try {
    const hv = await obtenerOCrearHV(req.usuario.id);

  
    if (hv.datosPersonales.validado) {
      return res.status(403).json({
        ok: false,
        mensaje: "Esta sección ya fue validada. Contacte al JTH para hacer modificaciones.",
      });
    }

    const {
      nombres, apellidos, tipoDocumento, numeroDocumento,
      fechaNacimiento, genero, correoElectronico, celular, telefono,
      tipoZona, departamento, municipio, direccion, complementoDireccion,
    } = req.body;

    // Campos obligatorios (HU-012)
    if (!nombres || !apellidos || !tipoDocumento || !numeroDocumento || !fechaNacimiento || !genero || !correoElectronico) {
      return res.status(400).json({ ok: false, mensaje: "Faltan campos obligatorios." });
    }

    hv.datosPersonales = {
      ...hv.datosPersonales,
      nombres, apellidos, tipoDocumento, numeroDocumento,
      fechaNacimiento, genero, correoElectronico, celular, telefono,
      tipoZona, departamento, municipio, direccion, complementoDireccion,
      validado: hv.datosPersonales.validado,
    };
    hv.seccionesGuardadas.datosPersonales = true; // HU-011
    await hv.save();

    res.json({ ok: true, mensaje: "Datos personales guardados correctamente." });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al guardar datos personales." });
  }
});


router.get("/formacion-academica", proteger, async (req, res) => {
  try {
    const hv = await obtenerOCrearHV(req.usuario.id);
    res.json({ ok: true, formacion: hv.formacionAcademica, guardado: hv.seccionesGuardadas.formacionAcademica });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener formación académica." });
  }
});


router.post(
  "/formacion-academica",
  proteger,
  upload.single("soporte"),
  async (req, res) => {
    try {
      const hv = await obtenerOCrearHV(req.usuario.id);
      const { nivel, tituloObtenido, institucion, paisInstitucion, fechaGrado, tarjetaProfesional } = req.body;

      if (!nivel || !tituloObtenido || !institucion || !paisInstitucion) {
        return res.status(400).json({ ok: false, mensaje: "Faltan campos obligatorios." });
      }

      const nueva = {
        nivel, tituloObtenido, institucion, paisInstitucion,
        fechaGrado: fechaGrado || null,
        tarjetaProfesional: tarjetaProfesional || "",
        soporteUrl: req.file
        ? `/api/hoja-de-vida/soporte/${req.file.filename}`: "",
      };

      hv.formacionAcademica.push(nueva);
      hv.seccionesGuardadas.formacionAcademica = true;
      await hv.save();

      res.json({ ok: true, mensaje: "Formación académica agregada.", item: nueva });
    } catch (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ ok: false, mensaje: "El archivo excede 2 MB." });
      }
      res.status(500).json({ ok: false, mensaje: "Error al agregar formación académica." });
    }
  }
);


router.delete("/formacion-academica/:itemId", proteger, async (req, res) => {
  try {
    const hv = await obtenerOCrearHV(req.usuario.id);
    const item = hv.formacionAcademica.id(req.params.itemId);
    if (!item) return res.status(404).json({ ok: false, mensaje: "Registro no encontrado." });
    if (item.validado) return res.status(403).json({ ok: false, mensaje: "No se puede eliminar un registro validado." });

    item.deleteOne();
    await hv.save();
    res.json({ ok: true, mensaje: "Registro eliminado." });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al eliminar formación." });
  }
});


router.get("/experiencia-laboral", proteger, async (req, res) => {
  try {
    const hv = await obtenerOCrearHV(req.usuario.id);
    res.json({ ok: true, experiencia: hv.experienciaLaboral, guardado: hv.seccionesGuardadas.experienciaLaboral });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener experiencia laboral." });
  }
});


router.post(
  "/experiencia-laboral",
  proteger,
  upload.single("soporte"),
  async (req, res) => {
    try {
      const hv = await obtenerOCrearHV(req.usuario.id);
      const { tipo, entidadEmpresa, cargo, fechaIngreso, fechaRetiro, trabajoActual, descripcionFunciones } = req.body;

      if (!tipo || !entidadEmpresa || !cargo || !fechaIngreso) {
        return res.status(400).json({ ok: false, mensaje: "Faltan campos obligatorios." });
      }

      const nueva = {
        tipo,
        entidadEmpresa,
        cargo,
        fechaIngreso,
        fechaRetiro: trabajoActual === "true" ? null : fechaRetiro || null,
        trabajoActual: trabajoActual === "true",
        descripcionFunciones: descripcionFunciones || "",
        soporteUrl: req.file
        ? `/api/hoja-de-vida/soporte/${req.file.filename}`: "",
      };

      hv.experienciaLaboral.push(nueva);
      hv.seccionesGuardadas.experienciaLaboral = true;
      await hv.save();

      res.json({ ok: true, mensaje: "Experiencia laboral agregada.", item: nueva });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al agregar experiencia laboral." });
    }
  }
);


router.delete("/experiencia-laboral/:itemId", proteger, async (req, res) => {
  try {
    const hv = await obtenerOCrearHV(req.usuario.id);
    const item = hv.experienciaLaboral.id(req.params.itemId);
    if (!item) return res.status(404).json({ ok: false, mensaje: "Registro no encontrado." });
    if (item.validado) return res.status(403).json({ ok: false, mensaje: "No se puede eliminar un registro validado." });

    item.deleteOne();
    await hv.save();
    res.json({ ok: true, mensaje: "Registro eliminado." });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al eliminar experiencia." });
  }
});


router.get("/gerencia-publica", proteger, async (req, res) => {
  try {
    const hv = await obtenerOCrearHV(req.usuario.id);
    res.json({
      ok: true,
      habilitado: hv.tieneGerenciaPublica,
      gerencia: hv.gerenciaPublica,
      guardado: hv.seccionesGuardadas.gerenciaPublica,
    });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener gerencia pública." });
  }
});

router.post(
  "/gerencia-publica",
  proteger,
  upload.single("soporte"),
  async (req, res) => {
    try {
      const hv = await obtenerOCrearHV(req.usuario.id);

      if (!hv.tieneGerenciaPublica) {
        return res.status(403).json({ ok: false, mensaje: "La sección de Gerencia Pública no está habilitada para su cargo." });
      }

      const { nivelDirectivo, entidad, cargo, fechaIngreso, fechaRetiro } = req.body;

      const nueva = {
        nivelDirectivo: nivelDirectivo || "",
        entidad: entidad || "",
        cargo: cargo || "",
        fechaIngreso: fechaIngreso || null,
        fechaRetiro: fechaRetiro || null,
        soporteUrl: req.file
          ? `/api/hoja-de-vida/soporte/${req.file.filename}`
              : "",
      };

      hv.gerenciaPublica.push(nueva);
      hv.seccionesGuardadas.gerenciaPublica = true;
      await hv.save();

      res.json({ ok: true, mensaje: "Registro de gerencia pública agregado.", item: nueva });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: "Error al agregar gerencia pública." });
    }
  }
);


router.get("/soporte/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, mensaje: "Archivo no encontrado." });
  }
  res.sendFile(filePath);
});


router.get("/descargar", proteger, async (req, res) => {
  try {
    const hv = await HojaDeVida.findOne({ usuario: req.usuario.id }).lean();
    if (!hv) return res.status(404).json({ ok: false, mensaje: "Hoja de vida no encontrada." });
    res.json({ ok: true, hojaDeVida: hv });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener la hoja de vida." });
  }
});


router.get("/progreso", proteger, async (req, res) => {
  try {
    const hv = await obtenerOCrearHV(req.usuario.id);
    res.json({ ok: true, seccionesGuardadas: hv.seccionesGuardadas, tieneGerenciaPublica: hv.tieneGerenciaPublica });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al obtener progreso." });
  }
});


router.put("/admin/habilitar-gerencia/:usuarioId", proteger, async (req, res) => {
  try {
    const rolActivo = req.usuario.roles?.some((r) => r.nombre === "JEFE_TALENTO_HUMANO" && r.activo);
    if (!rolActivo) return res.status(403).json({ ok: false, mensaje: "No autorizado." });

    const hv = await HojaDeVida.findOne({ usuario: req.params.usuarioId });
    if (!hv) return res.status(404).json({ ok: false, mensaje: "Hoja de vida no encontrada." });

    hv.tieneGerenciaPublica = req.body.habilitar === true;
    await hv.save();
    res.json({ ok: true, mensaje: `Gerencia pública ${hv.tieneGerenciaPublica ? "habilitada" : "deshabilitada"}.` });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al actualizar gerencia pública." });
  }
});


router.put("/admin/validar/:usuarioId", proteger, async (req, res) => {
  try {
    const rolActivo = req.usuario.roles?.some((r) => r.nombre === "JEFE_TALENTO_HUMANO" && r.activo);
    if (!rolActivo) return res.status(403).json({ ok: false, mensaje: "No autorizado." });

    const { seccion, validar } = req.body;
    const secciones = ["datosPersonales", "formacionAcademica", "experienciaLaboral", "gerenciaPublica"];
    if (!secciones.includes(seccion)) return res.status(400).json({ ok: false, mensaje: "Sección inválida." });

    const hv = await HojaDeVida.findOne({ usuario: req.params.usuarioId });
    if (!hv) return res.status(404).json({ ok: false, mensaje: "Hoja de vida no encontrada." });

    if (seccion === "datosPersonales") {
      hv.datosPersonales.validado = validar;
    } else {
      hv[seccion].forEach((item) => { item.validado = validar; });
    }
    await hv.save();
    res.json({ ok: true, mensaje: `Sección ${seccion} ${validar ? "validada" : "desbloqueada"}.` });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: "Error al validar sección." });
  }
});

module.exports = router;