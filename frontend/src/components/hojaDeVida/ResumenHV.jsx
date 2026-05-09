import React, { useEffect, useState } from "react";
import { descargarHojaDeVida } from "../../services/hojaDeVidaApi";

export default function ResumenHV() {
  const [hv, setHv] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const { data } = await descargarHojaDeVida();
      if (data.ok) setHv(data.hojaDeVida);
    } catch {
      setMensaje({ tipo: "error", texto: "Error al cargar la hoja de vida." });
    } finally {
      setCargando(false);
    }
  };

  const handleImprimir = () => window.print();

  if (cargando) return <div className="hv-form-loading">Cargando resumen…</div>;

  if (!hv) {
    return (
      <div className="hv-form-card">
        <div className="hv-form-header"><h3>Resumen y Descarga</h3></div>
        {mensaje && <div className={`hv-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
      </div>
    );
  }

  const dp = hv.datosPersonales || {};

  return (
    <>
      <div className="hv-form-card hv-resumen no-print">
        <div className="hv-form-header">
          <h3>Resumen de Hoja de Vida</h3>
          <p className="hv-form-sub">Revisa tu información y descárgala cuando esté completa.</p>
        </div>

        <div className="hv-resumen-acciones">
          <button className="hv-btn-guardar" onClick={handleImprimir}>
            Imprimir / Guardar PDF
          </button>
        </div>

        {mensaje && <div className={`hv-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
      </div>

      <div className="hv-documento-imprimible" id="hv-print">

        <div className="hv-doc-header">
          <h1>Hoja de Vida</h1>
          <p className="hv-doc-sub">Sistema de Gestión del Empleo Público — SIGEP II</p>
          <p className="hv-doc-fecha">Generado el {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <section className="hv-doc-seccion">
          <h2 className="hv-doc-seccion-titulo">1. Datos Personales</h2>
          <div className="hv-doc-grid">
            <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Nombres</span><span>{dp.nombres} {dp.apellidos}</span></div>
            <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Documento</span><span>{dp.tipoDocumento?.replace(/_/g," ")} {dp.numeroDocumento}</span></div>
            <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Fecha de nacimiento</span><span>{dp.fechaNacimiento ? new Date(dp.fechaNacimiento).toLocaleDateString("es-CO") : "—"}</span></div>
            <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Género</span><span>{dp.genero?.replace(/_/g," ") || "—"}</span></div>
            <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Correo</span><span>{dp.correoElectronico || "—"}</span></div>
            <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Celular</span><span>{dp.celular || "—"}</span></div>
            <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Teléfono</span><span>{dp.telefono || "—"}</span></div>
            <div className="hv-doc-campo">
              <span className="hv-doc-etiqueta">Dirección</span>
              <span>
                {dp.tipoZona === "RURAL"
                  ? `Rural: ${dp.complementoDireccion || "—"}`
                  : `${dp.direccion || "—"}, ${dp.municipio || ""}, ${dp.departamento || ""}`}
              </span>
            </div>
          </div>
        </section>

        <section className="hv-doc-seccion">
          <h2 className="hv-doc-seccion-titulo">2. Formación Académica</h2>
          {hv.formacionAcademica?.length > 0 ? (
            hv.formacionAcademica.map((f, i) => (
              <div key={i} className="hv-doc-item">
                <div className="hv-doc-item-titulo">{f.nivel?.replace(/_/g," ")} — {f.tituloObtenido}</div>
                <div className="hv-doc-grid">
                  <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Institución</span><span>{f.institucion}</span></div>
                  <div className="hv-doc-campo"><span className="hv-doc-etiqueta">País</span><span>{f.paisInstitucion}</span></div>
                  {f.fechaGrado && <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Fecha de grado</span><span>{new Date(f.fechaGrado).toLocaleDateString("es-CO")}</span></div>}
                  {f.tarjetaProfesional && <div className="hv-doc-campo"><span className="hv-doc-etiqueta">T.P.</span><span>{f.tarjetaProfesional}</span></div>}
                </div>
              </div>
            ))
          ) : (
            <p className="hv-doc-vacio">Sin registros.</p>
          )}
        </section>

        <section className="hv-doc-seccion">
          <h2 className="hv-doc-seccion-titulo">3. Experiencia Laboral</h2>
          {hv.experienciaLaboral?.length > 0 ? (
            hv.experienciaLaboral.map((e, i) => (
              <div key={i} className="hv-doc-item">
                <div className="hv-doc-item-titulo">{e.cargo} — {e.entidadEmpresa}</div>
                <div className="hv-doc-grid">
                  <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Tipo</span><span>{e.tipo}</span></div>
                  <div className="hv-doc-campo">
                    <span className="hv-doc-etiqueta">Período</span>
                    <span>
                      {new Date(e.fechaIngreso).toLocaleDateString("es-CO")} —{" "}
                      {e.trabajoActual ? "Actualmente" : (e.fechaRetiro ? new Date(e.fechaRetiro).toLocaleDateString("es-CO") : "—")}
                    </span>
                  </div>
                  {e.descripcionFunciones && (
                    <div className="hv-doc-campo hv-doc-campo-full">
                      <span className="hv-doc-etiqueta">Funciones</span>
                      <span>{e.descripcionFunciones}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="hv-doc-vacio">Sin registros.</p>
          )}
        </section>

        {hv.tieneGerenciaPublica && (
          <section className="hv-doc-seccion">
            <h2 className="hv-doc-seccion-titulo">4. Gerencia Pública</h2>
            {hv.gerenciaPublica?.length > 0 ? (
              hv.gerenciaPublica.map((g, i) => (
                <div key={i} className="hv-doc-item">
                  <div className="hv-doc-item-titulo">{g.cargo} — {g.entidad}</div>
                  <div className="hv-doc-grid">
                    {g.nivelDirectivo && <div className="hv-doc-campo"><span className="hv-doc-etiqueta">Nivel</span><span>{g.nivelDirectivo}</span></div>}
                    <div className="hv-doc-campo">
                      <span className="hv-doc-etiqueta">Período</span>
                      <span>
                        {g.fechaIngreso ? new Date(g.fechaIngreso).toLocaleDateString("es-CO") : "—"} —{" "}
                        {g.fechaRetiro ? new Date(g.fechaRetiro).toLocaleDateString("es-CO") : "Actualmente"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="hv-doc-vacio">Sin registros.</p>
            )}
          </section>
        )}

        <div className="hv-doc-footer">
          <p>Documento generado por el Sistema de Gestión del Empleo Público — SIGEP II</p>
          <p>Universidad Autónoma de Occidente · Facultad de Ingeniería</p>
        </div>
      </div>
    </>
  );
}