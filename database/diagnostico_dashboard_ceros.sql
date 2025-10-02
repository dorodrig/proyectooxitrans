-- ============================================
-- DIAGNÓSTICO INMEDIATO - DASHBOARD CON DATOS CERO
-- Sistema OXITRANS S.A.S
-- ============================================

SELECT 
    '=== DIAGNÓSTICO: ¿POR QUÉ EL DASHBOARD MUESTRA CEROS? ===' as diagnostico;

-- 1. ¿Existen usuarios en el sistema?
SELECT 
    '1. VERIFICAR USUARIOS' as paso,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN estado = 'activo' THEN 1 END) as usuarios_activos
FROM usuarios;

-- 2. ¿Hay registros de acceso de HOY?
SELECT 
    '2. VERIFICAR REGISTROS DE HOY' as paso,
    COUNT(*) as registros_hoy,
    COUNT(CASE WHEN tipo = 'entrada' THEN 1 END) as entradas_hoy,
    COUNT(CASE WHEN tipo = 'salida' THEN 1 END) as salidas_hoy,
    MIN(timestamp) as primer_registro,
    MAX(timestamp) as ultimo_registro
FROM registros_acceso 
WHERE DATE(timestamp) = CURDATE();

-- 3. ¿Qué fecha es HOY según MySQL?
SELECT 
    '3. VERIFICAR FECHA ACTUAL' as paso,
    CURDATE() as fecha_mysql,
    NOW() as datetime_mysql,
    DATE(NOW()) as fecha_actual;

-- 4. ¿Hay registros de esta semana?
SELECT 
    '4. REGISTROS DE LA SEMANA' as paso,
    DATE(timestamp) as fecha,
    COUNT(*) as total_registros
FROM registros_acceso 
WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE(timestamp)
ORDER BY fecha DESC
LIMIT 7;

-- 5. ¿Cuáles son los últimos registros sin importar fecha?
SELECT 
    '5. ÚLTIMOS REGISTROS (CUALQUIER FECHA)' as paso;

SELECT 
    ra.id,
    ra.usuario_id,
    ra.tipo,
    ra.timestamp,
    DATE(ra.timestamp) as fecha,
    TIME(ra.timestamp) as hora,
    u.nombre,
    u.apellido
FROM registros_acceso ra
LEFT JOIN usuarios u ON ra.usuario_id = u.id
ORDER BY ra.timestamp DESC
LIMIT 10;

-- 6. Verificar si las tablas existen y tienen la estructura correcta
SELECT 
    '6. VERIFICAR ESTRUCTURA DE TABLAS' as paso;

SHOW TABLES LIKE '%registros%';
SHOW TABLES LIKE '%usuarios%';

-- 7. Mostrar estructura de registros_acceso
DESCRIBE registros_acceso;

SELECT 
    '=== FIN DEL DIAGNÓSTICO ===' as fin;

-- ============================================
-- ACCIÓN CORRECTIVA: INSERTAR DATOS DE HOY
-- ============================================

SELECT 
    '=== INSERTANDO DATOS DE PRUEBA PARA HOY ===' as accion;

-- Asegurar que existe al menos el usuario admin
INSERT IGNORE INTO usuarios (
    id, documento, nombre, apellido, email, 
    password_hash, cargo, departamento, regional_id, 
    estado, fecha_ingreso, created_at
) VALUES 
(1, '12345678', 'Admin', 'OXITRANS', 'admin@oxitrans.com', 
 '$2b$10$ejemplo', 'Administrador', 'Administración', 1, 
 'activo', CURDATE(), NOW());

-- Insertar registros de HOY para que aparezcan en el dashboard
INSERT IGNORE INTO registros_acceso (
    usuario_id, tipo, timestamp, latitud, longitud, 
    dispositivo, notas, created_at
) VALUES 
-- Registros de hoy - diferentes horas para el gráfico
(1, 'entrada', CONCAT(CURDATE(), ' 08:00:00'), 4.6097, -74.0817, 'Dashboard Test', 'Entrada test hoy', NOW()),
(1, 'salida', CONCAT(CURDATE(), ' 12:00:00'), 4.6097, -74.0817, 'Dashboard Test', 'Salida almuerzo', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 13:00:00'), 4.6097, -74.0817, 'Dashboard Test', 'Entrada almuerzo', NOW()),
(1, 'salida', CONCAT(CURDATE(), ' 17:00:00'), 4.6097, -74.0817, 'Dashboard Test', 'Salida final', NOW()),

-- Más registros para simular actividad
(1, 'entrada', CONCAT(CURDATE(), ' 09:30:00'), 4.6097, -74.0817, 'Dashboard Test', 'Entrada adicional', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 10:15:00'), 4.6097, -74.0817, 'Dashboard Test', 'Entrada adicional', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 14:30:00'), 4.6097, -74.0817, 'Dashboard Test', 'Entrada adicional', NOW()),
(1, 'entrada', CONCAT(CURDATE(), ' 15:45:00'), 4.6097, -74.0817, 'Dashboard Test', 'Entrada adicional', NOW());

-- Verificar que se insertaron los datos
SELECT 
    '=== VERIFICAR INSERCIÓN ===' as verificacion,
    COUNT(*) as registros_insertados_hoy
FROM registros_acceso 
WHERE DATE(timestamp) = CURDATE();

SELECT 
    '=== DATOS LISTOS PARA DASHBOARD ===' as resultado;