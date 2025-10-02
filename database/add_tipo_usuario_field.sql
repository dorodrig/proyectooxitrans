-- ============================================
-- AGREGAR CAMPO TIPO_USUARIO A TABLA USUARIOS
-- ============================================

USE control_acceso_oxitrans;

-- Agregar columna tipo_usuario a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN tipo_usuario ENUM('planta', 'visita') DEFAULT 'planta' 
AFTER regional_id;

-- Agregar índice para optimizar consultas
ALTER TABLE usuarios 
ADD INDEX idx_tipo_usuario (tipo_usuario);

-- Verificar la estructura actualizada
DESCRIBE usuarios;

SELECT 'Campo tipo_usuario agregado exitosamente' as resultado;