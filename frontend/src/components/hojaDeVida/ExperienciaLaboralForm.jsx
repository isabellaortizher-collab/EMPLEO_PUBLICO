import React, { useEffect, useState, useRef } from "react";
import {
  getExperienciaLaboral,
  agregarExperiencia,
  eliminarExperiencia,
} from "../../services/hojaDeVidaApi";

const TIPOS = [
  { value: "PUBLICA", label: "Pública" },
  { value: "PRIVADA", label: "Privada" },
  { value: "DOCENTE", label: "Docente" },
];

const INITIAL_FORM = {
  tipo: "",
  entidadEmpresa: "",
  cargo: "",
  fechaIngreso: "",
  fechaRetiro: "",
  trabajoActual: false,
  descripcionFunciones: "",
};

export default function ExperienciaLaboralForm({ onGuardado }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const { data } = await getExperienciaLaboral();

      if (data.ok) {
        setLista(data.experiencia || []);
      }
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: "Error al cargar experiencia laboral.",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArchivo = (e) => {
    const f = e.target.files[0];

    if (!f) return;

    // Validación tamaño máximo 2MB
    if (f.size > 2 * 1024 * 1024) {
      setMensaje({
        tipo: "error",
        texto: "El archivo excede el límite de 2 MB.",
      });

      e.target.value = "";
      return;
    }

    // Validación formatos permitidos
    if (
      ![
        "application/pdf",
        "image/jpeg",
        "image/jpg",
      ].includes(f.type)
    ) {
      setMensaje({
        tipo: "error",
        texto: "Solo se permiten archivos PDF o JPG.",
      });

      e.target.value = "";
      return;
    }

    setArchivo(f);
    setMensaje(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setGuardando(true);
    setMensaje(null);

    try {
      const fd = new FormData();

      fd.append("tipo", form.tipo);
      fd.append("entidadEmpresa", form.entidadEmpresa);
      fd.append("cargo", form.cargo);
      fd.append("fechaIngreso", form.fechaIngreso);

      fd.append(
        "fechaRetiro",
        form.trabajoActual ? "" : form.fechaRetiro
      );

      fd.append("trabajoActual", form.trabajoActual);

      fd.append(
        "descripcionFunciones",
        form.descripcionFunciones
      );

      if (archivo) {
        fd.append("soporte", archivo);
      }

      const { data } = await agregarExperiencia(fd);

      setMensaje({
        tipo: "exito",
        texto: data.mensaje,
      });

      setForm(INITIAL_FORM);
      setArchivo(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      setMostrarForm(false);

      await cargar();

      if (onGuardado) {
        onGuardado();
      }
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto:
          err.response?.data?.mensaje ||
          "Error al guardar.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Eliminar este registro?"
    );

    if (!confirmar) return;

    try {
      await eliminarExperiencia(id);

      await cargar();

      if (onGuardado) {
        onGuardado();
      }
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto:
          err.response?.data?.mensaje ||
          "Error al eliminar.",
      });
    }
  };

const verDocumento = (url) => {

  if (!url) {
    setMensaje({
      tipo: "error",
      texto: "No se encontró el documento adjunto.",
    });
    return;
  }
  const backendUrl = "http://localhost:5000";
  const archivoUrl = `${backendUrl}${url}`;
  console.log("Documento:", archivoUrl);
  window.open(archivoUrl, "_blank");
};
  const formatFecha = (fecha) => {
    if (!fecha) return "Actualmente";

    return new Date(fecha).toLocaleDateString("es-CO");
  };

  if (cargando) {
    return (
      <div className="hv-form-loading">
        Cargando…
      </div>
    );
  }

  return (
    <div className="hv-form-card">

      <div className="hv-form-header">
        <h3>Experiencia Laboral</h3>

        <p className="hv-form-sub">
          Incluye experiencia pública, privada y docente
          con sus certificaciones.

          Los campos marcados con{" "}
          <span className="obligatorio">*</span>
          son obligatorios.
        </p>
      </div>

      {/* ========================= */}
      {/* LISTADO EXPERIENCIAS */}
      {/* ========================= */}

      {lista.length > 0 && (
        <div className="hv-lista">

          {lista.map((item) => (
            <div
              key={item._id}
              className={`hv-lista-item ${
                item.validado ? "validado" : ""
              }`}
            >

              <div className="hv-lista-info">

                <span
                  className={`hv-lista-badge tipo-${item.tipo.toLowerCase()}`}
                >
                  {item.tipo}
                </span>

                <strong>{item.cargo}</strong>

                <span>
                  {item.entidadEmpresa}
                </span>

                <span className="hv-lista-fecha">
                  {formatFecha(item.fechaIngreso)}
                  {" → "}
                  {item.trabajoActual
                    ? "Actualmente"
                    : formatFecha(item.fechaRetiro)}
                </span>

                {item.descripcionFunciones && (
                  <p className="hv-lista-desc">
                    {item.descripcionFunciones}
                  </p>
                )}
              </div>

              <div className="hv-lista-acciones">

                {/* ========================= */}
                {/* HU-014 Mostrar documento */}
                {/* ========================= */}

                {item.soporteUrl && (
                  <button
                    type="button"
                    className="hv-btn-soporte"
                    onClick={() =>
                      verDocumento(item.soporteUrl)
                    }
                  >
                    Mostrar documento
                  </button>
                )}

                {!item.validado && (
                  <button
                    type="button"
                    className="hv-btn-eliminar"
                    onClick={() =>
                      handleEliminar(item._id)
                    }
                  >
                    Eliminar
                  </button>
                )}

                {item.validado && (
                  <span className="hv-badge-validado-sm">
                    Validado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {lista.length === 0 && !mostrarForm && (
        <p className="hv-lista-vacia">
          Aún no has registrado experiencia laboral.
        </p>
      )}

      {!mostrarForm && (
        <button
          type="button"
          className="hv-btn-agregar"
          onClick={() => {
            setMostrarForm(true);
            setMensaje(null);
          }}
        >
          + Agregar experiencia
        </button>
      )}

      {mostrarForm && (
        <form
          className="hv-form hv-form-nuevo"
          onSubmit={handleSubmit}
        >

          <div className="hv-form-nuevo-titulo">
            Nueva experiencia laboral
          </div>

          <div className="hv-form-row">

            <div className="hv-field">
              <label>
                Tipo de experiencia{" "}
                <span className="obligatorio">*</span>
              </label>

              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
              >
                <option value="">
                  Seleccione…
                </option>

                {TIPOS.map((t) => (
                  <option
                    key={t.value}
                    value={t.value}
                  >
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hv-field">
              <label>
                Entidad / Empresa{" "}
                <span className="obligatorio">*</span>
              </label>

              <input
                name="entidadEmpresa"
                value={form.entidadEmpresa}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="hv-field">
            <label>
              Cargo desempeñado{" "}
              <span className="obligatorio">*</span>
            </label>

            <input
              name="cargo"
              value={form.cargo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="hv-form-row">

            <div className="hv-field">
              <label>
                Fecha de ingreso{" "}
                <span className="obligatorio">*</span>
              </label>

              <input
                type="date"
                name="fechaIngreso"
                value={form.fechaIngreso}
                onChange={handleChange}
                required
              />
            </div>

            {!form.trabajoActual && (
              <div className="hv-field">
                <label>
                  Fecha de retiro
                </label>

                <input
                  type="date"
                  name="fechaRetiro"
                  value={form.fechaRetiro}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="hv-field hv-field-check">
            <label>
              <input
                type="checkbox"
                name="trabajoActual"
                checked={form.trabajoActual}
                onChange={handleChange}
              />

              &nbsp; Este es mi trabajo actual
            </label>
          </div>

          <div className="hv-field">
            <label>
              Descripción de funciones
            </label>

            <textarea
              name="descripcionFunciones"
              value={form.descripcionFunciones}
              onChange={handleChange}
              rows={3}
              placeholder="Describe brevemente las funciones desempeñadas…"
            />
          </div>

          <div className="hv-field">
            <label>
              Certificación laboral
              (PDF o JPG, máx. 2 MB)
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={handleArchivo}
              ref={fileRef}
              className="hv-input-file"
            />

            <p className="hv-field-hint">
              Adjunta la certificación laboral o contrato.
            </p>
          </div>

          {mensaje && (
            <div className={`hv-mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="hv-form-actions">

            <button
              type="button"
              className="hv-btn-cancelar"
              onClick={() => {
                setMostrarForm(false);
                setMensaje(null);
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="hv-btn-guardar"
              disabled={guardando}
            >
              {guardando
                ? "Guardando…"
                : "Guardar registro"}
            </button>

          </div>
        </form>
      )}

      {mensaje && !mostrarForm && (
        <div className={`hv-mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}