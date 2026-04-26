import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, logout, tieneRol } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <span className="logo-text">sigep<span>II</span></span>
        <span className="navbar-version">v &lt;1.1.21&gt;</span>
      </Link>
      <div className="navbar-right">
        {(tieneRol('JEFE_TALENTO_HUMANO') || tieneRol('ADMIN')) && (
          <Link to="/admin" style={{ color: '#90caf9', fontSize: 13, textDecoration: 'none', padding: '6px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>
            Administración
          </Link>
        )}
        <Link to="/cambiar-contrasena" style={{ color: '#90caf9', fontSize: 13, textDecoration: 'none', padding: '6px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>
          Cambiar Contraseña
        </Link>
        <span className="navbar-user">{usuario?.numeroIdentificacion}</span>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ef9a9a', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}