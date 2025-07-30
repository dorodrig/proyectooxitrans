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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_documento (documento),
    INDEX idx_codigo_acceso (codigo_acceso),
    INDEX idx_estado (estado),
    INDEX idx_rol (rol),
    INDEX idx_departamento (departamento)
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

-- Procedimiento para registrar acceso
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
SHOW TABLES;

-- Mostrar usuario administrador creado
SELECT id, nombre, apellido, email, rol, estado 
FROM usuarios 
WHERE rol = 'admin';

-- Mostrar configuración de empresa
SELECT nombre, nit, email, hora_inicio_jornada, hora_fin_jornada 
FROM empresa;

-- ====================================
-- SCRIPT COMPLETADO
-- ====================================
SELECT 'Base de datos OXITRANS Control de Acceso creada exitosamente' AS resultado;
