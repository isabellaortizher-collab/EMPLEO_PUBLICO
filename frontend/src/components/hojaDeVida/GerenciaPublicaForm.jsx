import React, { useEffect, useState, useRef } from "react";

import {
  getGerenciaPublica,
  agregarGerencia,
} from "../../services/hojaDeVidaApi";

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

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const { data } = await getGerenciaPublica();

      if (data.ok) {
        setHabilitado(data.habilitado); // ✅ CORRECTO
        setLista(data.gerencia || []);
      }
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: "Error al cargar gerencia pública.",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArchivo = (e) => {
    const f = e.target.files[0];

    if (!f) return;

    if (f.size > 2 * 1024 * 1024) {
      setMensaje({
        tipo: "error",
        texto: "El archivo excede 2 MB.",
      });

      e.target.value = "";
      return;
    }

    if (
      !["application/pdf", "image/jpeg", "image/jpg"].includes(f.type)
    ) {
      setMensaje({
        tipo: "error",
        texto: "Solo PDF o JPG.",
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

      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });

      if (archivo) {
        fd.append("soporte", archivo);
      }

      const { data } = await agregarGerencia(fd);

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

      onGuardado && onGuardado();
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto:
          err.response?.data?.mensaje ||
          "Error al guardar registro.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const verDocumento = (url) => {
    if (!url) {
      setMensaje({
        tipo: "error",
        texto: "No se encontró documento.",
      });

      return;
    }

    const backendUrl = "http://localhost:5000";

    window.open(`${backendUrl}${url}`, "_blank");
  };

  if (cargando) {
    return <div className="hv-form-loading">Cargando...</div>;
  }

  if (!habilitado) {
    return (
      <div className="hv-form-card">
        <h3>Gerencia Pública</h3>

        <div className="hv-mensaje info">
          Esta sección no está habilitada para tu cargo.
        </div>
      </div>
    );
  }

  return (
    <div className="hv-form-card">
      <div className="hv-form-header">
        <h3>Gerencia Pública</h3>

        <p className="hv-form-sub">
          Registra la información de experiencia en cargos
          directivos del sector público.
        </p>
      </div>

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
                <strong>{item.cargo}</strong>

                <span>{item.entidad}</span>

                <span>
                  Nivel directivo: {item.nivelDirectivo}
                </span>

                {item.fechaIngreso && (
                  <span className="hv-lista-fecha">
                    Inicio:{" "}
                    {new Date(
                      item.fechaIngreso
                    ).toLocaleDateString("es-CO")}
                  </span>
                )}

                {item.fechaRetiro && (
                  <span className="hv-lista-fecha">
                    Retiro:{" "}
                    {new Date(
                      item.fechaRetiro
                    ).toLocaleDateString("es-CO")}
                  </span>
                )}
              </div>

              <div className="hv-lista-acciones">
                {item.soporteUrl && (
                  <button
                    type="button"
                    className="hv-btn-soporte"
                    onClick={() =>
                      verDocumento(item.soporteUrl)
                    }
                  >
                    Ver soporte
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

      {!mostrarForm && (
        <button
          type="button"
          className="hv-btn-agregar"
          onClick={() => {
            setMostrarForm(true);
            setMensaje(null);
          }}
        >
          Agregar registro
        </button>
      )}

      {mostrarForm && (
        <form className="hv-form" onSubmit={handleSubmit}>
          <div className="hv-form-row">
            <div className="hv-field">
              <label>Nivel directivo</label>

              <input
                name="nivelDirectivo"
                value={form.nivelDirectivo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="hv-field">
              <label>Entidad</label>

              <input
                name="entidad"
                value={form.entidad}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="hv-form-row">
            <div className="hv-field">
              <label>Cargo</label>

              <input
                name="cargo"
                value={form.cargo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="hv-form-row">
            <div className="hv-field">
              <label>Fecha ingreso</label>

              <input
                type="date"
                name="fechaIngreso"
                value={form.fechaIngreso}
                onChange={handleChange}
              />
            </div>

            <div className="hv-field">
              <label>Fecha retiro</label>

              <input
                type="date"
                name="fechaRetiro"
                value={form.fechaRetiro}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="hv-field">
            <label>
              Documento soporte (PDF o JPG)
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={handleArchivo}
              ref={fileRef}
            />
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
                ? "Guardando..."
                : "Guardar registro"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}