-- ============================================
-- SCRIPT DE LIMPIEZA - JORNADAS LABORALES
-- Sistema OXITRANS S.A.S
-- ============================================

-- Mostrar estadísticas antes de la limpieza
SELECT 
    '=== ESTADO ANTES DE LA LIMPIEZA ===' as info;

SELECT 
    COUNT(*) as total_registros_actuales,
    COUNT(CASE WHEN entrada = '0000-00-00 00:00:00' THEN 1 END) as registros_con_error_entrada,
    COUNT(CASE WHEN salida = '0000-00-00 00:00:00' THEN 1 END) as registros_con_error_salida,
    MIN(fecha) as fecha_minima,
    MAX(fecha) as fecha_maxima
FROM jornadas_laborales;

-- ============================================
-- ELIMINAR TODOS LOS REGISTROS DE JORNADAS LABORALES
-- ============================================

-- Deshabilitar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todos los registros
DELETE FROM jornadas_laborales;

-- Reiniciar el contador AUTO_INCREMENT a 1
ALTER TABLE jornadas_laborales AUTO_INCREMENT = 1;

-- Rehabilitar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICAR LIMPIEZA
-- ============================================

SELECT 
    '=== ESTADO DESPUÉS DE LA LIMPIEZA ===' as info;

SELECT 
    COUNT(*) as total_registros_restantes,
    COALESCE(MAX(id), 0) as ultimo_id_usado
FROM jornadas_laborales;

-- Mostrar información de la tabla para confirmar el AUTO_INCREMENT
SELECT 
    table_name,
    auto_increment
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'jornadas_laborales';

SELECT 
    '=== LIMPIEZA COMPLETADA EXITOSAMENTE ===' as resultado;

-- ============================================
-- OPCIONAL: VERIFICAR ESTRUCTURA DE LA TABLA
-- ============================================

-- Mostrar la estructura de la tabla para confirmar tipos de datos
DESCRIBE jornadas_laborales;