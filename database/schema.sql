-- ====================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- OXITRANS S.A.S - Control de Acceso
-- ====================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS control_acceso_oxitrans 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE control_acceso_oxitrans;

-- ====================================
-- TABLA DE USUARIOS
-- ====================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    documento VARCHAR(50) UNIQUE NOT NULL,
    tipo_documento ENUM('CC', 'CE', 'PA') NOT NULL DEFAULT 'CC',
    rol ENUM('admin', 'empleado', 'supervisor') NOT NULL DEFAULT 'empleado',
    estado ENUM('activo', 'inactivo', 'suspendido', 'eliminado') NOT NULL DEFAULT 'activo',
    fecha_ingreso DATE NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    codigo_acceso VARCHAR(50) UNIQUE,
    foto_url VARCHAR(500),
    password_hash VARCHAR(255) NOT NULL,
    regional_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (regional_id) REFERENCES regionales(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_documento (documento),
    INDEX idx_codigo_acceso (codigo_acceso),
    INDEX idx_estado (estado),
    INDEX idx_rol (rol),
    INDEX idx_departamento (departamento),
    INDEX idx_regional_id (regional_id)
);

-- ====================================
-- TABLA DE REGISTROS DE ACCESO
-- ====================================
CREATE TABLE registros_acceso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('entrada', 'salida') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    dispositivo VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_timestamp (timestamp),
    INDEX idx_fecha (DATE(timestamp))
);

-- ====================================
-- TABLA DE JORNADAS LABORALES
-- ====================================
CREATE TABLE jornadas_laborales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    
    -- Marcación de entrada
    entrada TIMESTAMP NULL,
    ubicacion_entrada_lat DECIMAL(10, 8) NULL,
    ubicacion_entrada_lng DECIMAL(11, 8) NULL,
    ubicacion_entrada_accuracy DECIMAL(6, 2) NULL,
    
    -- Descanso mañana (15 minutos)
    descanso_manana_inicio TIMESTAMP NULL,
    descanso_manana_fin TIMESTAMP NULL,
    
    -- Almuerzo (1 hora máximo)
    almuerzo_inicio TIMESTAMP NULL,
    almuerzo_fin TIMESTAMP NULL,
    
    -- Descanso tarde (15 minutos)
    descanso_tarde_inicio TIMESTAMP NULL,
    descanso_tarde_fin TIMESTAMP NULL,
    
    -- Marcación de salida
    salida TIMESTAMP NULL,
    ubicacion_salida_lat DECIMAL(10, 8) NULL,
    ubicacion_salida_lng DECIMAL(11, 8) NULL,
    ubicacion_salida_accuracy DECIMAL(6, 2) NULL,
    
    -- Cálculos y control
    horas_trabajadas DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    auto_cerrada BOOLEAN NOT NULL DEFAULT FALSE,
    auto_cerrada_razon VARCHAR(255) NULL,
    observaciones TEXT NULL,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints y validaciones
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Un usuario solo puede tener una jornada por día
    UNIQUE KEY unique_usuario_fecha (usuario_id, fecha),
    
    -- Indices para consultas eficientes
    INDEX idx_usuario_fecha (usuario_id, fecha),
    INDEX idx_fecha (fecha),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_auto_cerrada (auto_cerrada),
    INDEX idx_horas_trabajadas (horas_trabajadas),
    
    -- Constraints de validación
    CONSTRAINT chk_horas_trabajadas CHECK (horas_trabajadas >= 0 AND horas_trabajadas <= 24),
    CONSTRAINT chk_entrada_antes_salida CHECK (
        salida IS NULL OR entrada IS NULL OR salida >= entrada
    ),
    CONSTRAINT chk_almuerzo_orden CHECK (
        almuerzo_fin IS NULL OR almuerzo_inicio IS NULL OR almuerzo_fin >= almuerzo_inicio
    ),
    CONSTRAINT chk_descanso_manana_orden CHECK (
        descanso_manana_fin IS NULL OR descanso_manana_inicio IS NULL OR 
        descanso_manana_fin >= descanso_manana_inicio
    ),
    CONSTRAINT chk_descanso_tarde_orden CHECK (
        descanso_tarde_fin IS NULL OR descanso_tarde_inicio IS NULL OR 
        descanso_tarde_fin >= descanso_tarde_inicio
    )
);

-- ====================================
-- TABLA DE REGIONALES
-- ====================================
CREATE TABLE regionales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre)
);

-- ====================================
-- TABLA DE EMPRESA
-- ====================================
CREATE TABLE empresa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    nit VARCHAR(50) UNIQUE NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    hora_inicio_jornada TIME NOT NULL DEFAULT '08:00:00',
    hora_fin_jornada TIME NOT NULL DEFAULT '17:00:00',
    tolerancia_minutos INT NOT NULL DEFAULT 15,
    requiere_ubicacion BOOLEAN NOT NULL DEFAULT FALSE,
    dias_laborales JSON NOT NULL DEFAULT '[1,2,3,4,5]', -- Lunes a Viernes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ====================================
-- TABLA DE NOTIFICACIONES
-- ====================================
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    tipo ENUM('info', 'warning', 'error', 'success') NOT NULL DEFAULT 'info',
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_leida (leida),
    INDEX idx_timestamp (timestamp)
);

-- ====================================
-- TABLA DE SESIONES (para JWT blacklist)
-- ====================================
CREATE TABLE sesiones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_revoked (revoked)
);

-- ====================================
-- INSERTAR DATOS INICIALES
-- ====================================

-- Insertar configuración de empresa
INSERT INTO empresa (
    nombre, nit, direccion, telefono, email,
    hora_inicio_jornada, hora_fin_jornada, tolerancia_minutos,
    requiere_ubicacion, dias_laborales
) VALUES (
    'OXITRANS S.A.S',
    '123456789-0',
    'Calle Principal #123, Ciudad, País',
    '+57 123 456 7890',
    'admin@oxitrans.com',
    '08:00:00',
    '17:00:00',
    15,
    FALSE,
    '[1,2,3,4,5]'
);

-- Insertar usuario administrador por defecto
-- Contraseña: admin123 (cambiar en producción)
INSERT INTO usuarios (
    nombre, apellido, email, documento, tipo_documento,
    rol, estado, fecha_ingreso, departamento, cargo,
    password_hash
) VALUES (
    'Administrador',
    'Sistema',
    'admin@oxitrans.com',
    '12345678',
    'CC',
    'admin',
    'activo',
    CURDATE(),
    'Administración',
    'Administrador del Sistema',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.9U8XUe9fQOLKozBhH2lW.8tQPgm.Ie'
);

-- Insertar algunos empleados de ejemplo
INSERT INTO usuarios (
    nombre, apellido, email, documento, tipo_documento,
    rol, estado, fecha_ingreso, departamento, cargo,
    password_hash
) VALUES 
(
    'Juan Carlos',
    'Pérez García',
    'juan.perez@oxitrans.com',
    '87654321',
    'CC',
    'empleado',
    'activo',
    '2024-01-15',
    'Operaciones',
    'Operador de Transporte',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.9U8XUe9fQOLKozBhH2lW.8tQPgm.Ie'
),
(
    'María Elena',
    'González López',
    'maria.gonzalez@oxitrans.com',
    '11223344',
    'CC',
    'supervisor',
    'activo',
    '2023-06-10',
    'Logística',
    'Supervisor de Logística',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.9U8XUe9fQOLKozBhH2lW.8tQPgm.Ie'
),
(
    'Carlos Alberto',
    'Silva Mendoza',
    'carlos.silva@oxitrans.com',
    '55667788',
    'CC',
    'empleado',
    'activo',
    '2024-03-01',
    'Mantenimiento',
    'Técnico de Mantenimiento',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.9U8XUe9fQOLKozBhH2lW.8tQPgm.Ie'
);

-- ====================================
-- VISTAS ÚTILES
-- ====================================

-- Vista de usuarios activos
CREATE VIEW usuarios_activos AS
SELECT 
    id, nombre, apellido, email, telefono, documento,
    tipo_documento, rol, fecha_ingreso, departamento, cargo,
    codigo_acceso, foto_url, created_at, updated_at
FROM usuarios 
WHERE estado = 'activo';

-- Vista de jornadas laborales del día actual
CREATE VIEW jornadas_hoy AS
SELECT 
    j.id, j.usuario_id, j.fecha,
    j.entrada, j.almuerzo_inicio, j.almuerzo_fin, j.salida,
    j.descanso_manana_inicio, j.descanso_manana_fin,
    j.descanso_tarde_inicio, j.descanso_tarde_fin,
    j.horas_trabajadas, j.auto_cerrada, j.observaciones,
    u.nombre, u.apellido, u.documento, u.departamento, u.cargo
FROM jornadas_laborales j
JOIN usuarios u ON j.usuario_id = u.id
WHERE j.fecha = CURDATE()
ORDER BY j.entrada DESC;

-- Vista de estadísticas diarias de jornadas
CREATE VIEW estadisticas_jornadas_diarias AS
SELECT 
    fecha,
    COUNT(*) as total_jornadas,
    COUNT(CASE WHEN entrada IS NOT NULL AND salida IS NOT NULL THEN 1 END) as jornadas_completas,
    COUNT(CASE WHEN auto_cerrada = TRUE THEN 1 END) as jornadas_auto_cerradas,
    AVG(horas_trabajadas) as promedio_horas,
    MIN(horas_trabajadas) as min_horas,
    MAX(horas_trabajadas) as max_horas,
    COUNT(CASE WHEN TIME(entrada) <= '07:15:00' THEN 1 END) as entradas_puntuales
FROM jornadas_laborales
GROUP BY fecha
ORDER BY fecha DESC;

-- Vista de registros de acceso del día actual
CREATE VIEW registros_hoy AS
SELECT 
    r.id, r.usuario_id, r.tipo, r.timestamp,
    r.latitud, r.longitud, r.dispositivo, r.notas,
    u.nombre, u.apellido, u.documento, u.departamento
FROM registros_acceso r
JOIN usuarios u ON r.usuario_id = u.id
WHERE DATE(r.timestamp) = CURDATE()
ORDER BY r.timestamp DESC;

-- Vista de estadísticas diarias
CREATE VIEW estadisticas_diarias AS
SELECT 
    DATE(timestamp) as fecha,
    COUNT(*) as total_registros,
    COUNT(DISTINCT usuario_id) as empleados_registrados,
    SUM(CASE WHEN tipo = 'entrada' THEN 1 ELSE 0 END) as entradas,
    SUM(CASE WHEN tipo = 'salida' THEN 1 ELSE 0 END) as salidas
FROM registros_acceso
GROUP BY DATE(timestamp)
ORDER BY fecha DESC;

-- ====================================
-- PROCEDIMIENTOS ALMACENADOS
-- ====================================

DELIMITER //

-- Procedimiento para iniciar jornada laboral
CREATE PROCEDURE IniciarJornada(
    IN p_usuario_id INT,
    IN p_latitud DECIMAL(10, 8),
    IN p_longitud DECIMAL(11, 8),
    IN p_accuracy DECIMAL(6, 2)
)
BEGIN
    DECLARE v_fecha DATE DEFAULT CURDATE();
    DECLARE v_existe INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Verificar si ya existe jornada para hoy
    SELECT COUNT(*) INTO v_existe 
    FROM jornadas_laborales 
    WHERE usuario_id = p_usuario_id AND fecha = v_fecha;
    
    IF v_existe > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una jornada registrada para hoy';
    END IF;
    
    -- Crear nueva jornada
    INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada, 
        ubicacion_entrada_lat, ubicacion_entrada_lng, ubicacion_entrada_accuracy
    ) VALUES (
        p_usuario_id, v_fecha, NOW(), 
        p_latitud, p_longitud, p_accuracy
    );
    
    COMMIT;
END //

-- Procedimiento para registrar evento en jornada
CREATE PROCEDURE RegistrarEventoJornada(
    IN p_usuario_id INT,
    IN p_tipo ENUM('descanso_manana_inicio', 'descanso_manana_fin', 
                   'almuerzo_inicio', 'almuerzo_fin', 
                   'descanso_tarde_inicio', 'descanso_tarde_fin', 'salida'),
    IN p_latitud DECIMAL(10, 8),
    IN p_longitud DECIMAL(11, 8),
    IN p_accuracy DECIMAL(6, 2),
    IN p_observaciones TEXT
)
BEGIN
    DECLARE v_fecha DATE DEFAULT CURDATE();
    DECLARE v_jornada_id INT;
    DECLARE v_timestamp TIMESTAMP DEFAULT NOW();
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Obtener ID de jornada actual
    SELECT id INTO v_jornada_id 
    FROM jornadas_laborales 
    WHERE usuario_id = p_usuario_id AND fecha = v_fecha;
    
    IF v_jornada_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No existe jornada iniciada para hoy';
    END IF;
    
    -- Registrar evento según tipo
    CASE p_tipo
        WHEN 'descanso_manana_inicio' THEN
            UPDATE jornadas_laborales 
            SET descanso_manana_inicio = v_timestamp
            WHERE id = v_jornada_id;
            
        WHEN 'descanso_manana_fin' THEN
            UPDATE jornadas_laborales 
            SET descanso_manana_fin = v_timestamp
            WHERE id = v_jornada_id;
            
        WHEN 'almuerzo_inicio' THEN
            UPDATE jornadas_laborales 
            SET almuerzo_inicio = v_timestamp
            WHERE id = v_jornada_id;
            
        WHEN 'almuerzo_fin' THEN
            UPDATE jornadas_laborales 
            SET almuerzo_fin = v_timestamp
            WHERE id = v_jornada_id;
            
        WHEN 'descanso_tarde_inicio' THEN
            UPDATE jornadas_laborales 
            SET descanso_tarde_inicio = v_timestamp
            WHERE id = v_jornada_id;
            
        WHEN 'descanso_tarde_fin' THEN
            UPDATE jornadas_laborales 
            SET descanso_tarde_fin = v_timestamp
            WHERE id = v_jornada_id;
            
        WHEN 'salida' THEN
            UPDATE jornadas_laborales 
            SET salida = v_timestamp,
                ubicacion_salida_lat = p_latitud,
                ubicacion_salida_lng = p_longitud,
                ubicacion_salida_accuracy = p_accuracy
            WHERE id = v_jornada_id;
    END CASE;
    
    -- Actualizar observaciones si se proporcionan
    IF p_observaciones IS NOT NULL THEN
        UPDATE jornadas_laborales 
        SET observaciones = CONCAT(COALESCE(observaciones, ''), 
                                  CASE WHEN observaciones IS NULL THEN '' ELSE '; ' END,
                                  p_observaciones)
        WHERE id = v_jornada_id;
    END IF;
    
    -- Recalcular horas trabajadas
    CALL CalcularHorasTrabajadas(v_jornada_id);
    
    COMMIT;
END //

-- Procedimiento para calcular horas trabajadas
CREATE PROCEDURE CalcularHorasTrabajadas(IN p_jornada_id INT)
BEGIN
    DECLARE v_entrada TIMESTAMP;
    DECLARE v_salida TIMESTAMP;
    DECLARE v_almuerzo_inicio TIMESTAMP;
    DECLARE v_almuerzo_fin TIMESTAMP;
    DECLARE v_descanso_m_inicio TIMESTAMP;
    DECLARE v_descanso_m_fin TIMESTAMP;
    DECLARE v_descanso_t_inicio TIMESTAMP;
    DECLARE v_descanso_t_fin TIMESTAMP;
    DECLARE v_horas_totales DECIMAL(4, 2) DEFAULT 0;
    
    -- Obtener todos los timestamps
    SELECT entrada, salida, almuerzo_inicio, almuerzo_fin,
           descanso_manana_inicio, descanso_manana_fin,
           descanso_tarde_inicio, descanso_tarde_fin
    INTO v_entrada, v_salida, v_almuerzo_inicio, v_almuerzo_fin,
         v_descanso_m_inicio, v_descanso_m_fin,
         v_descanso_t_inicio, v_descanso_t_fin
    FROM jornadas_laborales 
    WHERE id = p_jornada_id;
    
    -- Calcular si hay entrada
    IF v_entrada IS NOT NULL THEN
        -- Usar salida si existe, si no usar hora actual
        SET v_salida = COALESCE(v_salida, NOW());
        
        -- Horas totales = tiempo entre entrada y salida
        SET v_horas_totales = TIMESTAMPDIFF(MINUTE, v_entrada, v_salida) / 60.0;
        
        -- Restar tiempo de almuerzo
        IF v_almuerzo_inicio IS NOT NULL THEN
            SET v_almuerzo_fin = COALESCE(v_almuerzo_fin, NOW());
            SET v_horas_totales = v_horas_totales - 
                (TIMESTAMPDIFF(MINUTE, v_almuerzo_inicio, v_almuerzo_fin) / 60.0);
        END IF;
        
        -- Restar descansos
        IF v_descanso_m_inicio IS NOT NULL AND v_descanso_m_fin IS NOT NULL THEN
            SET v_horas_totales = v_horas_totales - 
                (TIMESTAMPDIFF(MINUTE, v_descanso_m_inicio, v_descanso_m_fin) / 60.0);
        END IF;
        
        IF v_descanso_t_inicio IS NOT NULL AND v_descanso_t_fin IS NOT NULL THEN
            SET v_horas_totales = v_horas_totales - 
                (TIMESTAMPDIFF(MINUTE, v_descanso_t_inicio, v_descanso_t_fin) / 60.0);
        END IF;
        
        -- Asegurar que las horas no sean negativas
        SET v_horas_totales = GREATEST(0, v_horas_totales);
    END IF;
    
    -- Actualizar jornada
    UPDATE jornadas_laborales 
    SET horas_trabajadas = v_horas_totales
    WHERE id = p_jornada_id;
END //

-- Procedimiento para auto-cerrar jornadas de 8 horas
CREATE PROCEDURE AutoCerrarJornadas()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_jornada_id INT;
    DECLARE v_usuario_id INT;
    DECLARE v_nombre VARCHAR(100);
    DECLARE v_apellido VARCHAR(100);
    DECLARE v_email VARCHAR(255);
    
    DECLARE jornadas_cursor CURSOR FOR
        SELECT j.id, j.usuario_id, u.nombre, u.apellido, u.email
        FROM jornadas_laborales j
        JOIN usuarios u ON j.usuario_id = u.id
        WHERE j.fecha = CURDATE()
          AND j.entrada IS NOT NULL
          AND j.salida IS NULL
          AND j.auto_cerrada = FALSE
          AND TIMESTAMPDIFF(HOUR, j.entrada, NOW()) >= 8;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN jornadas_cursor;
    
    read_loop: LOOP
        FETCH jornadas_cursor INTO v_jornada_id, v_usuario_id, v_nombre, v_apellido, v_email;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Cerrar jornada automáticamente
        UPDATE jornadas_laborales 
        SET salida = DATE_ADD(entrada, INTERVAL 8 HOUR),
            auto_cerrada = TRUE,
            auto_cerrada_razon = 'Jornada cerrada automáticamente después de 8 horas'
        WHERE id = v_jornada_id;
        
        -- Recalcular horas
        CALL CalcularHorasTrabajadas(v_jornada_id);
        
        -- Crear notificación
        INSERT INTO notificaciones (
            usuario_id, tipo, titulo, mensaje
        ) VALUES (
            v_usuario_id,
            'warning',
            'Jornada Auto-cerrada',
            CONCAT('Tu jornada laboral fue cerrada automáticamente después de 8 horas. ',
                   'Se enviará un email de notificación.')
        );
        
    END LOOP;
    
    CLOSE jornadas_cursor;
END //

-- Procedimiento para registrar acceso (mantener compatibilidad)
CREATE PROCEDURE RegistrarAcceso(
    IN p_usuario_id INT,
    IN p_tipo ENUM('entrada', 'salida'),
    IN p_latitud DECIMAL(10, 8),
    IN p_longitud DECIMAL(11, 8),
    IN p_dispositivo VARCHAR(255),
    IN p_notas TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO registros_acceso (
        usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas
    ) VALUES (
        p_usuario_id, p_tipo, NOW(), p_latitud, p_longitud, p_dispositivo, p_notas
    );
    
    COMMIT;
END //

-- Procedimiento para obtener estadísticas
CREATE PROCEDURE ObtenerEstadisticas(IN p_fecha DATE)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE estado = 'activo') as total_empleados,
        (SELECT COUNT(DISTINCT usuario_id) FROM registros_acceso WHERE DATE(timestamp) = p_fecha) as empleados_registrados,
        (SELECT COUNT(*) FROM registros_acceso WHERE DATE(timestamp) = p_fecha) as total_registros,
        (SELECT COUNT(*) FROM registros_acceso WHERE DATE(timestamp) = p_fecha AND tipo = 'entrada') as entradas,
        (SELECT COUNT(*) FROM registros_acceso WHERE DATE(timestamp) = p_fecha AND tipo = 'salida') as salidas;
END //

DELIMITER ;

-- ====================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ====================================

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_usuario_fecha_tipo ON registros_acceso(usuario_id, DATE(timestamp), tipo);
CREATE INDEX idx_timestamp_tipo ON registros_acceso(timestamp, tipo);

-- ====================================
-- TRIGGERS
-- ====================================

DELIMITER //

-- Trigger para generar código de acceso automático
CREATE TRIGGER generar_codigo_acceso
    BEFORE INSERT ON usuarios
    FOR EACH ROW
BEGIN
    IF NEW.codigo_acceso IS NULL THEN
        SET NEW.codigo_acceso = CONCAT(
            'OX',
            YEAR(NEW.fecha_ingreso),
            LPAD(NEW.documento, 6, '0')
        );
    END IF;
END //

-- Trigger para auditoría de cambios en usuarios
CREATE TRIGGER audit_usuarios_update
    AFTER UPDATE ON usuarios
    FOR EACH ROW
BEGIN
    INSERT INTO notificaciones (
        usuario_id, tipo, titulo, mensaje
    ) VALUES (
        NEW.id,
        'info',
        'Perfil Actualizado',
        CONCAT('Tu perfil fue actualizado el ', DATE_FORMAT(NOW(), '%d/%m/%Y a las %H:%i'))
    );
END //

-- Trigger para validar horarios de descanso en jornadas
CREATE TRIGGER validar_horarios_jornada
    BEFORE UPDATE ON jornadas_laborales
    FOR EACH ROW
BEGIN
    -- Validar duración del almuerzo (máximo 1 hora)
    IF NEW.almuerzo_inicio IS NOT NULL AND NEW.almuerzo_fin IS NOT NULL THEN
        IF TIMESTAMPDIFF(MINUTE, NEW.almuerzo_inicio, NEW.almuerzo_fin) > 60 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'El almuerzo no puede exceder 60 minutos';
        END IF;
    END IF;
    
    -- Validar duración de descansos (máximo 15 minutos cada uno)
    IF NEW.descanso_manana_inicio IS NOT NULL AND NEW.descanso_manana_fin IS NOT NULL THEN
        IF TIMESTAMPDIFF(MINUTE, NEW.descanso_manana_inicio, NEW.descanso_manana_fin) > 15 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Los descansos no pueden exceder 15 minutos';
        END IF;
    END IF;
    
    IF NEW.descanso_tarde_inicio IS NOT NULL AND NEW.descanso_tarde_fin IS NOT NULL THEN
        IF TIMESTAMPDIFF(MINUTE, NEW.descanso_tarde_inicio, NEW.descanso_tarde_fin) > 15 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Los descansos no pueden exceder 15 minutos';
        END IF;
    END IF;
END //

-- Trigger para notificar registro de entrada
CREATE TRIGGER notificar_entrada_jornada
    AFTER INSERT ON jornadas_laborales
    FOR EACH ROW
BEGIN
    INSERT INTO notificaciones (
        usuario_id, tipo, titulo, mensaje
    ) VALUES (
        NEW.usuario_id,
        'success',
        'Entrada Registrada',
        CONCAT('Entrada registrada exitosamente a las ', 
               TIME_FORMAT(NEW.entrada, '%H:%i'), 
               ' del ', DATE_FORMAT(NEW.fecha, '%d/%m/%Y'))
    );
END //

-- Trigger para notificar cierre de jornada
CREATE TRIGGER notificar_salida_jornada
    AFTER UPDATE ON jornadas_laborales
    FOR EACH ROW
BEGIN
    -- Solo si se acaba de registrar la salida
    IF OLD.salida IS NULL AND NEW.salida IS NOT NULL THEN
        INSERT INTO notificaciones (
            usuario_id, tipo, titulo, mensaje
        ) VALUES (
            NEW.usuario_id,
            'info',
            'Jornada Finalizada',
            CONCAT('Jornada finalizada a las ', 
                   TIME_FORMAT(NEW.salida, '%H:%i'), 
                   '. Horas trabajadas: ', 
                   FORMAT(NEW.horas_trabajadas, 2), ' hrs')
        );
    END IF;
END //

DELIMITER ;

-- ====================================
-- TABLA DE TOKENS DE RECUPERACIÓN DE CONTRASEÑA
-- ====================================
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_usado (usado)
);

-- ====================================
-- VERIFICACIÓN FINAL
-- ====================================

-- Mostrar tablas creadas
-- ====================================
-- DATOS INICIALES DE REGIONALES
-- ====================================
INSERT INTO regionales (nombre, descripcion, latitud, longitud) VALUES
('bogotá', 'Regional principal en Bogotá D.C.', 4.60971, -74.08175),
('medellín', 'Regional Antioquia - Medellín', 6.25184, -75.56359),
('cali', 'Regional Valle del Cauca - Cali', 3.43722, -76.5225),
('barranquilla', 'Regional Atlántico - Barranquilla', 10.96854, -74.78132),
('cartagena', 'Regional Bolívar - Cartagena', 10.39972, -75.51444),
('bucaramanga', 'Regional Santander - Bucaramanga', 7.11392, -73.1198);

-- ====================================
-- VERIFICACIONES FINALES
-- ====================================

SHOW TABLES;

-- Mostrar usuario administrador creado
SELECT id, nombre, apellido, email, rol, estado 
FROM usuarios 
WHERE rol = 'admin';

-- Mostrar configuración de empresa
SELECT nombre, nit, email, hora_inicio_jornada, hora_fin_jornada 
FROM empresa;

-- Mostrar regionales creadas
SELECT id, nombre, descripcion, latitud, longitud
FROM regionales;

-- ====================================
-- TABLA DE NOVEDADES
-- ====================================
CREATE TABLE novedades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuarioId INT NOT NULL,
    tipo ENUM('incapacidad', 'ausentismo', 'permiso', 'no_remunerado', 'lic_maternidad', 'lic_paternidad', 'dia_familia') NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaFin DATE NOT NULL,
    horas INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuarioId),
    INDEX idx_tipo (tipo),
    INDEX idx_fechas (fechaInicio, fechaFin)
);

-- ====================================
-- SCRIPT COMPLETADO
-- ====================================
SELECT 'Base de datos OXITRANS Control de Acceso creada exitosamente' AS resultado;
