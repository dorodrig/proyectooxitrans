# Instrucciones para GitHub Copilot

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

Este es un proyecto de **Sistema de Control de Acceso de Empleados** para OXITRANS S.A.S desarrollado con React TypeScript y Vite.

## Contexto del Proyecto

### Objetivo
Desarrollar un sistema completo de control de acceso para empleados que incluya:
- **Aplicación Web**: Dashboard administrativo y panel de empleados
- **Aplicación Móvil**: App para registro de entradas/salidas
- **PWA**: Progressive Web App para funcionalidad offline

### Tecnologías Principales
- React 18 con TypeScript
- Vite como build tool
- Tailwind CSS para estilos
- React Router para navegación
- Zustand para manejo de estado
- React Query para datos del servidor
- Capacitor para app móvil
- Workbox para PWA

### Estructura del Sistema
1. **Módulo de Autenticación**: Login/logout con roles (admin, empleado, supervisor)
2. **Módulo de Empleados**: CRUD de empleados con perfiles
3. **Módulo de Accesos**: Registro de entradas/salidas con timestamp
4. **Dashboard**: Reportes y estadísticas de acceso
5. **Notificaciones**: Alertas en tiempo real
6. **Configuración**: Ajustes del sistema y empresa

### Patrones de Código
- Usar componentes funcionales con hooks
- Implementar custom hooks para lógica reutilizable
- Aplicar principios SOLID y Clean Architecture
- Usar TypeScript strict mode
- Implementar lazy loading para optimización
- Seguir convenciones de naming en español para el dominio de negocio

### Seguridad
- Implementar JWT para autenticación
- Validación de datos en frontend y backend
- Sanitización de inputs
- Control de acceso basado en roles

### UX/UI
- Diseño responsive mobile-first
- Interfaz intuitiva y accesible
- Tema corporativo de OXITRANS S.A.S
- Soporte para modo claro/oscuro
- Animaciones suaves con Framer Motion
