-- ============================================
-- SCRIPT DE PRUEBA - VERIFICAR CONEXIÓN DASHBOARD
-- Sistema OXITRANS S.A.S
-- ============================================

SELECT 
    '=== VERIFICACIÓN DE DATOS PARA DASHBOARD ===' as info;

-- 1. Verificar si existen usuarios activos
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN estado = 'activo' THEN 1 END) as usuarios_activos,
    COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as usuarios_inactivos
FROM usuarios;

-- 2. Verificar si existen registros de acceso de hoy
SELECT 
    COUNT(*) as registros_hoy,
    COUNT(CASE WHEN tipo = 'entrada' THEN 1 END) as entradas_hoy,
    COUNT(CASE WHEN tipo = 'salida' THEN 1 END) as salidas_hoy,
    MIN(timestamp) as primera_entrada,
    MAX(timestamp) as ultimo_registro
FROM registros_acceso 
WHERE DATE(timestamp) = CURDATE();

-- 3. Verificar registros de la última semana
SELECT 
    DATE(timestamp) as fecha,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN tipo = 'entrada' THEN 1 END) as entradas,
    COUNT(CASE WHEN tipo = 'salida' THEN 1 END) as salidas
FROM registros_acceso 
WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE(timestamp)
ORDER BY fecha DESC;

-- 4. Verificar empleados presentes (que tienen entrada pero no salida hoy)
SELECT 
    u.id,
    u.nombre,
    u.apellido,
    u.departamento,
    MAX(ra.timestamp) as ultima_entrada
FROM usuarios u
INNER JOIN registros_acceso ra ON u.id = ra.usuario_id
WHERE ra.tipo = 'entrada' 
AND DATE(ra.timestamp) = CURDATE()
AND NOT EXISTS (
    SELECT 1 FROM registros_acceso ra2 
    WHERE ra2.usuario_id = u.id 
    AND ra2.tipo = 'salida' 
    AND ra2.timestamp > ra.timestamp 
    AND DATE(ra2.timestamp) = CURDATE()
)
GROUP BY u.id, u.nombre, u.apellido, u.departamento
ORDER BY ultima_entrada DESC;

-- 5. Verificar distribución por horas (para el gráfico)
SELECT 
    HOUR(timestamp) as hora,
    COUNT(*) as accesos,
    COUNT(CASE WHEN tipo = 'entrada' THEN 1 END) as entradas,
    COUNT(CASE WHEN tipo = 'salida' THEN 1 END) as salidas
FROM registros_acceso 
WHERE DATE(timestamp) = CURDATE()
GROUP BY HOUR(timestamp)
ORDER BY hora;

-- 6. Actividad reciente (últimos 10 registros)
SELECT 
    ra.id,
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

-- 7. Verificar estructura de tablas críticas
SELECT 
    '=== ESTRUCTURA DE TABLAS ===' as info;

DESCRIBE usuarios;
DESCRIBE registros_acceso;

SELECT 
    '=== VERIFICACIÓN COMPLETADA ===' as resultado;