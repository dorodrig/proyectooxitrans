-- Eliminar datos de hoy para recrearlos correctamente
DELETE FROM registros_acceso WHERE DATE(timestamp) = CURDATE();

-- Obtener fecha de hoy
SET @fecha_hoy = CURDATE();

-- Insertar datos realistas para el usuario admin (ID=1) simulando una jornada en curso
-- Usando horarios de Colombia (que se guardan como UTC+0 pero representan GMT-5)
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

-- Insertar datos de otros empleados
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