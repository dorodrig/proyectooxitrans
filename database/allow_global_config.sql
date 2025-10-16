-- ================================================
-- SCRIPT PARA PERMITIR CONFIGURACIÓN GLOBAL
-- Modificar tabla jornadas_config para permitir usuario_id NULL
-- ================================================

USE control_acceso_oxitrans;

-- 1. Primero quitar la restricción de clave foránea
ALTER TABLE `jornadas_config` 
DROP FOREIGN KEY `fk_jornadas_config_usuario`;

-- 2. Modificar la columna usuario_id para permitir NULL
ALTER TABLE `jornadas_config` 
MODIFY COLUMN `usuario_id` INT NULL COMMENT 'ID del usuario (NULL para configuración global empresarial)';

-- 3. Recrear la clave foránea permitiendo NULL
ALTER TABLE `jornadas_config` 
ADD CONSTRAINT `fk_jornadas_config_usuario` 
  FOREIGN KEY (`usuario_id`) 
  REFERENCES `usuarios` (`id`) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- 4. Crear índice específico para configuración global
CREATE INDEX `idx_configuracion_global` ON `jornadas_config` (`usuario_id`) 
WHERE `usuario_id` IS NULL;

-- 5. Actualizar el trigger para manejar configuración global
DELIMITER $$

DROP TRIGGER IF EXISTS `tr_jornadas_config_unica_activa`$$

CREATE TRIGGER `tr_jornadas_config_unica_activa` 
BEFORE INSERT ON `jornadas_config`
FOR EACH ROW
BEGIN
  -- Para configuración específica de usuario (NO global)
  IF NEW.usuario_id IS NOT NULL THEN
    IF NEW.activa = 1 THEN
      UPDATE `jornadas_config` 
      SET `activa` = 0, `fecha_actualizacion` = NOW() 
      WHERE `usuario_id` = NEW.usuario_id AND `activa` = 1 AND `id` != COALESCE(NEW.id, 0);
    END IF;
  -- Para configuración GLOBAL (usuario_id IS NULL)
  ELSE
    IF NEW.activa = 1 THEN
      UPDATE `jornadas_config` 
      SET `activa` = 0, `fecha_actualizacion` = NOW() 
      WHERE `usuario_id` IS NULL AND `activa` = 1 AND `id` != COALESCE(NEW.id, 0);
    END IF;
  END IF;
END$$

DELIMITER ;

-- 6. Verificar los cambios
SELECT 
  COLUMN_NAME,
  IS_NULLABLE,
  DATA_TYPE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'jornadas_config' 
  AND TABLE_SCHEMA = 'control_acceso_oxitrans'
  AND COLUMN_NAME = 'usuario_id';

-- 7. Mostrar estructura actualizada
DESCRIBE jornadas_config;

-- 8. Mensaje de confirmación
SELECT 'TABLA MODIFICADA: jornadas_config ahora permite configuración global (usuario_id NULL)' as RESULTADO;