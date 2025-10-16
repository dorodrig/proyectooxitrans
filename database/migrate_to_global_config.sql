-- ================================================
-- Script de Migración: Consolidar a Configuración Global
-- Convierte múltiples configuraciones de usuario a una configuración global única
-- ================================================

USE oxitrans_access_control;

-- Verificar estado actual
SELECT 'ESTADO INICIAL' as TITULO;
SELECT 
    COUNT(*) as total_configuraciones,
    COUNT(DISTINCT usuario_id) as usuarios_diferentes,
    SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) as configuraciones_activas
FROM jornadas_config;

-- Mostrar configuraciones existentes
SELECT 'CONFIGURACIONES ACTUALES' as TITULO;
SELECT 
    jc.id,
    jc.hora_entrada,
    jc.tiempo_trabajo_dia,
    jc.fin_jornada_laboral,
    jc.usuario_id,
    u.nombre,
    u.apellido,
    jc.activa,
    jc.fecha_creacion
FROM jornadas_config jc
LEFT JOIN usuarios u ON jc.usuario_id = u.id
ORDER BY jc.fecha_creacion DESC;

-- ================================================
-- PASO 1: Análisis de datos para configuración global
-- ================================================

-- Encontrar la configuración más común
SELECT 'ANÁLISIS PARA CONFIGURACIÓN GLOBAL' as TITULO;
SELECT 
    hora_entrada,
    tiempo_trabajo_dia,
    fin_jornada_laboral,
    COUNT(*) as frecuencia,
    GROUP_CONCAT(DISTINCT usuario_id) as usuarios_con_esta_config
FROM jornadas_config 
WHERE activa = 1
GROUP BY hora_entrada, tiempo_trabajo_dia, fin_jornada_laboral
ORDER BY frecuencia DESC;

-- ================================================
-- PASO 2: Crear configuración global
-- ================================================

-- Primero, desactivar todas las configuraciones existentes
UPDATE jornadas_config 
SET activa = 0, 
    fecha_actualizacion = NOW()
WHERE activa = 1;

-- Insertar configuración global basada en la más común o estándar OXITRANS
-- Usar valores estándar: 8:00 AM inicio, 8 horas trabajo, 5:00 PM fin (incluyendo almuerzo)
INSERT INTO jornadas_config (
    hora_entrada,
    tiempo_trabajo_dia,
    fin_jornada_laboral,
    usuario_id,
    activa,
    fecha_creacion,
    fecha_actualizacion
) VALUES (
    '08:00:00',           -- Hora de inicio estándar
    8.00,                 -- 8 horas de trabajo
    '17:00:00',           -- Hora de fin (8h trabajo + 1h almuerzo)
    -1,                   -- Usuario -1 indica configuración global
    1,                    -- Activa
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    hora_entrada = VALUES(hora_entrada),
    tiempo_trabajo_dia = VALUES(tiempo_trabajo_dia),
    fin_jornada_laboral = VALUES(fin_jornada_laboral),
    activa = VALUES(activa),
    fecha_actualizacion = NOW();

-- ================================================
-- PASO 3: Verificar resultado
-- ================================================

SELECT 'RESULTADO FINAL' as TITULO;
SELECT 
    id,
    hora_entrada,
    tiempo_trabajo_dia,
    fin_jornada_laboral,
    usuario_id,
    CASE 
        WHEN usuario_id = -1 THEN 'CONFIGURACIÓN GLOBAL'
        ELSE CONCAT('Usuario: ', usuario_id)
    END as tipo_configuracion,
    activa,
    fecha_creacion,
    fecha_actualizacion
FROM jornadas_config
WHERE activa = 1
ORDER BY usuario_id;

-- Verificar que solo existe una configuración activa
SELECT 
    COUNT(*) as configuraciones_activas_total,
    SUM(CASE WHEN usuario_id = -1 THEN 1 ELSE 0 END) as configuracion_global_activa
FROM jornadas_config 
WHERE activa = 1;

-- ================================================
-- PASO 4: Crear backup de configuraciones anteriores
-- ================================================

-- Crear tabla de backup si no existe
CREATE TABLE IF NOT EXISTS jornadas_config_backup AS
SELECT 
    *,
    'MIGRACIÓN_GLOBAL' as motivo_backup,
    NOW() as fecha_backup
FROM jornadas_config
WHERE activa = 0;

SELECT 'MIGRACIÓN COMPLETADA EXITOSAMENTE' as RESULTADO;
SELECT CONCAT(
    'Se ha creado una configuración global única. ',
    'Las configuraciones anteriores fueron desactivadas y respaldadas.'
) as MENSAJE;

-- ================================================
-- CONSULTAS DE VERIFICACIÓN FINAL
-- ================================================

-- Verificar configuración global activa
SELECT 'CONFIGURACIÓN GLOBAL FINAL' as TITULO;
SELECT 
    id,
    TIME_FORMAT(hora_entrada, '%H:%i') as hora_inicio,
    tiempo_trabajo_dia as horas_trabajo,
    TIME_FORMAT(fin_jornada_laboral, '%H:%i') as hora_salida,
    'TODOS LOS EMPLEADOS OXITRANS' as aplica_a,
    fecha_actualizacion
FROM jornadas_config 
WHERE usuario_id = -1 AND activa = 1;