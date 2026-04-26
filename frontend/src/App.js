import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RecuperarContrasenaPage from './pages/RecuperarContrasenaPage';
import CambiarContrasenaPage from './pages/CambiarContrasenaPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import './index.css';

function LayoutAutenticado() {
  return (
    <div className="layout-auth">
      <Navbar />
      <Outlet />
    </div>
  );
}

function AppRoutes() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage />} />
      <Route element={<RutaProtegida><LayoutAutenticado /></RutaProtegida>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cambiar-contrasena" element={<CambiarContrasenaPage />} />
        <Route path="/admin" element={
          <RutaProtegida roles={['JEFE_TALENTO_HUMANO', 'ADMIN']}><AdminPage /></RutaProtegida>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}