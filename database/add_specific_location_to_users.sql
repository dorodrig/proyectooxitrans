-- ====================================
-- ACTUALIZACIÓN: AGREGAR UBICACIÓN ESPECÍFICA A USUARIOS
-- OXITRANS S.A.S - Control de Acceso
-- ====================================

USE control_acceso_oxitrans;

-- ====================================
-- AGREGAR COLUMNAS DE UBICACIÓN ESPECÍFICA A USUARIOS
-- ====================================
-- Agregar latitud y longitud específica para cada empleado
ALTER TABLE usuarios 
ADD COLUMN ubicacion_trabajo_latitud DECIMAL(10, 8),
ADD COLUMN ubicacion_trabajo_longitud DECIMAL(11, 8),
ADD COLUMN nombre_ubicacion_trabajo VARCHAR(200),
ADD COLUMN descripcion_ubicacion_trabajo TEXT,
ADD COLUMN tolerancia_ubicacion_metros INT DEFAULT 50;

-- Crear índices para optimizar consultas de ubicación
ALTER TABLE usuarios 
ADD INDEX idx_ubicacion_lat (ubicacion_trabajo_latitud),
ADD INDEX idx_ubicacion_lng (ubicacion_trabajo_longitud);

-- ====================================
-- COMENTARIOS SOBRE LA IMPLEMENTACIÓN
-- ====================================
-- ubicacion_trabajo_latitud: Coordenada específica de trabajo del empleado
-- ubicacion_trabajo_longitud: Coordenada específica de trabajo del empleado  
-- nombre_ubicacion_trabajo: Nombre descriptivo (ej: "Oficina Principal", "Almacén Norte")
-- descripcion_ubicacion_trabajo: Descripción más detallada de la ubicación
-- tolerancia_ubicacion_metros: Radio de tolerancia en metros para cada empleado (por defecto 50m)

-- Esto permite que:
-- 1. Cada empleado tenga su ubicación específica de trabajo
-- 2. La validación sea contra SU ubicación asignada, no solo la regional
-- 3. Diferentes empleados puedan tener diferentes tolerancias
-- 4. Se mantenga la compatibilidad con el sistema de regionales existente