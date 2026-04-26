import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ children, roles }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
        <div style={{ textAlign: 'center', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          <span className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
          <div style={{ marginTop: 16, color: '#546e7a' }}>Cargando SIGEP II…</div>
        </div>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.some(r => usuario.roles?.includes(r))) return <Navigate to="/dashboard" replace />;
  return children;
}