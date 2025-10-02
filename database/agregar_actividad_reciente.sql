-- ============================================
-- AGREGAR MÁS DATOS PARA ACTIVIDAD RECIENTE
-- ============================================

-- Agregar más registros variados con diferentes usuarios
INSERT IGNORE INTO usuarios (
    id, documento, nombre, apellido, email, cargo, departamento, 
    regional_id, estado, fecha_ingreso, created_at
) VALUES 
(2, '87654321', 'María', 'González', 'maria@oxitrans.com', 'Operador', 'Producción', 1, 'activo', CURDATE(), NOW()),
(3, '11223344', 'Juan', 'Pérez', 'juan@oxitrans.com', 'Supervisor', 'Administración', 1, 'activo', CURDATE(), NOW()),
(4, '55667788', 'Ana', 'Rodríguez', 'ana@oxitrans.com', 'Analista', 'Ventas', 1, 'activo', CURDATE(), NOW()),
(5, '33445566', 'Carlos', 'López', 'carlos@oxitrans.com', 'Técnico', 'Logística', 1, 'activo', CURDATE(), NOW());

-- Insertar registros de diferentes usuarios para crear actividad diversa
INSERT IGNORE INTO registros_acceso (
    usuario_id, tipo, timestamp, latitud, longitud, 
    dispositivo, notas, created_at
) VALUES 
-- Actividad de esta mañana (diferentes usuarios)
(2, 'entrada', CONCAT(CURDATE(), ' 07:45:00'), 4.6097, -74.0817, 'App Móvil', 'Entrada temprana María', NOW()),
(3, 'entrada', CONCAT(CURDATE(), ' 08:10:00'), 4.6097, -74.0817, 'Tarjeta RFID', 'Entrada Juan supervisor', NOW()),
(4, 'entrada', CONCAT(CURDATE(), ' 08:25:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada Ana analista', NOW()),
(5, 'entrada', CONCAT(CURDATE(), ' 08:40:00'), 4.6097, -74.0817, 'App Móvil', 'Entrada Carlos técnico', NOW()),

-- Actividad reciente (últimas 2 horas)
(2, 'salida', CONCAT(CURDATE(), ' 12:15:00'), 4.6097, -74.0817, 'App Móvil', 'Salida almuerzo María', NOW()),
(3, 'salida', CONCAT(CURDATE(), ' 12:30:00'), 4.6097, -74.0817, 'Tarjeta RFID', 'Salida almuerzo Juan', NOW()),
(2, 'entrada', CONCAT(CURDATE(), ' 13:15:00'), 4.6097, -74.0817, 'App Móvil', 'Regreso almuerzo María', NOW()),
(3, 'entrada', CONCAT(CURDATE(), ' 13:30:00'), 4.6097, -74.0817, 'Tarjeta RFID', 'Regreso almuerzo Juan', NOW()),

-- Actividad muy reciente (simulando tiempo real)
(4, 'salida', CONCAT(CURDATE(), ' 16:45:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida temprana Ana', NOW()),
(5, 'entrada', CONCAT(CURDATE(), ' 17:10:00'), 4.6097, -74.0817, 'App Móvil', 'Regreso de campo Carlos', NOW()),
(1, 'salida', CONCAT(CURDATE(), ' 17:50:00'), 4.6097, -74.0817, 'Web Dashboard', 'Salida admin final', NOW());

-- Verificar los datos insertados
SELECT 
    '=== VERIFICACIÓN ACTIVIDAD RECIENTE ===' as info;

-- Mostrar la actividad reciente como la ve el dashboard
SELECT 
    ra.id,
    ra.usuario_id,
    ra.tipo,
    ra.timestamp,
    u.nombre,
    u.apellido,
    u.departamento,
    u.cargo,
    DATE_FORMAT(ra.timestamp, '%H:%i') as hora_formato
FROM registros_acceso ra
INNER JOIN usuarios u ON ra.usuario_id = u.id
WHERE DATE(ra.timestamp) = CURDATE()
ORDER BY ra.timestamp DESC
LIMIT 10;

-- Contar registros por usuario
SELECT 
    u.nombre,
    u.apellido,
    u.departamento,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN ra.tipo = 'entrada' THEN 1 END) as entradas,
    COUNT(CASE WHEN ra.tipo = 'salida' THEN 1 END) as salidas
FROM usuarios u
INNER JOIN registros_acceso ra ON u.id = ra.usuario_id
WHERE DATE(ra.timestamp) = CURDATE()
GROUP BY u.id, u.nombre, u.apellido, u.departamento
ORDER BY total_registros DESC;

SELECT 
    '=== ACTIVIDAD RECIENTE LISTA PARA MOSTRAR ===' as resultado;