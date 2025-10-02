-- ============================================
-- CORREGIR ZONA HORARIA COLOMBIA (GMT-5)
-- ============================================

-- Verificar datos actuales
SELECT 
    '=== DATOS ACTUALES (ANTES DEL AJUSTE) ===' as info;

SELECT 
    id, usuario_id, tipo,
    timestamp as timestamp_utc,
    CONVERT_TZ(timestamp, '+00:00', '-05:00') as timestamp_colombia,
    DATE_FORMAT(CONVERT_TZ(timestamp, '+00:00', '-05:00'), '%H:%i:%s') as hora_colombia
FROM registros_acceso 
WHERE DATE(timestamp) = CURDATE()
ORDER BY timestamp DESC;

-- ============================================
-- CREAR DATOS REALISTAS PARA HOY CON GMT-5
-- ============================================

-- Primero, eliminar datos de hoy para recrearlos correctamente
DELETE FROM registros_acceso WHERE DATE(timestamp) = CURDATE();

-- Obtener hora actual de Colombia (GMT-5)
SET @hora_colombia_actual = DATE_SUB(NOW(), INTERVAL 5 HOUR);
SET @fecha_hoy = DATE(@hora_colombia_actual);

-- Insertar datos realistas para el usuario admin (ID=1) simulando una jornada en curso
INSERT INTO registros_acceso (
    usuario_id, tipo, timestamp, latitud, longitud, 
    dispositivo, notas, created_at
) VALUES 
-- Entrada de mañana (8:15 AM Colombia)
(1, 'entrada', CONCAT(@fecha_hoy, ' 08:15:00'), 4.6097, -74.0817, 'Web Dashboard', 'Entrada admin mañana', NOW()),

-- Descanso AM (10:30 - 10:45 AM Colombia)
(1, 'salida', CONCAT(@fecha_hoy, ' 10:30:00'), 4.6097, -74.0817, 'Web Dashboard', 'Inicio descanso AM', NOW()),
(1, 'entrada', CONCAT(@fecha_hoy, ' 10:45:00'), 4.6097, -74.0817, 'Web Dashboard', 'Fin descanso AM', NOW()),

-- Almuerzo (12:00 - 13:00 PM Colombia)
(1, 'salida', CONCAT(@fecha_hoy, ' 12:00:00'), 4.6097, -74.0817, 'Web Dashboard', 'Inicio almuerzo', NOW()),
(1, 'entrada', CONCAT(@fecha_hoy, ' 13:00:00'), 4.6097, -74.0817, 'Web Dashboard', 'Fin almuerzo', NOW());

-- Insertar datos de otros empleados también
INSERT INTO registros_acceso (
    usuario_id, tipo, timestamp, latitud, longitud, 
    dispositivo, notas, created_at
) VALUES 
-- María (ID=2)
(2, 'entrada', CONCAT(@fecha_hoy, ' 07:45:00'), 4.6097, -74.0817, 'App Móvil', 'Entrada María', NOW()),
(2, 'salida', CONCAT(@fecha_hoy, ' 12:15:00'), 4.6097, -74.0817, 'App Móvil', 'Almuerzo María', NOW()),
(2, 'entrada', CONCAT(@fecha_hoy, ' 13:15:00'), 4.6097, -74.0817, 'App Móvil', 'Regreso María', NOW()),

-- Juan (ID=3)
(3, 'entrada', CONCAT(@fecha_hoy, ' 08:10:00'), 4.6097, -74.0817, 'Tarjeta RFID', 'Entrada Juan', NOW()),
(3, 'salida', CONCAT(@fecha_hoy, ' 12:30:00'), 4.6097, -74.0817, 'Tarjeta RFID', 'Almuerzo Juan', NOW()),
(3, 'entrada', CONCAT(@fecha_hoy, ' 13:30:00'), 4.6097, -74.0817, 'Tarjeta RFID', 'Regreso Juan', NOW());

-- ============================================
-- CREAR TABLA DE JORNADAS LABORALES
-- ============================================

-- Tabla para almacenar jornadas laborales completas
CREATE TABLE IF NOT EXISTS jornadas_laborales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    entrada DATETIME,
    descanso_manana_inicio DATETIME,
    descanso_manana_fin DATETIME,
    almuerzo_inicio DATETIME,
    almuerzo_fin DATETIME,
    descanso_tarde_inicio DATETIME,
    descanso_tarde_fin DATETIME,
    salida DATETIME,
    horas_trabajadas DECIMAL(4,2) DEFAULT 0,
    estado ENUM('en_curso', 'completada', 'incompleta') DEFAULT 'en_curso',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE KEY unique_usuario_fecha (usuario_id, fecha)
);

-- Insertar jornada actual del admin (simulando que está trabajando)
INSERT INTO jornadas_laborales (
    usuario_id, fecha, entrada, 
    descanso_manana_inicio, descanso_manana_fin,
    almuerzo_inicio, almuerzo_fin,
    estado
) VALUES (
    1, 
    @fecha_hoy,
    CONCAT(@fecha_hoy, ' 08:15:00'),
    CONCAT(@fecha_hoy, ' 10:30:00'),
    CONCAT(@fecha_hoy, ' 10:45:00'),
    CONCAT(@fecha_hoy, ' 12:00:00'),
    CONCAT(@fecha_hoy, ' 13:00:00'),
    'en_curso'
) ON DUPLICATE KEY UPDATE
    entrada = CONCAT(@fecha_hoy, ' 08:15:00'),
    descanso_manana_inicio = CONCAT(@fecha_hoy, ' 10:30:00'),
    descanso_manana_fin = CONCAT(@fecha_hoy, ' 10:45:00'),
    almuerzo_inicio = CONCAT(@fecha_hoy, ' 12:00:00'),
    almuerzo_fin = CONCAT(@fecha_hoy, ' 13:00:00'),
    estado = 'en_curso';

-- ============================================
-- VERIFICACIÓN DE DATOS CORREGIDOS
-- ============================================

SELECT 
    '=== DATOS CORREGIDOS (COLOMBIA GMT-5) ===' as info;

-- Mostrar registros con hora de Colombia
SELECT 
    ra.id,
    ra.usuario_id as user_id,
    u.nombre,
    ra.tipo,
    ra.timestamp,
    DATE_FORMAT(ra.timestamp, '%H:%i:%s') as hora_colombia,
    ra.dispositivo
FROM registros_acceso ra
INNER JOIN usuarios u ON ra.usuario_id = u.id
WHERE DATE(ra.timestamp) = CURDATE()
ORDER BY ra.timestamp DESC;

-- Mostrar jornada laboral actual
SELECT 
    '=== JORNADA LABORAL ACTUAL ===' as info;

SELECT 
    jl.*,
    u.nombre,
    u.apellido,
    DATE_FORMAT(jl.entrada, '%H:%i:%s') as entrada_hora,
    DATE_FORMAT(jl.descanso_manana_inicio, '%H:%i:%s') as descanso_am_inicio,
    DATE_FORMAT(jl.descanso_manana_fin, '%H:%i:%s') as descanso_am_fin,
    DATE_FORMAT(jl.almuerzo_inicio, '%H:%i:%s') as almuerzo_inicio_hora,
    DATE_FORMAT(jl.almuerzo_fin, '%H:%i:%s') as almuerzo_fin_hora
FROM jornadas_laborales jl
INNER JOIN usuarios u ON jl.usuario_id = u.id
WHERE jl.fecha = CURDATE();

SELECT 
    '=== CORRECCIÓN TIMEZONE COMPLETADA ===' as resultado;