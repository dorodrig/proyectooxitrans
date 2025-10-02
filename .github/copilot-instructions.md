# Instrucciones para GitHub Copilot

Este es el **Sistema de Control de Acceso de Empleados** para OXITRANS S.A.S - una aplicación fullstack con frontend React/TypeScript, backend Express/TypeScript y base de datos MySQL.

## Arquitectura del Sistema

### Estructura de Directorios
- `src/` - Frontend React con TypeScript
- `server/src/` - Backend Express con TypeScript  
- `database/` - Scripts SQL y migraciones
- `tests/` - Tests E2E con fetch API nativo
- `android/` - App móvil con Capacitor

### Backend API Patterns
- **Base URL**: `/api` proxy a `localhost:3001` en desarrollo
- **Autenticación**: JWT tokens con middleware en `server/src/middleware/`
- **Estructura de respuesta**: `{ success: boolean, data?: any, message?: string }`
- **Rutas modulares**: Cada entidad tiene su propio router en `server/src/routes/`
- **Entidades principales**: usuarios, registros_acceso, cargos, regionales, novedades, jornadas

### Frontend State Management
- **Zustand**: Store principal en `src/stores/authStore.ts` con persist middleware
- **React Query**: Para data fetching con QueryClient configurado en App.tsx
- **Lazy Loading**: Páginas administrativas cargadas bajo demanda
- **Routing**: React Router con protección de rutas basada en roles

### Database & Scripts
- **Schema**: MySQL con timezone UTC+5 (Colombia) en `database/schema.sql`
- **Seeders**: Scripts seguros en `database/` con prefijo `seed_`
- **Actualizaciones**: Usar `database/ejecutar_*.bat` para Windows
- **Diagnóstico**: Scripts `verify_*` y `fix_*` para troubleshooting

## Flujos de Desarrollo

### Testing de API
```bash
# Test específico de endpoint
node tests/complete-test.mjs

# Test CRUD completo  
node tests/crud-test.mjs

# Health check de producción
node tests/production-check.mjs
```

### Deployment
```bash
# Build y deploy a GitHub Pages
npm run deploy

# Solo build
npm run build

# Desarrollo fullstack
npm run dev:fullstack
```

### Mobile App
```bash
# Sincronizar cambios
npm run mobile:build

# Abrir en Android Studio
npm run mobile:android
```

## Patrones de Código Específicos

### Manejo de Errores API
```typescript
// En servicios - siempre usar esta estructura
const response = await api.get('/api/usuarios');
if (!response.data.success) {
  throw new Error(response.data.message || 'Error desconocido');
}
return response.data.data;
```

### Componentes con Estado
```typescript
// Usar Zustand para estado global, React Query para servidor
const { usuario, isAuthenticated } = useAuthStore();
const { data: usuarios, isLoading } = useQuery({
  queryKey: ['usuarios'],
  queryFn: usuariosService.getAll
});
```

### Naming Conventions
- **Base de datos**: snake_case (`registros_acceso`, `fecha_ingreso`)
- **TypeScript**: camelCase para variables, PascalCase para tipos
- **Componentes**: PascalCase con sufijo descriptivo (`AdminUsuariosPage`)
- **Archivos**: kebab-case para scripts, camelCase para TS/TSX

### Variables de Entorno
- Frontend: usar `VITE_` prefix para variables públicas
- Backend: `.env` en `/server/` con fallbacks en código
- Producción: GitHub Pages (frontend) + Render.com (backend)

## Troubleshooting Común

### Database Issues
- Ejecutar `server/full_diagnosis.js` para diagnosticar
- Verificar timezone con `database/fix_timezone_simple.sql`  
- Recrear jornadas con `database/seed_jornadas_laborales.sql`

### Build Issues
- Limpiar caché: `rm -rf node_modules dist && npm install`
- Verificar rutas: base path debe ser `/proyectooxitrans/` en producción

### Authentication Issues
- Token se persiste en localStorage + Zustand
- Verificar middleware de auth en backend
- Admin default: documento `12345678`, password `admin123`
