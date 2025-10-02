-- ============================================
-- SCRIPT DE DATOS DE PRUEBA - JORNADAS LABORALES
-- Sistema OXITRANS S.A.S
-- Basado en JornadaLaboralPage.tsx
-- ============================================

-- Limpiar datos existentes para evitar duplicados
DELETE FROM jornadas_laborales WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Reiniciar el auto increment (opcional)
-- ALTER TABLE jornadas_laborales AUTO_INCREMENT = 1;

-- ============================================
-- DATOS DE PRUEBA - ÚLTIMOS 30 DÍAS
-- ============================================

-- ============================================
-- INSERTAR DATOS DE PRUEBA CON MANEJO DE DUPLICADOS
-- ============================================

-- Usar INSERT IGNORE para evitar errores de duplicados
-- O usar ON DUPLICATE KEY UPDATE para actualizar si ya existe

-- Empleado 1: Juan Pérez (ID 1) - Empleado completo y puntual
INSERT IGNORE INTO jornadas_laborales (
    usuario_id, fecha, entrada, 
    descanso_manana_inicio, descanso_manana_fin,
    almuerzo_inicio, almuerzo_fin,
    descanso_tarde_inicio, descanso_tarde_fin,
    salida, horas_trabajadas, auto_cerrada, observaciones
) VALUES 
-- Semana actual (últimos 5 días) - USANDO CONCAT PARA DATETIME CORRECTO
(1, CURDATE(), CONCAT(CURDATE(), ' 08:00:00'), CONCAT(CURDATE(), ' 10:15:00'), CONCAT(CURDATE(), ' 10:30:00'), CONCAT(CURDATE(), ' 12:00:00'), CONCAT(CURDATE(), ' 13:00:00'), CONCAT(CURDATE(), ' 15:30:00'), CONCAT(CURDATE(), ' 15:45:00'), CONCAT(CURDATE(), ' 17:00:00'), 8.0, 0, 'Día completo normal'),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 07:55:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:10:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:25:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 12:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 13:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 15:25:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 15:40:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:05:00'), 8.08, 0, 'Entrada temprana'),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 08:03:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 10:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 10:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:10:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 13:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 15:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 15:50:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:10:00'), 7.92, 0, 'Día normal'),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 08:10:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 10:25:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 10:40:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 12:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:10:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 15:40:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 15:55:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:15:00'), 7.83, 0, 'Entrada un poco tarde'),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 07:50:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 10:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 10:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 11:55:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 12:55:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 15:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 15:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 16:55:00'), 8.17, 0, 'Día eficiente'),

-- Empleado 2: María García (ID 2) - Empleada con algunas variaciones
(2, CURDATE(), CONCAT(CURDATE(), ' 08:15:00'), CONCAT(CURDATE(), ' 10:30:00'), CONCAT(CURDATE(), ' 10:45:00'), CONCAT(CURDATE(), ' 12:30:00'), CONCAT(CURDATE(), ' 13:30:00'), CONCAT(CURDATE(), ' 15:45:00'), CONCAT(CURDATE(), ' 16:00:00'), CONCAT(CURDATE(), ' 17:30:00'), 7.75, 0, 'Entrada tarde compensada'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 10:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 12:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 13:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 15:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 15:45:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:20:00'), 7.92, 0, 'Día normal'),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 10:15:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 10:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 13:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 15:25:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 15:40:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 17:00:00'), 7.58, 0, 'Almuerzo extendido'),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 07:58:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 10:12:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 10:27:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 12:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 13:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 15:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 15:50:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 17:10:00'), 8.08, 0, 'Buen rendimiento'),
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 08:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 10:35:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 10:50:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 12:25:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 13:25:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 15:50:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 16:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), ' 17:25:00'), 7.67, 0, 'Día con retrasos'),

-- Empleado 3: Carlos Rodríguez (ID 3) - Empleado con horario flexible
(3, CURDATE(), '09:00:00', '11:15:00', '11:30:00', '13:00:00', '14:00:00', '16:30:00', '16:45:00', '18:00:00', 8.0, 0, 'Horario flexible'),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:45:00', '11:00:00', '11:15:00', '12:45:00', '13:45:00', '16:15:00', '16:30:00', '17:45:00', 8.0, 0, 'Horario estándar'),
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '09:15:00', '11:30:00', '11:45:00', '13:15:00', '14:15:00', '16:45:00', '17:00:00', '18:15:00', 7.83, 0, 'Entrada tardía'),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '08:30:00', '10:45:00', '11:00:00', '12:30:00', '13:30:00', '16:00:00', '16:15:00', '17:30:00', 8.17, 0, 'Día productivo'),
(3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '09:05:00', '11:20:00', '11:35:00', '13:05:00', '14:05:00', '16:35:00', '16:50:00', '18:05:00', 7.92, 0, 'Jornada normal'),

-- Empleado 4: Ana López (ID 4) - Supervisora con jornada extendida
(4, CURDATE(), '07:30:00', '09:45:00', '10:00:00', '12:30:00', '13:15:00', '15:45:00', '16:00:00', '18:30:00', 9.42, 0, 'Jornada supervisión'),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:45:00', '10:00:00', '10:15:00', '12:45:00', '13:30:00', '16:00:00', '16:15:00', '18:45:00', 9.25, 0, 'Reuniones gerenciales'),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '07:40:00', '09:55:00', '10:10:00', '12:40:00', '13:25:00', '15:55:00', '16:10:00', '18:40:00', 9.33, 0, 'Día intensivo'),
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '07:35:00', '09:50:00', '10:05:00', '12:35:00', '13:20:00', '15:50:00', '16:05:00', '18:35:00', 9.38, 0, 'Supervisión completa'),
(4, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '07:50:00', '10:05:00', '10:20:00', '12:50:00', '13:35:00', '16:05:00', '16:20:00', '18:50:00', 9.17, 0, 'Jornada estándar'),

-- Empleado 5: Roberto Sánchez (ID 5) - Empleado con algunas faltas de descansos
(5, CURDATE(), '08:10:00', NULL, NULL, '12:15:00', '13:00:00', '15:40:00', '15:55:00', '17:15:00', 8.25, 0, 'Sin descanso mañana'),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:05:00', '10:20:00', '10:35:00', '12:10:00', '13:10:00', NULL, NULL, '17:10:00', 8.08, 0, 'Sin descanso tarde'),
(5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '08:15:00', '10:30:00', '10:45:00', '12:20:00', '13:15:00', '15:45:00', '16:00:00', '17:20:00', 7.83, 0, 'Día completo'),
(5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '08:00:00', NULL, NULL, '12:05:00', '12:50:00', NULL, NULL, '16:55:00', 8.17, 0, 'Solo almuerzo'),
(5, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '08:08:00', '10:25:00', '10:40:00', '12:12:00', '13:05:00', '15:35:00', '15:50:00', '17:08:00', 7.92, 0, 'Día normal');

-- ============================================
-- DATOS HISTÓRICOS - SEMANAS ANTERIORES
-- ============================================

-- Semana pasada (5 días más)
INSERT INTO jornadas_laborales (
    usuario_id, fecha, entrada, 
    descanso_manana_inicio, descanso_manana_fin,
    almuerzo_inicio, almuerzo_fin,
    descanso_tarde_inicio, descanso_tarde_fin,
    salida, horas_trabajadas, auto_cerrada, observaciones
) VALUES 
-- Juan Pérez - Semana pasada
(1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '08:05:00', '10:20:00', '10:35:00', '12:10:00', '13:05:00', '15:35:00', '15:50:00', '17:10:00', 7.92, 0, 'Lunes productivo'),
(1, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '07:55:00', '10:10:00', '10:25:00', '12:00:00', '13:00:00', '15:25:00', '15:40:00', '17:00:00', 8.17, 0, 'Martes eficiente'),
(1, DATE_SUB(CURDATE(), INTERVAL 9 DAY), '08:00:00', '10:15:00', '10:30:00', '12:05:00', '13:00:00', '15:30:00', '15:45:00', '17:05:00', 8.0, 0, 'Miércoles normal'),
(1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '08:02:00', '10:17:00', '10:32:00', '12:07:00', '13:02:00', '15:32:00', '15:47:00', '17:07:00', 7.97, 0, 'Jueves estable'),
(1, DATE_SUB(CURDATE(), INTERVAL 11 DAY), '07:58:00', '10:13:00', '10:28:00', '12:03:00', '12:58:00', '15:28:00', '15:43:00', '17:03:00', 8.03, 0, 'Viernes culminante'),

-- María García - Semana pasada
(2, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '08:12:00', '10:27:00', '10:42:00', '12:17:00', '13:12:00', '15:42:00', '15:57:00', '17:17:00', 7.88, 0, 'Lunes regular'),
(2, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '08:08:00', '10:23:00', '10:38:00', '12:13:00', '13:08:00', '15:38:00', '15:53:00', '17:13:00', 7.92, 0, 'Martes consistente'),
(2, DATE_SUB(CURDATE(), INTERVAL 9 DAY), '08:15:00', '10:30:00', '10:45:00', '12:20:00', '13:20:00', '15:45:00', '16:00:00', '17:20:00', 7.75, 0, 'Miércoles tardío'),
(2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '08:03:00', '10:18:00', '10:33:00', '12:08:00', '13:03:00', '15:33:00', '15:48:00', '17:08:00', 7.97, 0, 'Jueves puntual'),
(2, DATE_SUB(CURDATE(), INTERVAL 11 DAY), '08:10:00', '10:25:00', '10:40:00', '12:15:00', '13:15:00', '15:40:00', '15:55:00', '17:15:00', 7.83, 0, 'Viernes estándar');

-- ============================================
-- JORNADAS CON CASOS ESPECIALES
-- ============================================

-- Jornadas auto-cerradas por el sistema
INSERT INTO jornadas_laborales (
    usuario_id, fecha, entrada, 
    descanso_manana_inicio, descanso_manana_fin,
    almuerzo_inicio, almuerzo_fin,
    descanso_tarde_inicio, descanso_tarde_fin,
    salida, horas_trabajadas, auto_cerrada, observaciones
) VALUES 
(3, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '08:30:00', '10:45:00', '11:00:00', '12:30:00', '13:30:00', '16:00:00', '16:15:00', '18:00:00', 8.0, 1, 'Auto-cerrada - olvido marcar salida'),
(5, DATE_SUB(CURDATE(), INTERVAL 13 DAY), '08:15:00', '10:30:00', '10:45:00', '12:20:00', '13:15:00', NULL, NULL, '17:30:00', 8.25, 1, 'Auto-cerrada - sin descanso tarde'),

-- Jornadas incompletas (solo entrada registrada)
(2, DATE_SUB(CURDATE(), INTERVAL 14 DAY), '08:00:00', '10:15:00', '10:30:00', '12:00:00', NULL, NULL, NULL, NULL, 0, 0, 'Jornada interrumpida'),
(4, DATE_SUB(CURDATE(), INTERVAL 15 DAY), '07:45:00', '10:00:00', '10:15:00', NULL, NULL, NULL, NULL, NULL, 0, 0, 'Salida temprana por emergencia'),

-- Jornadas con horas extras
(4, DATE_SUB(CURDATE(), INTERVAL 16 DAY), '07:00:00', '09:15:00', '09:30:00', '12:00:00', '12:45:00', '15:15:00', '15:30:00', '19:30:00', 10.75, 0, 'Horas extras - proyecto urgente'),
(1, DATE_SUB(CURDATE(), INTERVAL 17 DAY), '07:30:00', '09:45:00', '10:00:00', '12:30:00', '13:15:00', '15:45:00', '16:00:00', '18:45:00', 9.5, 0, 'Horas extras - entrega importante'),

-- Jornadas de fin de semana (personal de seguridad/mantenimiento)
(3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '08:00:00', '10:30:00', '10:45:00', '13:00:00', '14:00:00', '16:30:00', '16:45:00', '17:00:00', 7.75, 0, 'Turno fin de semana'),
(5, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '09:00:00', '11:30:00', '11:45:00', '14:00:00', '15:00:00', NULL, NULL, '18:00:00', 8.25, 0, 'Sábado mantenimiento');

-- ============================================
-- ESTADÍSTICAS GENERADAS
-- ============================================

-- Ver resumen de datos insertados
SELECT 
    '=== RESUMEN DE DATOS INSERTADOS ===' as info;

SELECT 
    u.nombre,
    u.apellido,
    COUNT(j.id) as total_jornadas,
    AVG(j.horas_trabajadas) as promedio_horas,
    SUM(j.horas_trabajadas) as total_horas,
    COUNT(CASE WHEN j.auto_cerrada = 1 THEN 1 END) as jornadas_auto_cerradas,
    COUNT(CASE WHEN j.salida IS NULL THEN 1 END) as jornadas_incompletas
FROM usuarios u 
LEFT JOIN jornadas_laborales j ON u.id = j.usuario_id 
WHERE j.id IS NOT NULL
GROUP BY u.id, u.nombre, u.apellido
ORDER BY u.id;

SELECT 
    '=== DISTRIBUCIÓN POR FECHAS ===' as info;

SELECT 
    DATE(j.fecha) as fecha,
    COUNT(*) as total_registros,
    AVG(j.horas_trabajadas) as promedio_horas_dia
FROM jornadas_laborales j 
GROUP BY DATE(j.fecha)
ORDER BY DATE(j.fecha) DESC
LIMIT 10;

-- ============================================
-- DATOS ADICIONALES PARA PRUEBAS ESPECÍFICAS
-- ============================================

-- Insertamos algunos registros para el día de hoy con horarios parciales
-- (simulando empleados que aún están trabajando)
INSERT INTO jornadas_laborales (
    usuario_id, fecha, entrada, 
    descanso_manana_inicio, descanso_manana_fin,
    almuerzo_inicio, almuerzo_fin,
    descanso_tarde_inicio, descanso_tarde_fin,
    salida, horas_trabajadas, auto_cerrada, observaciones
) VALUES 
-- Empleado en curso - solo entrada
(6, CURDATE(), '08:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 'Jornada en curso - solo entrada'),

-- Empleado después del descanso de mañana
(7, CURDATE(), '07:55:00', '10:10:00', '10:25:00', NULL, NULL, NULL, NULL, NULL, 0, 0, 'Jornada en curso - después descanso AM'),

-- Empleado en almuerzo
(8, CURDATE(), '08:05:00', '10:20:00', '10:35:00', '12:15:00', NULL, NULL, NULL, NULL, 0, 0, 'Jornada en curso - en almuerzo'),

-- Empleado después del almuerzo
(9, CURDATE(), '08:10:00', '10:25:00', '10:40:00', '12:20:00', '13:10:00', NULL, NULL, NULL, 0, 0, 'Jornada en curso - después almuerzo'),

-- Empleado en descanso de tarde
(10, CURDATE(), '08:02:00', '10:17:00', '10:32:00', '12:12:00', '13:05:00', '15:35:00', NULL, NULL, 0, 0, 'Jornada en curso - en descanso PM');

SELECT 
    '=== DATOS DE PRUEBA INSERTADOS EXITOSAMENTE ===' as resultado,
    COUNT(*) as total_jornadas_creadas
FROM jornadas_laborales;

-- Mensaje final
SELECT 'Script completado. Datos de prueba listos para JornadaLaboralPage.tsx' as mensaje;