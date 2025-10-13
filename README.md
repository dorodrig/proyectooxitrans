# 🏢 Sistema de Control de Acceso - OXITRANS S.A.S

> **Status**: ✅ Desplegado en Producción - Frontend: GitHub Pages | Backend: Render.com

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/React-18.0+-61DAFB.svg" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8+-3178C6.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-18.0+-339933.svg" alt="Node.js" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</div>

<br />

<p align="center">
  <strong>Sistema integral de control de acceso para empleados con aplicación web, móvil y PWA.</strong><br>
  Desarrollado específicamente para OXITRANS S.A.S con tecnologías modernas y arquitectura escalable.
</p>

---

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características Principales](#-características-principales)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [📋 Prerequisitos](#-prerequisitos)
- [🚀 Instalación y Configuración](#-instalación-y-configuración)
- [🔧 Desarrollo](#-desarrollo)
- [📱 Aplicación Móvil](#-aplicación-móvil)
- [🌐 Progressive Web App (PWA)](#-progressive-web-app-pwa)
- [🗄️ Base de Datos](#️-base-de-datos)
- [🔐 Autenticación y Seguridad](#-autenticación-y-seguridad)
- [📚 Documentación API](#-documentación-api)
- [🧪 Testing](#-testing)
- [🚀 Despliegue](#-despliegue)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## 🎯 Descripción del Proyecto

El **Sistema de Control de Acceso de OXITRANS S.A.S** es una solución integral que permite gestionar el acceso de empleados a las instalaciones de la empresa. El sistema registra entradas y salidas, genera reportes detallados y proporciona herramientas administrativas para el control del personal.

### 🎯 Objetivos

- **Digitalizar** el control de acceso tradicional
- **Automatizar** el registro de asistencia
- **Generar** reportes y estadísticas en tiempo real
- **Mejorar** la seguridad y control de personal
- **Optimizar** los procesos administrativos

---

## ✨ Características Principales

### 🖥️ Dashboard Administrativo
- ✅ Gestión completa de empleados (CRUD)
- ✅ Reportes de asistencia por empleado/departamento
- ✅ Estadísticas en tiempo real
- ✅ Control de roles y permisos
- ✅ Configuración del sistema

### 👤 Gestión de Empleados
- ✅ Registro de empleados con datos completos
- ✅ Asignación de códigos de acceso únicos
- ✅ Control de estados (activo, inactivo, suspendido)
- ✅ Gestión por departamentos y cargos
- ✅ Upload de fotografías de perfil

### 📊 Registros de Acceso
- ✅ Registro automático de entradas y salidas
- ✅ Geolocalización opcional
- ✅ Timestamp preciso con zona horaria
- ✅ Identificación de dispositivo
- ✅ Notas adicionales por registro

### 📱 Aplicación Móvil
- ✅ App nativa para Android e iOS
- ✅ Registro rápido con código QR
- ✅ Funcionalidad offline
- ✅ Sincronización automática
- ✅ Interface optimizada para móviles

### 🔔 Notificaciones
- ✅ Alertas en tiempo real
- ✅ Notificaciones push móviles
- ✅ Historial de notificaciones
- ✅ Configuración personalizable

### ⏰ Configuración de Tiempo Laboral Global
- ✅ **Configuración única** para todos los empleados OXITRANS
- ✅ **Gestión centralizada** por administradores del sistema
- ✅ **Horarios estándar** con validaciones laborales colombianas
- ✅ **Cálculo automático** de horas extras y tiempo de almuerzo
- ✅ **Sugerencias inteligentes** de horarios comunes
- ✅ **Migración automática** desde configuraciones individuales

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend Web  │    │   Mobile App    │    │      PWA        │
│   (React TS)    │    │   (Capacitor)   │    │   (Workbox)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Backend API           │
                    │     (Express + TS)        │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     Base de Datos         │
                    │     (MySQL)               │
                    └───────────────────────────┘
```

### 🔧 Componentes Principales

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Base de Datos**: MySQL 8.0+
- **Autenticación**: JWT + bcrypt
- **Estado**: Zustand + React Query
- **Estilos**: Tailwind CSS + Framer Motion

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Librería de UI con hooks
- **TypeScript 5.8+** - Tipado estático
- **Vite 7** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **Framer Motion** - Animaciones fluidas
- **Zustand** - Gestión de estado ligera
- **React Query** - Manejo de datos del servidor
- **React Router v7** - Navegación SPA
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Lucide React** - Iconografía moderna

### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express 4** - Framework web minimalista
- **TypeScript** - Desarrollo backend tipado
- **MySQL2** - Driver para MySQL
- **bcryptjs** - Hash de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **express-validator** - Validación de datos
- **helmet** - Seguridad HTTP
- **cors** - Control de CORS
- **morgan** - Logging HTTP
- **compression** - Compresión gzip

### Móvil & PWA
- **Capacitor 7** - Framework híbrido
- **Workbox** - Service Worker para PWA
- **Web Push** - Notificaciones push

### DevOps & Tools
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Nodemon** - Auto-reload en desarrollo
- **Concurrently** - Ejecutar múltiples comandos

---

## 📋 Prerequisitos

### Requerimientos del Sistema
- **Node.js** 18.0+ 
- **npm** 9.0+ o **yarn** 1.22+
- **MySQL** 8.0+
- **Git** 2.30+

### Opcional (para desarrollo móvil)
- **Android Studio** (para Android)
- **Xcode** (para iOS - solo macOS)

### Verificar Instalación
```bash
node --version  # Debe ser v18.0+
npm --version   # Debe ser v9.0+
mysql --version # Debe ser v8.0+
```

---

## 🚀 Instalación y Configuración

### 1. 📥 Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/oxitrans-control-acceso.git
cd oxitrans-control-acceso
```

### 2. 📦 Instalar Dependencias

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd server
npm install
cd ..
```

### 3. 🗄️ Configurar Base de Datos

#### Crear Base de Datos
```bash
mysql -u root -p < database/schema.sql
```

#### Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp server/.env.example server/.env

# Editar configuración
nano server/.env
```

#### Configuración `.env` del servidor:
```env
# Puerto del servidor
PORT=3001

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=control_acceso_oxitrans

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Configuración de archivos
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### 4. 🏃‍♂️ Ejecutar el Proyecto

#### Desarrollo Full-Stack
```bash
npm run dev:fullstack
```

#### Solo Frontend
```bash
npm run dev
```

#### Solo Backend
```bash
npm run dev:server
```

### 5. 🌐 Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

### 6. 🔑 Credenciales por Defecto

```
Email: admin@oxitrans.com
Contraseña: admin123
Rol: Administrador
```

---

## 🔧 Desarrollo

### 📁 Estructura del Proyecto

```
oxitrans-control-acceso/
├── 📁 src/                    # Frontend React
│   ├── 📁 components/         # Componentes reutilizables
│   ├── 📁 pages/             # Páginas de la aplicación
│   ├── 📁 services/          # Servicios API
│   ├── 📁 stores/            # Estados globales (Zustand)
│   ├── 📁 types/             # Tipos TypeScript
│   ├── 📁 hooks/             # Custom hooks
│   ├── 📁 utils/             # Utilidades
│   └── 📁 styles/            # Estilos globales
├── 📁 server/                # Backend Node.js
│   ├── 📁 src/
│   │   ├── 📁 controllers/   # Controladores
│   │   ├── 📁 models/        # Modelos de datos
│   │   ├── 📁 routes/        # Rutas API
│   │   ├── 📁 middleware/    # Middleware
│   │   ├── 📁 config/        # Configuración
│   │   ├── 📁 services/      # Servicios de negocio
│   │   └── 📁 types/         # Tipos compartidos
│   └── 📄 .env               # Variables de entorno
├── 📁 database/              # Scripts de DB
├── 📁 shared/                # Código compartido
├── 📁 public/                # Archivos estáticos
└── 📄 README.md
```

### 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev                   # Iniciar frontend
npm run dev:server           # Iniciar backend
npm run dev:fullstack        # Iniciar frontend + backend

# Build
npm run build                # Build frontend
npm run build:server         # Build backend
npm run build:fullstack      # Build completo

# Móvil
npm run mobile:init          # Inicializar Capacitor
npm run mobile:build         # Build para móvil
npm run mobile:android       # Abrir Android Studio
npm run mobile:ios           # Abrir Xcode

# PWA
npm run pwa:build           # Build PWA con Service Worker

# Calidad de Código
npm run lint                # Ejecutar ESLint
npm run lint:fix            # Corregir errores de lint
npm run type-check          # Verificar tipos TypeScript

# Producción
npm start                   # Iniciar en producción
```

---

## 📱 Aplicación Móvil

### 🔧 Configuración Inicial

```bash
# Inicializar Capacitor
npm run mobile:init

# Construir aplicación
npm run mobile:build

# Sincronizar cambios
npx cap sync
```

### 📱 Desarrollo Android

```bash
# Abrir Android Studio
npm run mobile:android

# O directamente
npx cap open android
```

### 🍎 Desarrollo iOS

```bash
# Abrir Xcode (solo macOS)
npm run mobile:ios

# O directamente
npx cap open ios
```

### 📦 Build para Producción

```bash
# Android APK
cd android
./gradlew assembleRelease

# iOS (requiere certificados)
# Usar Xcode para build de producción
```

---

## 🌐 Progressive Web App (PWA)

### ✨ Características PWA

- ✅ **Instalable** en dispositivos
- ✅ **Funciona offline** con cache inteligente
- ✅ **Push notifications** nativas
- ✅ **Actualizaciones automáticas**
- ✅ **Performance** optimizado

### 🔧 Configuración

El PWA está configurado automáticamente con:

- **Manifest.json** - Configuración de la app
- **Service Worker** - Cache y funcionalidad offline
- **Workbox** - Estrategias de cache avanzadas

### 🚀 Build PWA

```bash
npm run pwa:build
```

---

## 🗄️ Base de Datos

### 📊 Esquema Principal

#### Tablas Principales
- **usuarios** - Datos de empleados y administradores
- **registros_acceso** - Registro de entradas/salidas
- **empresa** - Configuración de la empresa
- **notificaciones** - Sistema de notificaciones
- **sesiones** - Control de sesiones JWT

### 🔧 Gestión de Base de Datos

```bash
# Crear base de datos inicial
mysql -u root -p < database/schema.sql

# Backup
mysqldump -u root -p control_acceso_oxitrans > backup.sql

# Restaurar
mysql -u root -p control_acceso_oxitrans < backup.sql
```

### 📈 Optimizaciones

- **Índices** optimizados para consultas frecuentes
- **Vistas** pre-calculadas para reportes
- **Procedimientos almacenados** para operaciones complejas
- **Triggers** para auditoría automática

---

## 🔐 Autenticación y Seguridad

### 🛡️ Características de Seguridad

- **JWT** con expiración configurable
- **bcrypt** para hash de contraseñas
- **Helmet** para headers de seguridad
- **CORS** configurado específicamente
- **Rate limiting** en endpoints críticos
- **Validación** estricta de datos de entrada

### 🔑 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso completo al sistema |
| **Supervisor** | Gestión de empleados de su departamento |
| **Empleado** | Solo registro de acceso personal |

### 🚨 Mejores Prácticas

- Tokens JWT con tiempo de vida limitado
- Passwords con hash seguro (bcrypt, salt rounds: 10)
- Validación en frontend y backend
- Sanitización de inputs
- Logs de seguridad

---

## 📚 Documentación API

### 🌐 Base URL
```
http://localhost:3001/api
```

### 🔐 Autenticación

#### POST `/auth/login`
```json
{
  "email": "admin@oxitrans.com",
  "password": "admin123"
}
```

#### GET `/auth/verify`
```bash
Authorization: Bearer <token>
```

### 👥 Usuarios

#### GET `/usuarios`
- Lista todos los usuarios (admin/supervisor)

#### POST `/usuarios`
- Crear nuevo usuario

#### PUT `/usuarios/:id`
- Actualizar usuario

#### DELETE `/usuarios/:id`
- Eliminar usuario

### 📊 Registros

#### GET `/registros`
- Obtener registros de acceso

#### POST `/registros/entrada`
- Registrar entrada

#### POST `/registros/salida`
- Registrar salida

### 📈 Respuestas API

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

---

## 🧪 Testing

### 🔧 Configurar Testing

```bash
# Instalar dependencias de testing
npm install --save-dev jest @testing-library/react

# Ejecutar tests
npm run test

# Coverage
npm run test:coverage
```

### 📝 Tipos de Tests

- **Unit Tests** - Componentes individuales
- **Integration Tests** - Flujos de usuario
- **API Tests** - Endpoints del backend
- **E2E Tests** - Flujos completos

---

## 🚀 Despliegue

### 🌐 Producción Web

#### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy de carpeta dist/
```

#### Backend (Heroku/DigitalOcean)
```bash
npm run build:server
npm start
```

### 📱 Móvil

#### Android (Google Play Store)
```bash
cd android
./gradlew bundleRelease
```

#### iOS (App Store)
```bash
# Usar Xcode para build de distribución
```

### 🔧 Variables de Entorno Producción

```env
NODE_ENV=production
PORT=80
DB_HOST=tu-servidor-mysql
JWT_SECRET=jwt-secret-super-seguro-produccion
```

---

## 🤝 Contribución

### 📋 Proceso de Contribución

1. **Fork** el repositorio
2. **Crear** rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear** Pull Request

### 📝 Convenciones

#### Commits (Conventional Commits)
```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar tests
chore: tareas de mantenimiento
```

#### Código
- **TypeScript** estricto
- **ESLint** sin errores
- **Componentes** funcionales con hooks
- **Nombres** descriptivos en español para dominio de negocio

---

## 📞 Soporte y Contacto

### 🏢 OXITRANS S.A.S
- **Email**: admin@oxitrans.com
- **Teléfono**: +57 123 456 7890
- **Dirección**: Calle Principal #123, Ciudad, País

### 👨‍💻 Desarrollo
- **GitHub Issues**: Para reportar bugs
- **Pull Requests**: Para contribuciones
- **Wiki**: Documentación técnica detallada

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **OXITRANS S.A.S** - Por confiar en este proyecto
- **Equipo de Desarrollo** - Por su dedicación y esfuerzo
- **Comunidad Open Source** - Por las herramientas y librerías utilizadas

---

<div align="center">
  <p><strong>Desarrollado con ❤️ para OXITRANS S.A.S</strong></p>
  <p>Sistema de Control de Acceso v1.0.0</p>
</div>
