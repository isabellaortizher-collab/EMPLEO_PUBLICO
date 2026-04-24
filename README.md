# 🏛️ SIGEP II — Sistema de Gestión del Empleo Público

> Proyecto de Curso 2026-1 · Universidad Autónoma de Occidente · Facultad de Ingeniería

---

## 👩‍💻 Equipo — Queen Bees

| Integrante | Rol en el proyecto |
|---|---|
| **Isabella Ortiz** | Módulo 1 — Autenticación y Acceso |
| **Isabela Cabezas** | Módulo 2 — Hoja de Vida del Servidor Público |

---

## 📌 ¿Qué es este proyecto?

Sistema web que replica la funcionalidad del módulo de Hoja de Vida del **SIGEP II**, administrado por el Departamento Administrativo de la Función Pública de Colombia. Permite a los servidores públicos gestionar su información laboral y a los Jefes de Talento Humano administrar el acceso al sistema.

---

## ✅ Módulo 1 — Autenticación y Acceso *(Isabella Ortiz)*

Este módulo cubre el ciclo completo de acceso al sistema. Implementa las siguientes Historias de Usuario:

| HU | Descripción |
|---|---|
| **HU-001** | Iniciar sesión con tipo y número de documento |
| **HU-002** | Recuperar contraseña — se envía al correo registrado |
| **HU-003** | Cambiar contraseña con validación de seguridad |
| **HU-004** | El JTH crea el usuario inicial de un nuevo servidor público |
| **HU-005** | El JTH inhabilita el rol de un funcionario registrando fecha de fin |

### Decisiones técnicas del módulo

- El login usa **tipo + número de documento** (no correo), igual que SIGEP II real
- Las contraseñas se guardan **hasheadas** con bcrypt (nunca en texto plano)
- La autenticación usa **JWT** con expiración de 24 horas
- En HU-002 la respuesta siempre es genérica para no revelar si el usuario existe (seguridad)
- En HU-003 el indicador visual muestra en tiempo real si la contraseña cumple los requisitos
- En HU-005 si el funcionario queda sin roles activos, su cuenta se desactiva automáticamente
- El usuario **JTH inicial** se crea automáticamente al arrancar el servidor

---

## 🛠️ Tecnologías usadas

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + React Router v6 |
| Estilos | CSS puro con variables (sin frameworks) |
| Backend | Node.js + Express |
| Base de datos | MongoDB Atlas + Mongoose |
| Autenticación | JWT (jsonwebtoken) + bcryptjs |
| Correo | Nodemailer + Gmail SMTP |

---

## 📁 Estructura del proyecto

```
empleo_publico/
├── backend/
│   ├── middleware/
│   │   └── auth.js              ← Protección JWT y control de roles
│   ├── models/
│   │   └── Usuario.js           ← Esquema MongoDB (usuarios + roles)
│   ├── routes/
│   │   └── auth.js              ← Endpoints HU-001 a HU-005
│   ├── utils/
│   │   └── email.js             ← Envío de correo (HU-002)
│   ├── server.js                ← Entry point del servidor
│   ├── .env                     ← Variables de entorno (NO subir a GitHub)
│   └── package.json
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.js   ← Estado global de autenticación
        ├── services/
        │   └── api.js           ← Axios + interceptores JWT
        ├── components/
        │   ├── Navbar.jsx
        │   └── RutaProtegida.jsx
        ├── pages/
        │   ├── LoginPage.jsx              ← HU-001
        │   ├── RecuperarContrasenaPage.jsx← HU-002
        │   ├── CambiarContrasenaPage.jsx  ← HU-003
        │   ├── AdminPage.jsx              ← HU-004 + HU-005
        │   └── DashboardPage.jsx
        ├── App.js
        ├── index.js
        └── index.css
```

---

## ⚙️ Instalación y configuración

### Requisitos previos

- Node.js v18 o superior
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuita)
- Cuenta de Gmail con verificación en dos pasos activada

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuUsuario/empleo_publico.git
cd empleo_publico
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crea el archivo `.env` dentro de la carpeta `backend/` con este contenido:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxx.mongodb.net/sigep_auth?retryWrites=true&w=majority
JWT_SECRET=sigep_secreto_super_seguro_2026
JWT_EXPIRES_IN=24h

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tucorreo@gmail.com
SMTP_PASS=contraseña_de_aplicacion_sin_espacios
SMTP_FROM=SIGEP II <tucorreo@gmail.com>

FRONTEND_URL=http://localhost:3000
```

> ⚠️ El archivo `.env` está en el `.gitignore` y **no se sube a GitHub** porque contiene contraseñas. Cada integrante debe crear el suyo localmente.

**Para obtener la contraseña de aplicación de Gmail:**
1. Ir a `myaccount.google.com/apppasswords`
2. Crear una nueva con el nombre `SIGEP`
3. Copiar los 16 caracteres **sin espacios** en `SMTP_PASS`

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Verificar que `frontend/package.json` tenga la línea proxy:

```json
"proxy": "http://localhost:5000"
```

---

## ▶️ Cómo correr el proyecto

Abrir **dos terminales** en VS Code:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

Debe aparecer:
```
✅ MongoDB conectado
🚀 Servidor en puerto 5000
👤 JTH recreado: CC 00000001 / Admin@123
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Se abre automáticamente en `http://localhost:3000`

---

## 🔑 Credenciales de prueba

| Campo | Valor |
|---|---|
| Tipo de documento | Cédula de Ciudadanía |
| Número | `00000001` |
| Contraseña | `Admin@123` |
| Rol | Jefe de Talento Humano + Admin |

---

## 🌐 Endpoints del API

| Método | Ruta | HU | Descripción | Protegido |
|---|---|---|---|---|
| POST | `/api/auth/login` | HU-001 | Iniciar sesión | No |
| POST | `/api/auth/recuperar-contrasena` | HU-002 | Recuperar contraseña por correo | No |
| PUT | `/api/auth/cambiar-contrasena` | HU-003 | Cambiar contraseña | Sí |
| POST | `/api/auth/crear-usuario` | HU-004 | Crear usuario (solo JTH) | Sí |
| PUT | `/api/auth/inhabilitar-rol/:id` | HU-005 | Inhabilitar rol con fecha fin (solo JTH) | Sí |
| GET | `/api/auth/me` | — | Info del usuario autenticado | Sí |
| GET | `/api/auth/usuarios` | — | Listar todos los usuarios (solo JTH) | Sí |

---

## 🗄️ Modelo de datos — Usuario

```js
{
  tipoDocumento: String,        // CEDULA_CIUDADANIA | CEDULA_EXTRANJERIA | PASAPORTE | TARJETA_IDENTIDAD
  numeroIdentificacion: String, // único junto con tipoDocumento
  correoElectronico: String,
  contrasena: String,           // hasheada con bcrypt, nunca retornada en queries
  roles: [
    {
      nombre: String,           // SERVIDOR_PUBLICO | JEFE_TALENTO_HUMANO | ADMIN
      activo: Boolean,
      fechaInicio: Date,
      fechaFin: Date            // null si sigue activo — HU-005
    }
  ],
  activo: Boolean,
  primerIngreso: Boolean,       // true = debe cambiar contraseña al ingresar
  creadoPor: ObjectId           // referencia al JTH que lo creó
}
```

---

## 📋 Módulo 2 — Hoja de Vida *(Isabela Cabezas — por implementar)*

El Módulo 2 cubre las HU-006 a HU-015 y debe construirse sobre esta misma base. Algunos puntos importantes para continuar:

- El sistema de autenticación ya está listo — usar `useAuth()` del `AuthContext` para obtener el usuario actual
- Para proteger rutas nuevas usar el componente `<RutaProtegida>` ya existente
- Los nuevos endpoints del backend deben crearse en `backend/routes/` e importarse en `server.js`
- Los estilos globales están en `frontend/src/index.css` con variables CSS — úsalas para mantener consistencia visual
- La conexión a MongoDB Atlas ya está configurada — solo agregar los nuevos modelos en `backend/models/`

---

## 📝 Notas adicionales

- El proyecto usa **nodemon** en desarrollo, por lo que el servidor se reinicia automáticamente al guardar cambios
- El frontend usa el **proxy** de React para redirigir las llamadas `/api` al backend en puerto 5000
- Los archivos `node_modules/` y `.env` están en `.gitignore` y no se suben al repositorio
