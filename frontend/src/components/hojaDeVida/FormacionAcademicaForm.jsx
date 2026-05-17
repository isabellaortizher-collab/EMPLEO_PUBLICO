import React, { useEffect, useState, useRef } from "react";
import {
    getFormacionAcademica,
    agregarFormacion,
    eliminarFormacion,
} from "../../services/hojaDeVidaApi";

const NIVELES = [
    { value: "PREGRADO",        label: "Pregrado" },
    { value: "ESPECIALIZACION", label: "Especialización" },
    { value: "MAESTRIA",        label: "Maestría" },
    { value: "DOCTORADO",       label: "Doctorado" },
    { value: "POSDOCTORADO",    label: "Posdoctorado" },
];

const INITIAL_FORM = {
    nivel: "",
    tituloObtenido: "",
    institucion: "",
    paisInstitucion: "",
    fechaGrado: "",
    tarjetaProfesional: "",
};

export default function FormacionAcademica({ onGuardado }) {
    const [lista,       setLista]       = useState([]);
    const [form,        setForm]        = useState(INITIAL_FORM);  
    const [archivo,     setArchivo]     = useState(null);          
    const [cargando,    setCargando]    = useState(true);          
    const [guardando,   setGuardando]   = useState(false);         
    const [mensaje,     setMensaje]     = useState(null);          
    const [mostrarForm, setMostrarForm] = useState(false);         
    const fileRef = useRef();

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try {
            const { data } = await getFormacionAcademica();
            if (data.ok) setLista(data.formacion || []);
        } catch {
            setMensaje({ tipo: "error", texto: "Error al cargar formación académica." });
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

            const { data } = await agregarFormacion(fd);
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

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Eliminar este registro?")) return;
        try {
            await eliminarFormacion(id);
            await cargar();
            onGuardado && onGuardado();
        } catch (err) {
            setMensaje({ tipo: "error", texto: err.response?.data?.mensaje || "Error al eliminar." });
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

    if (cargando) return <div className="hv-form-loading">Cargando...</div>;

    return (
        <div className="hv-form-card">
            <div className="hv-form-header">
                <h3>Formación Académica</h3>
                <p className="hv-form-sub">
                    Registra tu pregrado, posgrado y tarjeta profesional si aplica.
                    Los campos marcados con <span className="obligatorio">*</span> son obligatorios.
                </p>
            </div>

            {lista.length > 0 && (
                <div className="hv-lista">
                    {lista.map((item) => (
                        <div key={item._id} className={`hv-lista-item ${item.validado ? "validado" : ""}`}>
                            <div className="hv-lista-info">
                                <span className="hv-list-badge">{item.nivel}</span>
                                <strong>{item.tituloObtenido}</strong>
                                <span>{item.institucion} — {item.paisInstitucion}</span>
                                {item.fechaGrado && (
                                    <span className="hv-lista-fecha">
                                        Graduado: {new Date(item.fechaGrado).toLocaleDateString("es-CO")}
                                    </span>
                                )}
                                {item.tarjetaProfesional && (
                                    <span>T.P.: {item.tarjetaProfesional}</span>
                                )}
                            </div>
                            <div className="hv-lista-acciones">
                                {item.soporteUrl && (
                                    <button
                                        type="button"
                                        className="hv-btn-soporte"
                                       onClick={() => verDocumento(item.soporteUrl)}
                                        title="Mostrar Documento"
                                    >
                                        Ver soporte
                                    </button>
                                )}
                                {!item.validado && (  // ✅ era !item.valido
                                    <button
                                        type="button"
                                        className="hv-btn-eliminar"
                                        onClick={() => handleEliminar(item._id)}
                                    >
                                        Eliminar
                                    </button>
                                )}
                                {item.validado && (
                                    <span className="hv-badge-valido-sm">Validado</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {lista.length === 0 && !mostrarForm && (
                <p className="hv-lista-vacia">Aún no has registrado formación académica.</p>
            )}

            {!mostrarForm && (
                <button
                    type="button"
                    className="hv-btn-agregar"
                    onClick={() => { setMostrarForm(true); setMensaje(null); }}
                >
                    Agregar formación
                </button>
            )}

            {mostrarForm && (
                <form className="hv-form hv-form-nuevo" onSubmit={handleSubmit}>
                    <div className="hv-form-nuevo-titulo">Nueva formación académica</div>

                    <div className="hv-form-row">
                        <div className="hv-field">
                            <label>Nivel de formación <span className="obligatorio">*</span></label>
                            <select name="nivel" value={form.nivel} onChange={handleChange} required>
                                <option value="">Seleccione…</option>
                                {NIVELES.map((n) => (
                                    <option key={n.value} value={n.value}>{n.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="hv-field">
                            <label>Título obtenido <span className="obligatorio">*</span></label>
                            <input
                                name="tituloObtenido"
                                value={form.tituloObtenido}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="hv-form-row">
                        <div className="hv-field">
                            <label>Institución educativa <span className="obligatorio">*</span></label>
                            <input
                                name="institucion"
                                value={form.institucion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="hv-field">
                            <label>País de la institución <span className="obligatorio">*</span></label>
                            <input
                                name="paisInstitucion"
                                value={form.paisInstitucion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="hv-form-row">
                        <div className="hv-field">
                            <label>Fecha de grado</label>
                            <input
                                type="date"
                                name="fechaGrado"
                                value={form.fechaGrado ?? ""}
                                onChange={handleChange}
                            />
                        </div>
                        {form.nivel === "PREGRADO" && (
                            <div className="hv-field">
                                <label>Número de tarjeta profesional (si aplica)</label>
                                <input
                                    name="tarjetaProfesional"
                                    value={form.tarjetaProfesional}
                                    onChange={handleChange}
                                    placeholder="Ej: 123456-PRO"
                                />
                            </div>
                        )}
                    </div>

                    <div className="hv-field">
                        <label>Documento soporte (PDF o JPG, máx. 2 MB)</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg"
                            onChange={handleArchivo}
                            ref={fileRef}
                            className="hv-input-file"
                        />
                        <p className="hv-field-hint">
                             Adjunta el diploma, acta de grado o certificado de la institución.
                        </p>
                    </div>

                    {mensaje && (
                        <div className={`hv-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
                    )}

                    <div className="hv-form-actions">
                        <button
                            type="button"
                            className="hv-btn-cancelar"
                            onClick={() => { setMostrarForm(false); setMensaje(null); }}
                        >
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