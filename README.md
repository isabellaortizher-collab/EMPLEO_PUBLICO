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

## 📋 Módulo 2 — Hoja de Vida *(Isabela Cabezas)*

## Descripción

Este módulo implementa el sistema de gestión de hoja de vida para servidores públicos, compatible con el módulo de Hoja de Vida del **SIGEP II**, administrado por el Departamento Administrativo de la Función Pública de Colombia.

La hoja de vida se crea una única vez por persona y aplica para sucesivas vinculaciones a distintas entidades. El servidor diligencia sus propios datos y el Jefe de Talento Humano (JTH) valida la información contrastándola con los soportes físicos.

---

## Historias de Usuario implementadas

| HU | Descripción |
|----|-------------|
| HU-006 | Registro de datos personales (nombres, apellidos, documento, fecha de nacimiento, género, contacto y dirección) |
| HU-007 | Soporte para residencia en zona rural mediante campo de complemento o dirección especial |
| HU-008 | Registro de formación académica (pregrado, posgrado, tarjeta profesional) con soporte PDF máx. 2 MB |
| HU-009 | Registro de experiencia laboral pública, privada y docente con certificaciones |
| HU-010 | Sección de Gerencia Pública habilitada condicionalmente por el JTH según el cargo |
| HU-011 | Guardado independiente por sección sin perder información en caso de interrupciones |
| HU-012 | Identificación visual de campos obligatorios marcados con asterisco (*) |
| HU-013 | Adjuntar documentos de soporte en PDF o JPG con tamaño máximo de 2 MB |
| HU-014 | Previsualización de documentos adjuntos mediante botón "Ver soporte" |
| HU-015 | Descarga e impresión de la hoja de vida completa desde el sistema |

---

## Roles

| Rol | Permisos en este módulo |
|-----|------------------------|
| Servidor Público | Diligencia y guarda su propia hoja de vida |
| Jefe de Talento Humano | Valida secciones, habilita Gerencia Pública, levanta validaciones |

---

## Estructura de archivos

```
EMPLEO_PUBLICO/
├── backend/
│   ├── models/
│   │   └── HojaDeVida.js          # Modelo MongoDB con sub-esquemas
│   └── routes/
│       └── hojaDeVida.js          # Endpoints REST del módulo
└── frontend/
    └── src/
        ├── pages/
        │   └── HojaDeVidaPage.jsx         # Página principal con navegación por secciones
        ├── components/
        │   └── hojaDeVida/
        │       ├── DatosPersonalesForm.jsx
        │       ├── FormacionAcademicaForm.jsx
        │       ├── ExperienciaLaboralForm.jsx
        │       ├── GerenciaPublicaForm.jsx
        │       └── ResumenHV.jsx
        ├── services/
        │   └── hojaDeVidaApi.js           # Llamadas a la API del módulo
        └── styles/
            └── hojaDeVida.css             # Estilos del módulo
```

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/hoja-de-vida/progreso` | Progreso general de secciones |
| GET | `/api/hoja-de-vida/datos-personales` | Obtener datos personales |
| PUT | `/api/hoja-de-vida/datos-personales` | Guardar datos personales |
| GET | `/api/hoja-de-vida/formacion-academica` | Listar formación académica |
| POST | `/api/hoja-de-vida/formacion-academica` | Agregar formación con soporte |
| DELETE | `/api/hoja-de-vida/formacion-academica/:id` | Eliminar registro de formación |
| GET | `/api/hoja-de-vida/experiencia-laboral` | Listar experiencia laboral |
| POST | `/api/hoja-de-vida/experiencia-laboral` | Agregar experiencia con soporte |
| DELETE | `/api/hoja-de-vida/experiencia-laboral/:id` | Eliminar registro de experiencia |
| GET | `/api/hoja-de-vida/gerencia-publica` | Obtener gerencia pública |
| POST | `/api/hoja-de-vida/gerencia-publica` | Agregar registro de gerencia |
| GET | `/api/hoja-de-vida/soporte/:filename` | Previsualizar documento adjunto |
| GET | `/api/hoja-de-vida/descargar` | Descargar hoja de vida completa |
| PUT | `/api/hoja-de-vida/admin/habilitar-gerencia/:id` | JTH: habilitar Gerencia Pública |
| PUT | `/api/hoja-de-vida/admin/validar/:id` | JTH: validar o desbloquear sección |

Todos los endpoints requieren autenticación mediante JWT en el header `Authorization: Bearer <token>`.

---

## Modelo de datos

La hoja de vida se almacena en MongoDB con la siguiente estructura principal:

```json
{
  "usuario": "ObjectId",
  "datosPersonales": {
    "nombres": "", "apellidos": "", "tipoDocumento": "",
    "numeroDocumento": "", "fechaNacimiento": "", "genero": "",
    "correoElectronico": "", "celular": "", "telefono": "",
    "tipoZona": "URBANA | RURAL", "departamento": "", "municipio": "",
    "direccion": "", "complementoDireccion": "", "validado": false
  },
  "formacionAcademica": [],
  "experienciaLaboral": [],
  "tieneGerenciaPublica": false,
  "gerenciaPublica": [],
  "seccionesGuardadas": {
    "datosPersonales": false,
    "formacionAcademica": false,
    "experienciaLaboral": false,
    "gerenciaPublica": false
  }
}
```

---

## Dependencias agregadas

```bash
# Backend
npm install multer
```

No se agregaron dependencias nuevas en el frontend.

---

## Configuración

### Variables de entorno (`.env`)
No se requieren variables nuevas. El módulo usa las mismas del Módulo 1.

### Archivos subidos
Los soportes adjuntados por los usuarios se guardan en `backend/uploads/`. Esta carpeta está excluida del repositorio mediante `.gitignore`.

---

## Instrucciones de ejecución

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm start
```

Acceder en: `http://localhost:3000` → iniciar sesión → clic en **Mi Hoja de Vida**.

---

## Universidad Autónoma de Occidente
**Facultad de Ingeniería — Proyecto Informático**  
SIGEP II — Sistema de Gestión del Empleo Público
