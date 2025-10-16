# Configuración de Tiempo Laboral Global OXITRANS

## 📋 Descripción

El módulo de **Configuración de Tiempo Laboral Global** permite a los administradores del sistema establecer y ajustar el horario de trabajo estándar que aplica a todos los empleados de OXITRANS. Esta configuración centralizada garantiza consistencia en los horarios laborales de toda la organización.

## 🎯 Características Principales

### ✅ Configuración Única Global
- **Un solo horario** para todos los empleados
- **Gestión centralizada** por administradores
- **Aplicación automática** a todos los usuarios del sistema

### ⏰ Parámetros Configurables
- **Hora de Inicio**: Hora de entrada al trabajo (formato HH:MM)
- **Horas de Trabajo**: Duración de la jornada laboral (4-10 horas)
- **Hora de Salida**: Calculada automáticamente (incluye hora de almuerzo)

### 🔧 Validaciones Integradas
- Horarios dentro de rangos laborales válidos
- Cumplimiento con regulaciones laborales colombianas
- Validación de formato de hora (HH:MM)
- Límites mínimos y máximos de horas de trabajo

## 🏗️ Arquitectura Técnica

### Frontend (React + TypeScript)
```
src/pages/admin/AsignarJornadaLaboralPage.tsx
├── Interfaz TiempoLaboralGlobal
├── Estado global con Zustand
├── Validación de formularios
└── Componentes de UI reutilizables

src/services/jornadaConfigService.ts
├── TiempoLaboralService (singleton)
├── Métodos GET/POST para configuración global
├── Validaciones de negocio
└── Sugerencias de horarios comunes
```

### Backend (Node.js + Express + TypeScript)
```
server/src/controllers/jornadaConfigController.ts
├── obtenerConfiguracionGlobal()
├── crearConfiguracionGlobal()
└── validaciones de seguridad

server/src/models/JornadaConfigModel.ts
├── obtenerConfiguracionGlobal()
├── actualizarConfiguracionGlobal()
└── gestión de registro único

server/src/routes/jornadaConfig.ts
├── GET /api/jornada-config/global
├── POST /api/jornada-config/global
└── Middleware de autenticación y rate limiting
```

### Base de Datos (MySQL)
```sql
jornadas_config
├── id (PRIMARY KEY)
├── hora_entrada (TIME)
├── tiempo_trabajo_dia (DECIMAL)
├── fin_jornada_laboral (TIME)
├── usuario_id (-1 para configuración global)
├── activa (BOOLEAN)
├── fecha_creacion (TIMESTAMP)
└── fecha_actualizacion (TIMESTAMP)
```

## 🚀 Funcionalidades

### 1. Visualización de Configuración Actual
- Muestra horario actual de toda la empresa
- Fecha de última actualización
- Cálculo automático de horas extras (>8 horas)

### 2. Edición de Horarios
- Formulario intuitivo para cambios
- Sugerencias de horarios comunes:
  - Jornada Estándar (08:00 - 8h)
  - Jornada Matutina (07:00 - 8h)
  - Jornada Tarde (14:00 - 8h)
  - Media Jornada (08:00 - 4h)
  - Jornada Extendida (08:00 - 9h)

### 3. Validaciones de Negocio
```typescript
// Validaciones implementadas
- Hora de inicio: Formato HH:MM válido
- Horas de trabajo: Entre 4 y 10 horas
- Regulaciones colombianas: Máximo 10 horas/día
- Cálculo automático: Hora salida = inicio + trabajo + 1h almuerzo
```

## 🔒 Seguridad y Permisos

### Control de Acceso
- **Solo administradores** pueden modificar la configuración
- Autenticación JWT requerida
- Rate limiting aplicado a todas las operaciones

### Auditoría
- Registro de fecha/hora de cambios
- Log de usuario que realizó modificaciones
- Historial de configuraciones anteriores (backup)

## 📊 Flujo de Uso

### 1. Acceso al Módulo
```
Dashboard Admin → Configuración → Tiempo Laboral Global
```

### 2. Visualización
```
┌─────────────────────────────────────┐
│         TIEMPO LABORAL GLOBAL       │
├─────────────────────────────────────┤
│ 🕒 Hora Inicio:    08:00           │
│ ⏱️  Horas Trabajo:  8 horas         │
│ 🕔 Hora Salida:    17:00           │
│ 📅 Actualizado:    2025-01-06     │
└─────────────────────────────────────┘
```

### 3. Edición
```
1. Seleccionar horario sugerido o personalizar
2. Ajustar hora de inicio y horas de trabajo
3. Validación automática de parámetros
4. Confirmación y aplicación global
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- Variables de entorno configuradas

### Migración de Datos
```bash
# Ejecutar migración SQL
mysql -u root -p oxitrans_access_control < database/migrate_to_global_config.sql

# O usar script inteligente
node database/migrate_to_global_config.mjs
```

### Variables de Entorno
```env
DB_HOST=localhost
DB_USER=oxitrans_user
DB_PASSWORD=secure_password
DB_NAME=oxitrans_access_control
JWT_SECRET=your_jwt_secret
```

## 🧪 Testing

### Pruebas de API
```bash
# Obtener configuración global
GET /api/jornada-config/global
Authorization: Bearer <admin_token>

# Actualizar configuración
POST /api/jornada-config/global
Content-Type: application/json
Authorization: Bearer <admin_token>
{
  "horaInicio": "08:00",
  "horasTrabajo": 8,
  "horaSalida": "17:00"
}
```

### Scripts de Prueba
```bash
# Ejecutar pruebas del módulo
npm run test:jornada-config

# Pruebas de integración
npm run test:integration
```

## 📈 Monitoreo y Métricas

### Logs del Sistema
```typescript
🔍 [tiempoLaboral] Obteniendo configuración global
✅ [tiempoLaboral] Configuración actualizada exitosamente
⚠️ [tiempoLaboral] Intento de acceso no autorizado
```

### Métricas Relevantes
- Frecuencia de cambios de configuración
- Usuarios que acceden al módulo
- Errores de validación más comunes

## 🤝 Soporte y Mantenimiento

### Problemas Comunes
1. **Error 403**: Usuario sin permisos de administrador
2. **Error 400**: Parámetros de horario inválidos
3. **Error 500**: Problema de conexión a base de datos

### Contacto Técnico
- Desarrollador: GitHub Copilot
- Documentación: `/DOCUMENTATION/`
- Issues: Usar sistema de tickets interno

---

**Versión**: 2.0.0 (Configuración Global)  
**Fecha**: 2025-01-06  
**Estado**: Producción  
**Compatibilidad**: OXITRANS Access Control v3.x+