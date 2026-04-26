import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MODULOS = [
  { id: 'hoja-vida', titulo: 'Mi Hoja de Vida', desc: 'Gestione su información personal, educación y experiencia laboral', icono: '📋', roles: ['SERVIDOR_PUBLICO', 'JEFE_TALENTO_HUMANO', 'ADMIN'], ruta: '/hoja-vida' },
  { id: 'admin', titulo: 'Administración de Usuarios', desc: 'Cree usuarios, asigne roles e inhabilite accesos', icono: '👥', roles: ['JEFE_TALENTO_HUMANO', 'ADMIN'], ruta: '/admin' },
  { id: 'cambiar-contrasena', titulo: 'Cambiar Contraseña', desc: 'Actualice su contraseña de acceso al sistema', icono: '🔐', roles: ['SERVIDOR_PUBLICO', 'JEFE_TALENTO_HUMANO', 'ADMIN'], ruta: '/cambiar-contrasena' },
];

const LABEL_ROL = { SERVIDOR_PUBLICO: 'Servidor Público', JEFE_TALENTO_HUMANO: 'Jefe T.H.', ADMIN: 'Admin' };
const CLASE_ROL = { SERVIDOR_PUBLICO: 'badge-servidor', JEFE_TALENTO_HUMANO: 'badge-jth', ADMIN: 'badge-admin' };

export default function DashboardPage() {
  const { usuario } = useAuth();
  const modulosVisibles = MODULOS.filter(m => m.roles.some(r => usuario?.roles?.includes(r)));

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Bienvenido/a al sistema</h1>
        <p>SIGEP II — Sistema de Gestión del Empleo Público</p>
      </div>
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-body" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #1a4a7a, #0091ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
            {usuario?.numeroIdentificacion?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16, color: '#0d2b4e', marginBottom: 4 }}>{usuario?.numeroIdentificacion}</div>
            <div style={{ fontSize: 13, color: '#546e7a', marginBottom: 8 }}>{usuario?.correoElectronico}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {usuario?.roles?.map(r => <span key={r} className={`badge ${CLASE_ROL[r]}`}>{LABEL_ROL[r]}</span>)}
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        {modulosVisibles.map(m => (
          <Link key={m.id} to={m.ruta} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', height: '100%' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>{m.icono}</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#0d2b4e', marginBottom: 8 }}>{m.titulo}</div>
                <div style={{ fontSize: 12, color: '#78909c', lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {usuario?.primerIngreso && (
        <div className="alert alert-warning">
          <span>🔑</span>
          <div><strong>Debe cambiar su contraseña.</strong> <Link to="/cambiar-contrasena?primer-ingreso=true" style={{ color: '#f57c00', fontWeight: 600 }}>Cambiar ahora →</Link></div>
        </div>
      )}
    </div>
  );
}