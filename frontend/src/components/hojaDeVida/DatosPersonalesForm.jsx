import React, { useEffect, useState } from "react";
import { getDatosPersonales, guardarDatosPersonales } from "../../services/hojaDeVidaApi";

const TIPOS_DOC = [
  { value: "CEDULA_CIUDADANIA", label: "Cédula de Ciudadanía" },
  { value: "CEDULA_EXTRANJERIA", label: "Cédula de Extranjería" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "TARJETA_IDENTIDAD", label: "Tarjeta de Identidad" },
];

const GENEROS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "NO_BINARIO", label: "No binario" },
  { value: "PREFIERO_NO_DECIR", label: "Prefiero no decir" },
];

const INITIAL = {
  nombres: "", apellidos: "", tipoDocumento: "", numeroDocumento: "",
  fechaNacimiento: "", genero: "", correoElectronico: "", celular: "", telefono: "",
  tipoZona: "URBANA", departamento: "", municipio: "", direccion: "", complementoDireccion: "",
};

export default function DatosPersonalesForm({ onGuardado }) {
  const [form, setForm] = useState(INITIAL);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [validado, setValidado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getDatosPersonales();
        if (data.ok && data.datos) {
          const d = data.datos;
          setForm({
            nombres: d.nombres || "",
            apellidos: d.apellidos || "",
            tipoDocumento: d.tipoDocumento || "",
            numeroDocumento: d.numeroDocumento || "",
            fechaNacimiento: d.fechaNacimiento ? d.fechaNacimiento.slice(0, 10) : "",
            genero: d.genero || "",
            correoElectronico: d.correoElectronico || "",
            celular: d.celular || "",
            telefono: d.telefono || "",
            tipoZona: d.tipoZona || "URBANA",
            departamento: d.departamento || "",
            municipio: d.municipio || "",
            direccion: d.direccion || "",
            complementoDireccion: d.complementoDireccion || "",
          });
          setValidado(d.validado || false);
        }
      } catch {
        setMensaje({ tipo: "error", texto: "Error al cargar datos personales." });
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      const { data } = await guardarDatosPersonales(form);
      setMensaje({ tipo: "exito", texto: data.mensaje });
      onGuardado && onGuardado();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.response?.data?.mensaje || "Error al guardar." });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="hv-form-loading">Cargando…</div>;

  return (
    <div className="hv-form-card">
      <div className="hv-form-header">
        <h3>Datos Personales</h3>
        <p className="hv-form-sub">
          Los campos marcados con <span className="obligatorio">*</span> son obligatorios.
        </p>
        {validado && (
          <div className="hv-badge-validado">✓ Sección validada por JTH — Solo lectura</div>
        )}
      </div>

      <form className="hv-form" onSubmit={handleSubmit}>
        <div className="hv-form-row">
          <div className="hv-field">
            <label>Nombres <span className="obligatorio">*</span></label>
            <input name="nombres" value={form.nombres} onChange={handleChange} disabled={validado} required />
          </div>
          <div className="hv-field">
            <label>Apellidos <span className="obligatorio">*</span></label>
            <input name="apellidos" value={form.apellidos} onChange={handleChange} disabled={validado} required />
          </div>
        </div>

        
        <div className="hv-form-row">
          <div className="hv-field">
            <label>Tipo de documento <span className="obligatorio">*</span></label>
            <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} disabled={validado} required>
              <option value="">Seleccione…</option>
              {TIPOS_DOC.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="hv-field">
            <label>Número de documento <span className="obligatorio">*</span></label>
            <input name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} disabled={validado} required />
          </div>
        </div>

        
        <div className="hv-form-row">
          <div className="hv-field">
            <label>Fecha de nacimiento <span className="obligatorio">*</span></label>
            <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} disabled={validado} required />
          </div>
          <div className="hv-field">
            <label>Género <span className="obligatorio">*</span></label>
            <select name="genero" value={form.genero} onChange={handleChange} disabled={validado} required>
              <option value="">Seleccione…</option>
              {GENEROS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>

        
        <div className="hv-seccion-titulo">Datos de Contacto</div>
        <div className="hv-form-row">
          <div className="hv-field">
            <label>Correo electrónico <span className="obligatorio">*</span></label>
            <input type="email" name="correoElectronico" value={form.correoElectronico} onChange={handleChange} disabled={validado} required />
          </div>
          <div className="hv-field">
            <label>Celular</label>
            <input name="celular" value={form.celular} onChange={handleChange} disabled={validado} />
          </div>
          <div className="hv-field">
            <label>Teléfono fijo</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} disabled={validado} />
          </div>
        </div>

        
        <div className="hv-seccion-titulo">Dirección de Residencia</div>
        <div className="hv-form-row">
          <div className="hv-field">
            <label>Tipo de zona <span className="obligatorio">*</span></label>
            <select name="tipoZona" value={form.tipoZona} onChange={handleChange} disabled={validado}>
              <option value="URBANA">Urbana</option>
              <option value="RURAL">Rural</option>
            </select>
          </div>
          <div className="hv-field">
            <label>Departamento</label>
            <input name="departamento" value={form.departamento} onChange={handleChange} disabled={validado} />
          </div>
          <div className="hv-field">
            <label>Municipio</label>
            <input name="municipio" value={form.municipio} onChange={handleChange} disabled={validado} />
          </div>
        </div>

        {form.tipoZona === "URBANA" ? (
          <div className="hv-field">
            <label>Dirección</label>
            <input name="direccion" value={form.direccion} onChange={handleChange} disabled={validado} placeholder="Ej: Calle 5 # 10-20" />
          </div>
        ) : (
         
          <div className="hv-field hv-field-full">
            <label>Dirección / Complemento especial <span className="obligatorio">*</span></label>
            <textarea
              name="complementoDireccion"
              value={form.complementoDireccion}
              onChange={handleChange}
              disabled={validado}
              rows={3}
              placeholder="Ingrese la dirección rural o complemento especial (vereda, corregimiento, etc.)"
            />
            <p className="hv-field-hint">Para zona rural, ingrese aquí la descripción completa de su dirección.</p>
          </div>
        )}

        {mensaje && (
          <div className={`hv-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        {!validado && (
          <div className="hv-form-actions">
            <button type="submit" className="hv-btn-guardar" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar sección"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}