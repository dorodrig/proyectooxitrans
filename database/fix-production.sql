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

-- Crear trigger sin DEFINER específico (usa el usuario actual)
DROP TRIGGER IF EXISTS generar_codigo_acceso;

-- OPCIÓN 1: Trigger simple (usa un número aleatorio si hay problemas con COUNT)
DELIMITER //

CREATE TRIGGER generar_codigo_acceso
    BEFORE INSERT ON usuarios
    FOR EACH ROW
BEGIN    
    -- Solo generar código si no se proporciona uno
    IF NEW.codigo_acceso IS NULL OR NEW.codigo_acceso = '' THEN
        -- Generar código usando timestamp para evitar conflictos
        SET NEW.codigo_acceso = CONCAT(
            'OX',
            YEAR(CURDATE()),
            LPAD(SUBSTRING(NEW.documento, -4), 4, '0'),
            LPAD(UNIX_TIMESTAMP() % 1000, 3, '0')
        );
    END IF;
END//

DELIMITER ;

-- ====================================
-- PROCEDIMIENTO ALTERNATIVO PARA GENERAR CÓDIGOS
-- ====================================

DELIMITER //

CREATE PROCEDURE GenerarCodigoAcceso(
    IN p_documento VARCHAR(20),
    OUT p_codigo VARCHAR(20)
)
BEGIN
    DECLARE user_count INT DEFAULT 0;
    
    -- Obtener conteo actual
    SELECT COUNT(*) INTO user_count FROM usuarios;
    
    -- Generar código único
    SET p_codigo = CONCAT(
        'OX',
        YEAR(CURDATE()),
        LPAD(SUBSTRING(p_documento, -4), 4, '0'),
        LPAD((user_count + 1), 3, '0')
    );
END//

DELIMITER ;

-- ====================================
-- VERIFICAR PERMISOS Y HACER PRUEBAS
-- ====================================

-- Mostrar información del usuario actual
SELECT USER() as 'Usuario Actual', DATABASE() as 'Base de Datos';

-- Verificar que las tablas principales existen
SHOW TABLES LIKE 'usuarios';
SHOW TABLES LIKE 'registros_acceso';
SHOW TABLES LIKE 'password_reset_tokens';

-- Verificar estructura básica
DESCRIBE usuarios;

-- Verificar que el trigger se creó correctamente
SHOW TRIGGERS LIKE 'usuarios';

-- Verificar que las vistas funcionan
SELECT COUNT(*) as 'Usuarios Activos' FROM usuarios_activos;

-- ====================================
-- TEST DEL SISTEMA (OPCIONAL)
-- ====================================

-- Puedes probar el trigger insertando un usuario de prueba:
-- INSERT INTO usuarios (nombre, apellido, email, documento, tipo_documento, rol, estado, password_hash) 
-- VALUES ('Test', 'User', 'test@test.com', '12345678', 'CC', 'empleado', 'activo', 'test_hash');
-- 
-- Luego verificar que se generó el código:
-- SELECT codigo_acceso FROM usuarios WHERE email = 'test@test.com';
-- 
-- Y eliminar el usuario de prueba:
-- DELETE FROM usuarios WHERE email = 'test@test.com';

SELECT 'Script ejecutado exitosamente' as 'Resultado';
