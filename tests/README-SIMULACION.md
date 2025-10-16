# 📋 DOCUMENTACIÓN DE TESTS DE SIMULACIÓN

## 🎯 Objetivo General
Crear un sistema de tests completo que simule el uso real del sistema de control de acceso y jornadas laborales de OXITRANS, insertando datos realistas en la base de datos para validar todas las funcionalidades.

## 📁 Tests Creados

### 1. `setup-completo-jornadas.mjs` - ⭐ TEST PRINCIPAL
**Propósito:** Setup completo + simulación de 15 días de jornadas laborales
**Características:**
- 🏢 Crea 7 regionales basadas en ubicaciones reales de OXITRANS
- 👥 Crea 10 usuarios de prueba asignados a diferentes regionales
- 📅 Simula 15 días laborales completos por cada empleado
- ⏰ 8 eventos por jornada: llegada → descanso mañana → fin descanso → almuerzo → fin almuerzo → descanso tarde → fin descanso → salida
- 🌍 Coordenadas GPS realistas con variación para simular error de GPS
- 📊 **Total esperado: 1,200 eventos (10 empleados × 15 días × 8 eventos)**

### 2. `verificar-sistema.mjs` - 🔧 DIAGNÓSTICO
**Propósito:** Verificar que el sistema esté listo antes de ejecutar tests
**Características:**
- Verifica conexión al servidor
- Maneja rate limiting automáticamente
- Valida autenticación de administrador
- Verifica acceso a base de datos

### 3. `simulacion-usuarios-existentes.mjs` - 🔄 ALTERNATIVO
**Propósito:** Simulación con usuarios que ya existan en la BD
**Características:**
- Usa usuarios del schema por defecto
- 10 días de simulación
- Manejo de ausencias (3% probabilidad)

### 4. `verificar-usuarios-existentes.mjs` - 🔍 UTILIDAD
**Propósito:** Verificar qué usuarios ya existen en el sistema

## 🏢 Regionales Configuradas

| Regional | Dirección | Coordenadas |
|----------|-----------|-------------|
| **Duitama** | Avenida las américas 27-31 | 5.8245, -73.0515 |
| **Bucaramanga** | Calle 72 #36 w-84 vía a provincia de soto 2 | 7.1254, -73.1198 |
| **Barranquilla** | Vía 40 #75-31 La concepción | 10.9639, -74.7964 |
| **Drummond Mina** | Vía a chiriguaná | 9.3611, -73.6070 |
| **Bogotá** | Avenida carrera 68 # 11-32 | 4.6097, -74.0817 |
| **Cartagena** | Vía mamonal km 4 | 10.3932, -75.4794 |
| **Neiva** | Cra 7 No. 19-99 Sur. Zona Industrial | 2.9273, -75.2819 |

## 👥 Usuarios de Prueba

| Usuario | Documento | Email | Regional | Cargo |
|---------|-----------|-------|----------|--------|
| Carlos Andrés Rodríguez | 12345001 | carlos.rodriguez@oxitrans.com | Duitama | Conductor Senior |
| María Fernanda López | 12345002 | maria.lopez@oxitrans.com | Bucaramanga | Operadora Logística |
| Juan Pablo Martínez | 12345003 | juan.martinez@oxitrans.com | Barranquilla | Conductor Junior |
| Ana Sofía García | 12345004 | ana.garcia@oxitrans.com | Drummond | Supervisora de Turno |
| Diego Alejandro Ruiz | 12345005 | diego.ruiz@oxitrans.com | Bogotá | Conductor Senior |
| Claudia Patricia Herrera | 12345006 | claudia.herrera@oxitrans.com | Cartagena | Operadora Logística |
| Roberto Carlos Sánchez | 12345007 | roberto.sanchez@oxitrans.com | Neiva | Conductor Senior |
| Luisa Fernanda Castro | 12345008 | luisa.castro@oxitrans.com | Duitama | Supervisora Regional |
| Andrés Felipe Moreno | 12345009 | andres.moreno@oxitrans.com | Bucaramanga | Técnico Mantenimiento |
| Sandra Milena Jiménez | 12345010 | sandra.jimenez@oxitrans.com | Bogotá | Operadora Logística |

## ⚙️ Configuración de Simulación

### 📊 Parámetros Realistas
- **Horario entrada:** 7:00 AM - 8:00 AM (variación aleatoria)
- **Descansos mañana:** 10-20 minutos
- **Almuerzo:** 45-60 minutos (12:00 PM - 1:00 PM)
- **Descansos tarde:** 10-20 minutos  
- **Horario salida:** 5:00 PM - 6:00 PM
- **Llegadas tarde:** 10% probabilidad
- **Ausencias:** 3-5% probabilidad
- **Variación GPS:** ±25 metros (error realista)

### 🔄 Flujo de Jornada Simulada
1. **Llegada** - Con posible retraso
2. **Descanso Mañana** - 2-3 horas después de llegada
3. **Fin Descanso Mañana** - 10-20 minutos después
4. **Almuerzo** - Entre 12:00 PM y 1:00 PM
5. **Fin Almuerzo** - 45-60 minutos después
6. **Descanso Tarde** - 2-3 horas después del almuerzo
7. **Fin Descanso Tarde** - 10-20 minutos después
8. **Salida** - Entre 5:00 PM y 6:00 PM

## 🚀 Cómo Ejecutar

### Opción 1: Setup Completo (Recomendado)
```bash
# 1. Verificar sistema
node tests/verificar-sistema.mjs

# 2. Ejecutar setup completo (si sistema está listo)
node tests/setup-completo-jornadas.mjs
```

### Opción 2: Desde VS Code
- Abrir paleta de comandos (`Ctrl+Shift+P`)
- Escribir "Tasks: Run Task"
- Seleccionar "Setup Completo + Simulación Jornadas"

## 📈 Resultados Esperados

### Datos Insertados
- **7 regionales** con coordenadas GPS reales
- **10 usuarios** distribuidos en las regionales
- **1,200 eventos de jornada** (15 días × 10 empleados × 8 eventos)
- **150 jornadas completas** simuladas

### Validaciones del Sistema
- ✅ Autenticación por documento
- ✅ Validación de ubicación GPS
- ✅ Registro de eventos en secuencia correcta
- ✅ Manejo de tolerancias de ubicación
- ✅ Timestamps en zona horaria Colombia

## 🔍 Verificación de Resultados

### Base de Datos
```sql
-- Verificar regionales creadas
SELECT COUNT(*) as regionales_creadas FROM regionales;

-- Verificar usuarios creados  
SELECT COUNT(*) as usuarios_creados FROM usuarios WHERE documento LIKE '12345%';

-- Verificar jornadas simuladas
SELECT COUNT(*) as jornadas_simuladas FROM jornadas_laborales;

-- Verificar eventos por tipo
SELECT tipo_evento, COUNT(*) as total 
FROM registros_jornada 
GROUP BY tipo_evento 
ORDER BY total DESC;
```

### Dashboard
- Acceder a http://localhost:3000
- Verificar tarjetas de empleados activos
- Revisar jornadas de los últimos 15 días
- Validar gráficos de tiempo laboral

## ⚠️ Consideraciones Importantes

### Rate Limiting
- El servidor tiene protección contra rate limiting
- Si aparece error "Demasiadas solicitudes", esperar 30-60 segundos
- Usar `verificar-sistema.mjs` para validar disponibilidad

### Credenciales
- **Admin:** documento `12345678`, password `admin123`
- **Empleados:** password `empleado123` para todos

### Tolerancias GPS
- Cada regional tiene tolerancia configurada (80-150 metros)
- La simulación genera variación GPS realista (±25 metros)
- Compatible con las mejoras GPS implementadas

## 📊 Métricas de Éxito

- **100% de regionales creadas** (7/7)
- **100% de usuarios creados** (10/10) 
- **≥95% de jornadas exitosas** por day
- **8 eventos por jornada completa**
- **0 errores de validación GPS**
- **Timestamps correctos** en zona horaria Colombia

---
*Creado para OXITRANS - Sistema de Control de Acceso*  
*Simulación realista de jornadas laborales con GPS inteligente*