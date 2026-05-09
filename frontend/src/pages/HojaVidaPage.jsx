import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProgreso } from "../services/hojaDeVidaApi";
import DatosPersonalesForm from "../components/hojaDeVida/DatosPersonalesForm";
import FormacionAcademicaForm from "../components/hojaDeVida/FormacionAcademicaForm";
import ExperienciaLaboralForm from "../components/hojaDeVida/ExperienciaLaboralForm";
import GerenciaPublicaForm from "../components/hojaDeVida/GerenciaPublicaForm";
import ResumenHV from "../components/hojaDeVida/ResumenHV";
import "../styles/hojaDeVida.css";

const SECCIONES = [
  { id: "datosPersonales", label: "Datos Personales", numero: 1 },
  { id: "formacionAcademica", label: "Formación Académica", numero: 2 },
  { id: "experienciaLaboral", label: "Experiencia Laboral", numero: 3 },
  { id: "gerenciaPublica", label: "Gerencia Pública", numero: 4, condicional: true },
  { id: "resumen", label: "Resumen y Descarga", numero: 5 },
];

export default function HojaDeVidaPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState("datosPersonales");
  const [progreso, setProgreso] = useState({
    seccionesGuardadas: {},
    tieneGerenciaPublica: false,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProgreso();
  }, []);

  const cargarProgreso = async () => {
    try {
      const { data } = await getProgreso();
      if (data.ok) setProgreso(data);
    } catch {
    } finally {
      setCargando(false);
    }
  };

  const seccionesVisibles = SECCIONES.filter(
    (s) => !s.condicional || progreso.tieneGerenciaPublica
  );

  const alGuardarSeccion = () => {
    cargarProgreso();
  };

  const renderSeccion = () => {
    switch (seccionActiva) {
      case "datosPersonales":
        return <DatosPersonalesForm onGuardado={alGuardarSeccion} />;
      case "formacionAcademica":
        return <FormacionAcademicaForm onGuardado={alGuardarSeccion} />;
      case "experienciaLaboral":
        return <ExperienciaLaboralForm onGuardado={alGuardarSeccion} />;
      case "gerenciaPublica":
        return <GerenciaPublicaForm onGuardado={alGuardarSeccion} />;
      case "resumen":
        return <ResumenHV />;
      default:
        return null;
    }
  };

  if (cargando) return <div className="hv-loading">Cargando hoja de vida…</div>;

  return (
    <div className="hv-container">
      <aside className="hv-sidebar">
        <div className="hv-sidebar-header">
          <span className="hv-sidebar-icon">📋</span>
          <h2>Mi Hoja de Vida</h2>
          <p className="hv-sidebar-sub">SIGEP II</p>
        </div>

        <nav className="hv-nav">
          {seccionesVisibles.map((s) => {
            const guardada = progreso.seccionesGuardadas[s.id];
            const activa = seccionActiva === s.id;
            return (
              <button
                key={s.id}
                className={`hv-nav-item ${activa ? "activa" : ""} ${guardada ? "guardada" : ""}`}
                onClick={() => setSeccionActiva(s.id)}
              >
                <span className="hv-nav-num">{s.numero}</span>
                <span className="hv-nav-label">{s.label}</span>
                {guardada && <span className="hv-nav-check">✓</span>}
              </button>
            );
          })}
        </nav>

        <div className="hv-progreso">
          <p className="hv-progreso-label">Progreso general</p>
          <div className="hv-progreso-bar">
            <div
              className="hv-progreso-fill"
              style={{
                width: `${
                  (Object.values(progreso.seccionesGuardadas).filter(Boolean).length /
                    Math.max(seccionesVisibles.length - 1, 1)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </aside>

      <main className="hv-main">
        <div className="hv-main-inner">{renderSeccion()}</div>
      </main>
    </div>
  );
}