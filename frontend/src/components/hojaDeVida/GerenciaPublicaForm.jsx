import React, { useEffect, useState, useRef } from "react";
import { getGerenciaPublica, agregarGerencia } from "../../services/hojaDeVidaApi";

const INITIAL_FORM = {
  nivelDirectivo: "",
  entidad: "",
  cargo: "",
  fechaIngreso: "",
  fechaRetiro: "",
};

export default function GerenciaPublicaForm({ onGuardado }) {
  const [habilitado, setHabilitado] = useState(false);
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const fileRef = useRef();

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const { data } = await getGerenciaPublica();
      if (data.ok) {
        setHabilitado(data.habilitado);
        setLista(data.gerencia || []);
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error al cargar gerencia pública." });
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleArchivo = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setMensaje({ tipo: "error", texto: "El archivo excede el límite de 2 MB." });
      e.target.value = "";
      return;
    }
    if (!["application/pdf", "image/jpeg", "image/jpg"].includes(f.type)) {
      setMensaje({ tipo: "error", texto: "Solo se permiten archivos PDF o JPG." });
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
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (archivo) fd.append("soporte", archivo);

      const { data } = await agregarGerencia(fd);
      setMensaje({ tipo: "exito", texto: data.mensaje });
      setForm(INITIAL_FORM);
      setArchivo(null);
      if (fileRef.current) fileRef.current.value = "";
      setMostrarForm(false);
      await cargar();
      onGuardado && onGuardado();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.response?.data?.mensaje || "Error al guardar." });
    } finally {
      setGuardando(false);
    }
  };

  const verDocumento = (filename) => {
    window.open(`/api/hoja-de-vida/soporte/${filename}`, "_blank");
  };

  if (cargando) return <div className="hv-form-loading">Cargando…</div>;

  if (!habilitado) {
    return (
      <div className="hv-form-card">
        <div className="hv-form-header">
          <h3>Gerencia Pública</h3>
        </div>
        <div className="hv-seccion-bloqueada">
          <span className="hv-lock-icon">🔒</span>
          <p>
            Esta sección se habilita únicamente cuando el sistema detecta que tu cargo
            corresponde a un nivel directivo de gerencia pública.
          </p>
          <p className="hv-lock-sub">
            Si crees que esto es un error, contacta al Jefe de Talento Humano de tu entidad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hv-form-card">
      <div className="hv-form-header">
        <h3>Gerencia Pública</h3>
        <p className="hv-form-sub">
          Sección habilitada para cargos de nivel directivo.
          Los campos marcados con <span className="obligatorio">*</span> son obligatorios.
        </p>
      </div>

      {lista.length > 0 && (
        <div className="hv-lista">
          {lista.map((item) => (
            <div key={item._id} className={`hv-lista-item ${item.validado ? "validado" : ""}`}>
              <div className="hv-lista-info">
                <strong>{item.cargo}</strong>
                <span>{item.entidad}</span>
                {item.nivelDirectivo && <span>Nivel: {item.nivelDirectivo}</span>}
                <span className="hv-lista-fecha">
                  {item.fechaIngreso ? new Date(item.fechaIngreso).toLocaleDateString("es-CO") : "—"}
                  {" → "}
                  {item.fechaRetiro ? new Date(item.fechaRetiro).toLocaleDateString("es-CO") : "Actualmente"}
                </span>
              </div>
              <div className="hv-lista-acciones">
                {item.soporteUrl && (
                  <button type="button" className="hv-btn-soporte" onClick={() => verDocumento(item.soporteUrl)}>
                    Ver soporte
                  </button>
                )}
                {item.validado && <span className="hv-badge-validado-sm">✓ Validado</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {lista.length === 0 && !mostrarForm && (
        <p className="hv-lista-vacia">Aún no has registrado información de gerencia pública.</p>
      )}

      {!mostrarForm && (
        <button type="button" className="hv-btn-agregar" onClick={() => { setMostrarForm(true); setMensaje(null); }}>
          + Agregar registro
        </button>
      )}

      {mostrarForm && (
        <form className="hv-form hv-form-nuevo" onSubmit={handleSubmit}>
          <div className="hv-form-nuevo-titulo">Nuevo registro de gerencia pública</div>

          <div className="hv-form-row">
            <div className="hv-field">
              <label>Nivel directivo</label>
              <input name="nivelDirectivo" value={form.nivelDirectivo} onChange={handleChange} placeholder="Ej: Directivo, Asesor…" />
            </div>
            <div className="hv-field">
              <label>Entidad <span className="obligatorio">*</span></label>
              <input name="entidad" value={form.entidad} onChange={handleChange} required />
            </div>
          </div>

          <div className="hv-field">
            <label>Cargo <span className="obligatorio">*</span></label>
            <input name="cargo" value={form.cargo} onChange={handleChange} required />
          </div>

          <div className="hv-form-row">
            <div className="hv-field">
              <label>Fecha de ingreso</label>
              <input type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} />
            </div>
            <div className="hv-field">
              <label>Fecha de retiro</label>
              <input type="date" name="fechaRetiro" value={form.fechaRetiro} onChange={handleChange} />
            </div>
          </div>

          <div className="hv-field">
            <label>Documento soporte (PDF o JPG, máx. 2 MB)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg" onChange={handleArchivo} ref={fileRef} className="hv-input-file" />
          </div>

          {mensaje && <div className={`hv-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

          <div className="hv-form-actions">
            <button type="button" className="hv-btn-cancelar" onClick={() => { setMostrarForm(false); setMensaje(null); }}>
              Cancelar
            </button>
            <button type="submit" className="hv-btn-guardar" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar registro"}
            </button>
          </div>
        </form>
      )}

      {mensaje && !mostrarForm && (
        <div className={`hv-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}
    </div>
  );
}