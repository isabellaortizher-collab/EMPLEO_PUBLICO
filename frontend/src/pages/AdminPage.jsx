import React, { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const TIPOS = [
  { value: 'CEDULA_CIUDADANIA', label: 'Cédula de Ciudadanía' },
  { value: 'CEDULA_EXTRANJERIA', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'TARJETA_IDENTIDAD', label: 'Tarjeta de Identidad' },
];
const ROLES = ['SERVIDOR_PUBLICO', 'JEFE_TALENTO_HUMANO', 'ADMIN'];
const LABEL_TIPO = { CEDULA_CIUDADANIA: 'C.C.', CEDULA_EXTRANJERIA: 'C.E.', PASAPORTE: 'Pasaporte', TARJETA_IDENTIDAD: 'T.I.' };
const LABEL_ROL = { SERVIDOR_PUBLICO: 'Servidor Público', JEFE_TALENTO_HUMANO: 'Jefe T.H.', ADMIN: 'Admin' };
const CLASE_ROL = { SERVIDOR_PUBLICO: 'badge-servidor', JEFE_TALENTO_HUMANO: 'badge-jth', ADMIN: 'badge-admin' };

const getRolesActivos = (usuario) => {
  const ahora = new Date();
  return usuario.roles.filter(r => r.activo && (!r.fechaFin || new Date(r.fechaFin) > ahora));
};

export default function AdminPage() {
  const [tab, setTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [formCrear, setFormCrear] = useState({ tipoDocumento: 'CEDULA_CIUDADANIA', numeroIdentificacion: '', correoElectronico: '', rol: 'SERVIDOR_PUBLICO' });
  const [errorCrear, setErrorCrear] = useState('');
  const [exitoCrear, setExitoCrear] = useState(null);
  const [cargandoCrear, setCargandoCrear] = useState(false);
  const [modalInhabilitar, setModalInhabilitar] = useState(null);
  const [formInhabilitar, setFormInhabilitar] = useState({ nombreRol: '', fechaFin: '' });
  const [errorInhabilitar, setErrorInhabilitar] = useState('');
  const [cargandoInhabilitar, setCargandoInhabilitar] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try { const { data } = await authService.getUsuarios(); setUsuarios(data); }
    catch (e) { console.error(e); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  const handleCrearUsuario = async e => {
    e.preventDefault();
    setErrorCrear(''); setExitoCrear(null);
    if (!formCrear.numeroIdentificacion || !formCrear.correoElectronico) { setErrorCrear('Todos los campos son obligatorios.'); return; }
    setCargandoCrear(true);
    try {
      const { data } = await authService.crearUsuario(formCrear);
      setExitoCrear(data);
      setFormCrear({ tipoDocumento: 'CEDULA_CIUDADANIA', numeroIdentificacion: '', correoElectronico: '', rol: 'SERVIDOR_PUBLICO' });
      cargarUsuarios();
    } catch (err) { setErrorCrear(err.response?.data?.mensaje || 'Error al crear usuario.'); }
    finally { setCargandoCrear(false); }
  };

  const abrirModalInhabilitar = (usuario) => {
    const activos = getRolesActivos(usuario);
    if (!activos.length) return;
    setFormInhabilitar({ nombreRol: activos[0].nombre, fechaFin: new Date().toISOString().split('T')[0] });
    setErrorInhabilitar('');
    setModalInhabilitar(usuario);
  };

  const handleInhabilitarRol = async e => {
    e.preventDefault();
    setErrorInhabilitar('');
    setCargandoInhabilitar(true);
    try {
      await authService.inhabilitarRol(modalInhabilitar._id, formInhabilitar);
      setModalInhabilitar(null);
      cargarUsuarios();
    } catch (err) { setErrorInhabilitar(err.response?.data?.mensaje || 'Error al inhabilitar rol.'); }
    finally { setCargandoInhabilitar(false); }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Administración de Usuarios</h1>
        <p>HU-004 & HU-005 — Gestión de servidores públicos</p>
      </div>
      <div className="tabs">
        <button className={`tab-btn ${tab === 'usuarios' ? 'activo' : ''}`} onClick={() => setTab('usuarios')}>Usuarios registrados ({usuarios.length})</button>
        <button className={`tab-btn ${tab === 'crear' ? 'activo' : ''}`} onClick={() => setTab('crear')}>+ Crear usuario</button>
      </div>

      {tab === 'usuarios' && (
        <div className="card">
          <div className="card-header"><h2>Servidores Públicos</h2><p>Lista de usuarios registrados</p></div>
          {cargando ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#90a4ae' }}>
              <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
              <div style={{ marginTop: 12 }}>Cargando…</div>
            </div>
          ) : (
            <div className="tabla-wrapper">
              <table>
                <thead><tr><th>Documento</th><th>Correo</th><th>Roles Activos</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {usuarios.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#90a4ae', padding: 32 }}>No hay usuarios.</td></tr>
                    : usuarios.map(u => {
                        const activos = getRolesActivos(u);
                        return (
                          <tr key={u._id}>
                            <td><div style={{ fontFamily: 'monospace', fontWeight: 500 }}>{u.numeroIdentificacion}</div><div style={{ fontSize: 11, color: '#90a4ae' }}>{LABEL_TIPO[u.tipoDocumento]}</div></td>
                            <td>{u.correoElectronico}</td>
                            <td>{activos.length === 0 ? <span style={{ color: '#90a4ae', fontSize: 12 }}>Sin roles</span> : activos.map(r => <span key={r._id} className={`badge ${CLASE_ROL[r.nombre]}`} style={{ marginRight: 4 }}>{LABEL_ROL[r.nombre]}</span>)}</td>
                            <td><span className={`badge ${u.activo ? 'badge-activo' : 'badge-inactivo'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                            <td style={{ fontSize: 12, color: '#90a4ae' }}>{new Date(u.createdAt).toLocaleDateString('es-CO')}</td>
                            <td>{activos.length > 0 && <button className="btn btn-danger btn-sm" onClick={() => abrirModalInhabilitar(u)}>Inhabilitar rol</button>}</td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'crear' && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-header"><h2>Crear Nuevo Usuario</h2><p>HU-004 — Registro inicial de servidor público</p></div>
          <div className="card-body">
            {exitoCrear && (
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                <span>✅</span>
                <div><strong>Usuario creado.</strong><br /><span style={{ fontFamily: 'monospace', fontSize: 12 }}>Contraseña inicial: <strong>{exitoCrear.usuario?.contrasenaInicial}</strong></span><br /><span style={{ fontSize: 12 }}>El usuario debe cambiarla en su primer ingreso.</span></div>
              </div>
            )}
            {errorCrear && <div className="alert alert-error"><span>⚠</span> {errorCrear}</div>}
            <form onSubmit={handleCrearUsuario}>
              <div className="form-group">
                <label className="form-label">* Tipo de Documento</label>
                <select value={formCrear.tipoDocumento} onChange={e => setFormCrear(p => ({ ...p, tipoDocumento: e.target.value }))} className="form-control">
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">* Número de Identificación</label>
                <input type="text" className="form-control" value={formCrear.numeroIdentificacion} onChange={e => setFormCrear(p => ({ ...p, numeroIdentificacion: e.target.value }))} placeholder="Número de documento" />
              </div>
              <div className="form-group">
                <label className="form-label">* Correo Electrónico</label>
                <input type="email" className="form-control" value={formCrear.correoElectronico} onChange={e => setFormCrear(p => ({ ...p, correoElectronico: e.target.value }))} placeholder="correo@entidad.gov.co" />
              </div>
              <div className="form-group">
                <label className="form-label">* Rol asignado</label>
                <select className="form-control" value={formCrear.rol} onChange={e => setFormCrear(p => ({ ...p, rol: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{LABEL_ROL[r]}</option>)}
                </select>
              </div>
              <div className="alert alert-info" style={{ marginBottom: 20 }}><span>ℹ</span><div style={{ fontSize: 12 }}>La contraseña inicial se generará automáticamente y se mostrará al completar el registro.</div></div>
              <button type="submit" className="btn btn-primary" disabled={cargandoCrear}>
                {cargandoCrear ? <><span className="spinner" />Creando...</> : 'Crear usuario'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalInhabilitar && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalInhabilitar(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Inhabilitar Rol — HU-005</h3>
              <button className="modal-close" onClick={() => setModalInhabilitar(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #cfd8dc', borderRadius: 6, padding: '12px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#546e7a', marginBottom: 4 }}>Funcionario</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{modalInhabilitar.numeroIdentificacion}</div>
                <div style={{ fontSize: 12, color: '#546e7a' }}>{modalInhabilitar.correoElectronico}</div>
              </div>
              {errorInhabilitar && <div className="alert alert-error"><span>⚠</span> {errorInhabilitar}</div>}
              <form onSubmit={handleInhabilitarRol}>
                <div className="form-group">
                  <label className="form-label">* Rol a inhabilitar</label>
                  <select className="form-control" value={formInhabilitar.nombreRol} onChange={e => setFormInhabilitar(p => ({ ...p, nombreRol: e.target.value }))}>
                    {getRolesActivos(modalInhabilitar).map(r => <option key={r._id} value={r.nombre}>{LABEL_ROL[r.nombre]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">* Fecha de fin</label>
                  <input type="date" className="form-control" value={formInhabilitar.fechaFin} onChange={e => setFormInhabilitar(p => ({ ...p, fechaFin: e.target.value }))} />
                  <p className="form-hint">Fecha en que el funcionario entrega su cargo</p>
                </div>
                <div className="alert alert-warning"><span>⚠</span><div style={{ fontSize: 12 }}>Si no quedan roles activos, la cuenta quedará <strong>inactiva</strong>.</div></div>
                <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalInhabilitar(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger" disabled={cargandoInhabilitar}>
                    {cargandoInhabilitar ? <><span className="spinner" style={{ borderTopColor: '#c62828' }} />Inhabilitando...</> : 'Inhabilitar rol'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}