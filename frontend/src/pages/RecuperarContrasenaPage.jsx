import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const TIPOS = [
  { value: 'CEDULA_CIUDADANIA', label: 'Cédula de Ciudadanía' },
  { value: 'CEDULA_EXTRANJERIA', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'TARJETA_IDENTIDAD', label: 'Tarjeta de Identidad' },
];

export default function RecuperarContrasenaPage() {
  const [form, setForm] = useState({ tipoDocumento: 'CEDULA_CIUDADANIA', numeroIdentificacion: '' });
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.numeroIdentificacion) { setError('Ingrese su número de identificación.'); return; }
    setCargando(true);
    try {
      await authService.recuperarContrasena(form);
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al procesar la solicitud.');
    } finally { setCargando(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="sigep-logo">sigep<span style={{ color: '#f57c00' }}>II</span></div>
        <div className="sigep-sub">Sistema de Gestión del Empleo Público</div>
        <div className="login-headline">Recuperación<br />de contraseña</div>
        <p className="login-desc">Ingrese su tipo y número de documento. Si existe una cuenta, recibirá una nueva contraseña temporal en su correo institucional.</p>
      </div>
      <div className="login-right">
        <div className="login-form-container">
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0d2b4e' }}>sigep<span style={{ color: '#f57c00' }}>II</span></div>
            <div style={{ fontSize: 11, color: '#90a4ae', fontFamily: 'monospace' }}>FUNCIÓN PÚBLICA</div>
          </div>
          {enviado ? (
            <div>
              <div className="alert alert-success"><span>✅</span><div><strong>Solicitud procesada.</strong><br />Si existe la cuenta, recibirá una contraseña temporal en su correo. Revise también spam.</div></div>
              <div className="alert alert-warning"><span>⚠</span><div>Cambie la contraseña temporal inmediatamente al ingresar.</div></div>
              <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: 20 }}>← Volver al inicio de sesión</Link>
            </div>
          ) : (
            <>
              <div className="login-form-title">Recuperar contraseña</div>
              <p className="login-form-subtitle">Ingrese sus datos de identificación</p>
              {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">* Tipo de Documento</label>
                  <select value={form.tipoDocumento} onChange={e => setForm(p => ({ ...p, tipoDocumento: e.target.value }))} className="form-control">
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">* Número de Identificación</label>
                  <input type="text" value={form.numeroIdentificacion} onChange={e => setForm(p => ({ ...p, numeroIdentificacion: e.target.value }))} className="form-control" placeholder="Ingrese su número de documento" />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={cargando} style={{ marginBottom: 12 }}>
                  {cargando ? <><span className="spinner" />Enviando...</> : 'Enviar nueva contraseña'}
                </button>
                <Link to="/login" className="btn btn-secondary btn-full">← Volver al inicio de sesión</Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}