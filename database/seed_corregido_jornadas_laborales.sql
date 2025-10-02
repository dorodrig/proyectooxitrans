-- ============================================
-- SCRIPT CORREGIDO - DATOS DE PRUEBA JORNADAS LABORALES
-- Sistema OXITRANS S.A.S
-- VERSIÓN CORREGIDA CON DATETIME COMPLETOS
-- ============================================

-- ============================================
-- INSERTAR DATOS DE PRUEBA CON DATETIME CORRECTO
-- ============================================

-- Empleado 3: Carlos Rodríguez (ID 3) - Empleado con horario flexible
INSERT IGNORE INTO jornadas_laborales (
    usuario_id, fecha, entrada, 
    descanso_manana_inicio, descanso_manana_fin,
    almuerzo_inicio, almuerzo_fin,
    descanso_tarde_inicio, descanso_tarde_fin,
    salida, horas_trabajadas, auto_cerrada, observaciones
) VALUES 
(3, CURDATE(), CONCAT(CURDATE(), ' 09:00:00'), CONCAT(CURDATE(), ' 11:15:00'), CONCAT(CURDATE(), ' 11:30:00'), CONCAT(CURDATE(), ' 13:00:00'), CONCAT(CURDATE(), ' 14:00:00'), CONCAT(CURDATE(), ' 16:30:00'), CONCAT(CURDATE(), ' 16:45:00'), CONCAT(CURDATE(), ' 18:00:00'), 8.0, 0, 'Horario flexible'),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 11:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 12:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 13:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 16:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 16:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:45:00'), 8.0, 0, 'Horario estándar'),
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 09:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 11:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 11:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 13:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 14:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 16:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 18:15:00'), 7.83, 0, 'Entrada tardía'),

-- Empleado 4: Ana López (ID 4) - Supervisora con jornada extendida
(4, CURDATE(), CONCAT(CURDATE(), ' 07:30:00'), CONCAT(CURDATE(), ' 09:45:00'), CONCAT(CURDATE(), ' 10:00:00'), CONCAT(CURDATE(), ' 12:30:00'), CONCAT(CURDATE(), ' 13:15:00'), CONCAT(CURDATE(), ' 15:45:00'), CONCAT(CURDATE(), ' 16:00:00'), CONCAT(CURDATE(), ' 18:30:00'), 9.42, 0, 'Jornada supervisión'),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 07:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 12:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 13:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 16:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 18:45:00'), 9.25, 0, 'Reuniones gerenciales'),

-- Empleado 5: Roberto Sánchez (ID 5) - Empleado con algunas faltas de descansos
(5, CURDATE(), CONCAT(CURDATE(), ' 08:10:00'), NULL, NULL, CONCAT(CURDATE(), ' 12:15:00'), CONCAT(CURDATE(), ' 13:00:00'), CONCAT(CURDATE(), ' 15:40:00'), CONCAT(CURDATE(), ' 15:55:00'), CONCAT(CURDATE(), ' 17:15:00'), 8.25, 0, 'Sin descanso mañana'),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 12:10:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 13:10:00'), NULL, NULL, CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:10:00'), 8.08, 0, 'Sin descanso tarde'),

-- Jornadas en progreso (para simular empleados trabajando actualmente)
(6, CURDATE(), CONCAT(CURDATE(), ' 08:00:00'), NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 'Jornada en curso - solo entrada'),
(7, CURDATE(), CONCAT(CURDATE(), ' 07:55:00'), CONCAT(CURDATE(), ' 10:10:00'), CONCAT(CURDATE(), ' 10:25:00'), NULL, NULL, NULL, NULL, NULL, 0, 0, 'Jornada en curso - después descanso AM'),
(8, CURDATE(), CONCAT(CURDATE(), ' 08:05:00'), CONCAT(CURDATE(), ' 10:20:00'), CONCAT(CURDATE(), ' 10:35:00'), CONCAT(CURDATE(), ' 12:15:00'), NULL, NULL, NULL, NULL, 0, 0, 'Jornada en curso - en almuerzo'),

-- Datos históricos con fechas específicas (semana anterior)
(1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 08:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 10:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 10:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 12:10:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 13:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 15:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 15:50:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 17:10:00'), 7.92, 0, 'Lunes productivo'),
(2, DATE_SUB(CURDATE(), INTERVAL 7 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 08:12:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 10:27:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 10:42:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 12:17:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 13:12:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 15:42:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 15:57:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 17:17:00'), 7.88, 0, 'Lunes regular'),

-- Jornadas auto-cerradas
(3, DATE_SUB(CURDATE(), INTERVAL 8 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 08:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 10:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 11:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 12:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 13:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 16:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 16:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 18:00:00'), 8.0, 1, 'Auto-cerrada - olvido marcar salida'),

-- Jornadas incompletas
(4, DATE_SUB(CURDATE(), INTERVAL 9 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 9 DAY), ' 07:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 9 DAY), ' 10:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 9 DAY), ' 10:15:00'), NULL, NULL, NULL, NULL, NULL, 0, 0, 'Salida temprana por emergencia'),

-- Jornadas con horas extras
(4, DATE_SUB(CURDATE(), INTERVAL 10 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 07:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 09:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 09:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 12:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 15:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 15:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 19:30:00'), 10.75, 0, 'Horas extras - proyecto urgente');

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

SELECT 
    '=== VERIFICACIÓN DE DATOS CORREGIDOS ===' as info;

-- Verificar que no hay campos con '0000-00-00'
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN entrada = '0000-00-00 00:00:00' THEN 1 END) as error_entrada,
    COUNT(CASE WHEN salida = '0000-00-00 00:00:00' THEN 1 END) as error_salida,
    COUNT(CASE WHEN almuerzo_inicio = '0000-00-00 00:00:00' THEN 1 END) as error_almuerzo,
    COUNT(CASE WHEN entrada IS NOT NULL AND TIME(entrada) != '00:00:00' THEN 1 END) as entradas_validas,
    COUNT(CASE WHEN salida IS NOT NULL AND TIME(salida) != '00:00:00' THEN 1 END) as salidas_validas
FROM jornadas_laborales;

-- Mostrar ejemplos de registros creados
SELECT 
    id, usuario_id, fecha, 
    DATE_FORMAT(entrada, '%Y-%m-%d %H:%i:%s') as entrada_formato,
    DATE_FORMAT(almuerzo_inicio, '%Y-%m-%d %H:%i:%s') as almuerzo_formato,
    DATE_FORMAT(salida, '%Y-%m-%d %H:%i:%s') as salida_formato,
    observaciones
FROM jornadas_laborales 
ORDER BY fecha DESC, usuario_id 
LIMIT 10;

SELECT 
    '=== DATOS DE PRUEBA CORREGIDOS INSERTADOS EXITOSAMENTE ===' as resultado;