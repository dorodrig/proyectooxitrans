-- ============================================
-- INSERTAR DATOS DE PRUEBA INMEDIATOS
-- Para verificar conexión del dashboard
-- ============================================

-- Insertar algunos usuarios de prueba si no existen
INSERT IGNORE INTO usuarios (
    id, documento, nombre, apellido, email, cargo, departamento, 
    regional_id, estado, fecha_ingreso, created_at
) VALUES 
(1, '12345678', 'Admin', 'OXITRANS', 'admin@oxitrans.com', 'Administrador', 'Administración', 1, 'activo', CURDATE(), NOW()),
(2, '87654321', 'María', 'González', 'maria.gonzalez@oxitrans.com', 'Operador', 'Producción', 1, 'activo', CURDATE(), NOW()),
(3, '11223344', 'Juan', 'Pérez', 'juan.perez@oxitrans.com', 'Supervisor', 'Producción', 1, 'activo', CURDATE(), NOW()),
(4, '55667788', 'Ana', 'Rodríguez', 'ana.rodriguez@oxitrans.com', 'Analista', 'Administración', 1, 'activo', CURDATE(), NOW()),
(5, '33445566', 'Carlos', 'López', 'carlos.lopez@oxitrans.com', 'Operador', 'Logística', 1, 'activo', CURDATE(), NOW());

-- Insertar registros de acceso de hoy para probar el dashboard
INSERT IGNORE INTO registros_acceso (
    usuario_id, tipo, timestamp, latitud, longitud, 
    dispositivo, notas, created_at
) VALUES 
-- Registros de hoy - mañana temprano
(2, 'entrada', CONCAT(CURDATE(), ' 07:45:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada normal', NOW()),
(3, 'entrada', CONCAT(CURDATE(), ' 07:50:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada normal', NOW()),
(4, 'entrada', CONCAT(CURDATE(), ' 08:00:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada normal', NOW()),
(5, 'entrada', CONCAT(CURDATE(), ' 08:05:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada normal', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 08:15:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada admin', NOW()),

-- Registros de almuerzo
(2, 'salida', CONCAT(CURDATE(), ' 12:00:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida almuerzo', NOW()),
(3, 'salida', CONCAT(CURDATE(), ' 12:05:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida almuerzo', NOW()),
(2, 'entrada', CONCAT(CURDATE(), ' 13:00:00'), 4.6097, -74.0817, 'Web Dashboard', 'Regreso almuerzo', NOW()),
(3, 'entrada', CONCAT(CURDATE(), ' 13:05:00'), 4.6097, -74.0817, 'Web Dashboard', 'Regreso almuerzo', NOW()),

-- Algunos registros de salida al final del día
(4, 'salida', CONCAT(CURDATE(), ' 17:00:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida normal', NOW()),
(5, 'salida', CONCAT(CURDATE(), ' 17:30:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida normal', NOW());

-- Insertar algunos registros de ayer para datos históricos
INSERT IGNORE INTO registros_acceso (
    usuario_id, tipo, timestamp, latitud, longitud, 
    dispositivo, notas, created_at
) VALUES 
(2, 'entrada', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada ayer', NOW()),
(3, 'entrada', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:10:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada ayer', NOW()),
(4, 'entrada', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 08:05:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada ayer', NOW()),
(2, 'salida', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida ayer', NOW()),
(3, 'salida', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:15:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida ayer', NOW()),
(4, 'salida', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 17:10:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida ayer', NOW());

-- Verificar los datos insertados
SELECT 
    '=== DATOS DE PRUEBA PARA DASHBOARD INSERTADOS ===' as resultado;

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN estado = 'activo' THEN 1 END) as usuarios_activos
FROM usuarios;

SELECT 
    COUNT(*) as registros_hoy,
    COUNT(CASE WHEN tipo = 'entrada' THEN 1 END) as entradas_hoy,
    COUNT(CASE WHEN tipo = 'salida' THEN 1 END) as salidas_hoy
FROM registros_acceso 
WHERE DATE(timestamp) = CURDATE();

-- Mostrar actividad reciente
SELECT 
    ra.tipo,
    ra.timestamp,
    u.nombre,
    u.apellido,
    u.departamento,
    DATE_FORMAT(ra.timestamp, '%H:%i') as hora
FROM registros_acceso ra
INNER JOIN usuarios u ON ra.usuario_id = u.id
WHERE DATE(ra.timestamp) = CURDATE()
ORDER BY ra.timestamp DESC
LIMIT 5;

SELECT 
    '=== DASHBOARD LISTO PARA PROBAR ===' as mensaje;