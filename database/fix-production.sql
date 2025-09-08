-- ====================================
-- SCRIPT DE CORRECCIÓN PARA PRODUCCIÓN
-- Elimina triggers, vistas y procedimientos problemáticos
-- ====================================

USE control_acceso_oxitrans;

-- Eliminar triggers si existen
DROP TRIGGER IF EXISTS generar_codigo_acceso;
DROP TRIGGER IF EXISTS audit_usuarios_update;

-- Eliminar procedimientos si existen  
DROP PROCEDURE IF EXISTS RegistrarAcceso;
DROP PROCEDURE IF EXISTS ObtenerEstadisticas;

-- Eliminar vistas si existen
DROP VIEW IF EXISTS usuarios_activos;
DROP VIEW IF EXISTS registros_hoy;
DROP VIEW IF EXISTS estadisticas_diarias;

-- ====================================
-- RECREAR OBJETOS SIN DEFINER ESPECÍFICO
-- ====================================

-- Vista de usuarios activos (simplificada)
CREATE VIEW usuarios_activos AS
SELECT 
    id, nombre, apellido, email, documento, 
    departamento, cargo, codigo_acceso,
    fecha_ingreso, created_at
FROM usuarios 
WHERE estado = 'activo';

-- Vista de registros de hoy (simplificada)  
CREATE VIEW registros_hoy AS
SELECT 
    ra.id, ra.usuario_id, ra.tipo, ra.timestamp,
    u.nombre, u.apellido, u.departamento
FROM registros_acceso ra
INNER JOIN usuarios u ON ra.usuario_id = u.id
WHERE DATE(ra.timestamp) = CURDATE();

-- ====================================
-- TRIGGER SIMPLIFICADO PARA CÓDIGO DE ACCESO
-- ====================================

DELIMITER //

CREATE TRIGGER generar_codigo_acceso
    BEFORE INSERT ON usuarios
    FOR EACH ROW
BEGIN
    -- Solo generar código si no se proporciona uno
    IF NEW.codigo_acceso IS NULL OR NEW.codigo_acceso = '' THEN
        SET NEW.codigo_acceso = CONCAT(
            'OX',
            YEAR(CURDATE()),
            LPAD(SUBSTRING(NEW.documento, -4), 4, '0'),
            LPAD((SELECT COUNT(*) + 1 FROM usuarios), 3, '0')
        );
    END IF;
END //

DELIMITER ;

-- ====================================
-- VERIFICAR PERMISOS
-- ====================================

-- Mostrar información del usuario actual
SELECT USER() as 'Usuario Actual', DATABASE() as 'Base de Datos';

-- Verificar que las tablas principales existen
SHOW TABLES LIKE 'usuarios';
SHOW TABLES LIKE 'registros_acceso';
SHOW TABLES LIKE 'password_reset_tokens';

-- Verificar estructura básica
DESCRIBE usuarios;
