-- ============================================
-- INSERCIÓN INMEDIATA DE DATOS PARA DASHBOARD
-- Ejecutar AHORA para ver resultados inmediatos
-- ============================================

-- Insertar registros de HOY para que aparezcan inmediatamente
INSERT IGNORE INTO registros_acceso (
    usuario_id, tipo, timestamp, latitud, longitud, 
    dispositivo, notas, created_at
) VALUES 
-- Registros distribuidos a lo largo del día de HOY
(1, 'entrada', CONCAT(CURDATE(), ' 08:00:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test entrada mañana', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 08:15:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test entrada', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 09:30:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test entrada', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 10:45:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test entrada', NOW()),
(1, 'salida', CONCAT(CURDATE(), ' 12:00:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test salida almuerzo', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 13:00:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test regreso almuerzo', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 14:30:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test entrada tarde', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 15:45:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test entrada', NOW()),
(1, 'salida', CONCAT(CURDATE(), ' 17:00:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test salida final', NOW()),
(1, 'salida', CONCAT(CURDATE(), ' 17:30:00'), 4.6097, -74.0817, 'Dashboard Fix', 'Test salida', NOW());

-- Verificar que se insertaron
SELECT 
    '=== VERIFICACIÓN INMEDIATA ===' as info,
    COUNT(*) as registros_insertados_hoy,
    COUNT(CASE WHEN tipo = 'entrada' THEN 1 END) as entradas,
    COUNT(CASE WHEN tipo = 'salida' THEN 1 END) as salidas,
    MIN(timestamp) as primer_registro,
    MAX(timestamp) as ultimo_registro
FROM registros_acceso 
WHERE DATE(timestamp) = CURDATE();

-- Mostrar los registros por hora para el gráfico
SELECT 
    HOUR(timestamp) as hora,
    COUNT(*) as accesos,
    tipo
FROM registros_acceso 
WHERE DATE(timestamp) = CURDATE()
GROUP BY HOUR(timestamp), tipo
ORDER BY hora, tipo;

-- Mostrar empleados presentes
SELECT 
    COUNT(DISTINCT ra.usuario_id) as empleados_presentes_calculado
FROM registros_acceso ra 
WHERE ra.tipo = 'entrada' 
AND DATE(ra.timestamp) = CURDATE()
AND NOT EXISTS (
    SELECT 1 FROM registros_acceso ra2 
    WHERE ra2.usuario_id = ra.usuario_id 
    AND ra2.tipo = 'salida' 
    AND ra2.timestamp > ra.timestamp 
    AND DATE(ra2.timestamp) = CURDATE()
);

SELECT 
    '=== DATOS LISTOS - DASHBOARD DEBE MOSTRAR NÚMEROS AHORA ===' as resultado;