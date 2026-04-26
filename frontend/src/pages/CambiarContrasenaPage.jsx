import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

const REGLAS = [
  { id: 'longitud', texto: 'Mínimo 6 caracteres', test: p => p.length >= 6 },
  { id: 'letra', texto: 'Al menos una letra', test: p => /[a-zA-Z]/.test(p) },
  { id: 'numero', texto: 'Al menos un número', test: p => /\d/.test(p) },
  { id: 'especial', texto: 'Al menos un carácter especial (!@#$%^&*)', test: p => /[!@#$%^&*()\-_=+]/.test(p) },
];

export default function CambiarContrasenaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const esPrimerIngreso = searchParams.get('primer-ingreso') === 'true';
  const [form, setForm] = useState({ contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [ver, setVer] = useState({ actual: false, nueva: false, confirmar: false });

  const reglasCumplidas = REGLAS.every(r => r.test(form.nuevaContrasena));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.contrasenaActual) { setError('Ingrese su contraseña actual.'); return; }
    if (!reglasCumplidas) { setError('La nueva contraseña no cumple los requisitos.'); return; }
    if (form.nuevaContrasena !== form.confirmarContrasena) { setError('Las contraseñas nuevas no coinciden.'); return; }
    setCargando(true);
    try {
      await authService.cambiarContrasena(form);
      setExito(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cambiar contraseña.');
    } finally { setCargando(false); }
  };

  const campos = [
    { key: 'contrasenaActual', label: '* Contraseña actual', verKey: 'actual' },
    { key: 'nuevaContrasena', label: '* Nueva contraseña', verKey: 'nueva' },
    { key: 'confirmarContrasena', label: '* Confirmar nueva contraseña', verKey: 'confirmar' },
  ];

  return (
    <div className="main-content" style={{ maxWidth: 520, paddingTop: 48 }}>
      <div className="card">
        <div className="card-header">
          <h2>Cambiar Contraseña</h2>
          <p>HU-003 — Administración de cuenta</p>
        </div>
        <div className="card-body">
          {esPrimerIngreso && (
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>
              <span>🔑</span><div><strong>Primer ingreso al sistema.</strong><br />Debe cambiar su contraseña antes de continuar.</div>
            </div>
          )}
          {exito ? (
            <div className="alert alert-success"><span>✅</span><div><strong>Contraseña actualizada.</strong><br />Redirigiendo al panel principal…</div></div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
              {campos.map(({ key, label, verKey }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={ver[verKey] ? 'text' : 'password'} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="form-control" placeholder="••••••••" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setVer(p => ({ ...p, [verKey]: !p[verKey] }))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#90a4ae' }}>
                      {ver[verKey] ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              ))}
              {form.nuevaContrasena && (
                <div style={{ background: '#f8fafc', border: '1px solid #cfd8dc', borderRadius: 6, padding: '12px 14px', marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: '#546e7a', marginBottom: 10 }}>Requisitos de contraseña</div>
                  {REGLAS.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: r.test(form.nuevaContrasena) ? '#2e7d32' : '#bdbdbd' }}>{r.test(form.nuevaContrasena) ? '✓' : '○'}</span>
                      <span style={{ color: r.test(form.nuevaContrasena) ? '#2e7d32' : '#90a4ae' }}>{r.texto}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={cargando}>
                  {cargando ? <><span className="spinner" />Guardando...</> : 'Actualizar contraseña'}
                </button>
                {!esPrimerIngreso && <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancelar</button>}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}