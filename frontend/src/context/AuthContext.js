import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('sigep_usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      const token = localStorage.getItem('sigep_token');
      if (token) {
        try {
          const { data } = await authService.getMe();
          setUsuario(data);
          localStorage.setItem('sigep_usuario', JSON.stringify(data));
        } catch {
          localStorage.removeItem('sigep_token');
          localStorage.removeItem('sigep_usuario');
          setUsuario(null);
        }
      }
      setCargando(false);
    };
    verificar();
  }, []);

  const login = async (credenciales) => {
    const { data } = await authService.login(credenciales);
    localStorage.setItem('sigep_token', data.token);
    localStorage.setItem('sigep_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sigep_token');
    localStorage.removeItem('sigep_usuario');
    setUsuario(null);
  };

  const tieneRol = (rol) => usuario?.roles?.includes(rol);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, tieneRol }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);