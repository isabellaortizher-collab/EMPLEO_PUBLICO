import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TIPOS = [
  { value: 'CEDULA_CIUDADANIA', label: 'Cédula de Ciudadanía' },
  { value: 'CEDULA_EXTRANJERIA', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'TARJETA_IDENTIDAD', label: 'Tarjeta de Identidad' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ tipoDocumento: 'CEDULA_CIUDADANIA', numeroIdentificacion: '', contrasena: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.numeroIdentificacion || !form.contrasena) { setError('Todos los campos son obligatorios.'); return; }
    setCargando(true);
    try {
      const data = await login(form);
      navigate(data.usuario.primerIngreso ? '/cambiar-contrasena?primer-ingreso=true' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión.');
    } finally { setCargando(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="sigep-logo">sigep<span>II</span></div>
        <div className="sigep-sub">v &lt;1.1.21&gt; — Función Pública</div>
        <div className="login-headline">Sistema de Gestión<br />del Empleo Público</div>
        <p className="login-desc">Plataforma oficial para la gestión de hojas de vida y vinculaciones de servidores públicos del Estado colombiano.</p>
        <div style={{ marginTop: 48, padding: '16px 20px', background: 'rgba(255,255,255,0.08)', borderRadius: 6, borderLeft: '3px solid #f57c00', maxWidth: 420 }}>
          <p style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.6 }}>Recuerde tener sus archivos en formato PDF. La información es con fines de gestión.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-container">
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: '#0d2b4e' }}>sigep<span style={{ color: '#f57c00' }}>II</span></div>
            <div style={{ fontSize: 11, color: '#90a4ae', fontFamily: 'monospace' }}>FUNCIÓN PÚBLICA</div>
          </div>
          <div className="login-form-title">• Iniciar Sesión •</div>
          <p className="login-form-subtitle">Datos Obligatorios *</p>
          {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">* Tipo de Documento</label>
              <select name="tipoDocumento" value={form.tipoDocumento} onChange={e => setForm(p => ({ ...p, tipoDocumento: e.target.value }))} className="form-control">
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">* Número de Identificación</label>
              <input type="text" value={form.numeroIdentificacion} onChange={e => setForm(p => ({ ...p, numeroIdentificacion: e.target.value }))} className="form-control" placeholder="Ingrese su número de documento" />
            </div>
            <div className="form-group">
              <label className="form-label">* Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={verPass ? 'text' : 'password'} value={form.contrasena} onChange={e => setForm(p => ({ ...p, contrasena: e.target.value }))} className="form-control" placeholder="••••••••" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setVerPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#90a4ae' }}>
                  {verPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/recuperar-contrasena" style={{ fontSize: 12, color: '#2d6db5', textDecoration: 'none' }}>¿Olvidó su contraseña?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={cargando}>
              {cargando ? <><span className="spinner" />Verificando...</> : 'Ingrese'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}