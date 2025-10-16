-- ================================================
-- Script para Tabla de Configuración de Jornadas Laborales
-- ================================================

-- Crear tabla jornadas_config si no existe
CREATE TABLE IF NOT EXISTS `jornadas_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hora_entrada` TIME NOT NULL COMMENT 'Hora de entrada del personal (formato HH:MM)',
  `tiempo_trabajo_dia` DECIMAL(4,2) NOT NULL COMMENT 'Tiempo de trabajo en horas por día (ej: 8.00, 8.50)',
  `fin_jornada_laboral` TIME NOT NULL COMMENT 'Hora calculada de fin de jornada (incluye almuerzo)',
  `usuario_id` INT NOT NULL COMMENT 'ID del usuario al que pertenece esta configuración',
  `activa` BOOLEAN DEFAULT TRUE COMMENT 'Indica si esta configuración está activa',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  
  -- Índices para optimización
  INDEX `idx_usuario_id` (`usuario_id`),
  INDEX `idx_activa` (`activa`),
  INDEX `idx_usuario_activa` (`usuario_id`, `activa`),
  INDEX `idx_fecha_creacion` (`fecha_creacion`),
  
  -- Clave foránea hacia tabla usuarios
  CONSTRAINT `fk_jornadas_config_usuario` 
    FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  -- Restricciones de validación
  CONSTRAINT `chk_tiempo_trabajo_positivo` 
    CHECK (`tiempo_trabajo_dia` > 0),
  CONSTRAINT `chk_tiempo_trabajo_maximo` 
    CHECK (`tiempo_trabajo_dia` <= 12),
  CONSTRAINT `chk_hora_entrada_valida` 
    CHECK (`hora_entrada` >= '00:00:00' AND `hora_entrada` <= '23:59:59'),
  CONSTRAINT `chk_fin_jornada_valida` 
    CHECK (`fin_jornada_laboral` >= '00:00:00' AND `fin_jornada_laboral` <= '23:59:59')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuraciones de jornadas laborales por usuario';

-- ================================================
-- Trigger para garantizar solo una configuración activa por usuario
-- ================================================
DELIMITER //

CREATE TRIGGER `tr_jornadas_config_unica_activa` 
BEFORE INSERT ON `jornadas_config`
FOR EACH ROW
BEGIN
  -- Si se intenta insertar una configuración activa
  IF NEW.activa = TRUE THEN
    -- Desactivar cualquier configuración activa existente para este usuario
    UPDATE `jornadas_config` 
    SET `activa` = FALSE, `fecha_actualizacion` = CURRENT_TIMESTAMP
    WHERE `usuario_id` = NEW.usuario_id AND `activa` = TRUE;
  END IF;
END//

DELIMITER ;

-- ================================================
-- Trigger para validar datos antes de insertar/actualizar
-- ================================================
DELIMITER //

CREATE TRIGGER `tr_jornadas_config_validar_datos` 
BEFORE INSERT ON `jornadas_config`
FOR EACH ROW
BEGIN
  -- Validar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM `usuarios` WHERE `id` = NEW.usuario_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario especificado no existe';
  END IF;
  
  -- Validar tiempo de trabajo
  IF NEW.tiempo_trabajo_dia <= 0 OR NEW.tiempo_trabajo_dia > 12 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El tiempo de trabajo debe estar entre 0.5 y 12 horas';
  END IF;
  
  -- Validar que la hora de fin sea posterior a la hora de entrada
  -- (considerando el tiempo de trabajo + almuerzo)
  SET @hora_entrada_minutos = TIME_TO_SEC(NEW.hora_entrada) / 60;
  SET @tiempo_trabajo_minutos = NEW.tiempo_trabajo_dia * 60;
  SET @tiempo_almuerzo_minutos = 60; -- 1 hora de almuerzo
  SET @hora_fin_calculada_minutos = @hora_entrada_minutos + @tiempo_trabajo_minutos + @tiempo_almuerzo_minutos;
  
  -- Si se pasa de medianoche, ajustar
  IF @hora_fin_calculada_minutos >= 1440 THEN
    SET @hora_fin_calculada_minutos = @hora_fin_calculada_minutos - 1440;
  END IF;
  
  SET @hora_fin_calculada = SEC_TO_TIME(@hora_fin_calculada_minutos * 60);
  
  -- Actualizar automáticamente la hora de fin calculada
  SET NEW.fin_jornada_laboral = @hora_fin_calculada;
END//

DELIMITER ;

-- ================================================
-- Trigger similar para actualizaciones
-- ================================================
DELIMITER //

CREATE TRIGGER `tr_jornadas_config_validar_update` 
BEFORE UPDATE ON `jornadas_config`
FOR EACH ROW
BEGIN
  -- Si se está activando una configuración
  IF NEW.activa = TRUE AND OLD.activa = FALSE THEN
    -- Desactivar cualquier otra configuración activa para este usuario
    UPDATE `jornadas_config` 
    SET `activa` = FALSE, `fecha_actualizacion` = CURRENT_TIMESTAMP
    WHERE `usuario_id` = NEW.usuario_id AND `activa` = TRUE AND `id` != NEW.id;
  END IF;
  
  -- Validar tiempo de trabajo si cambió
  IF NEW.tiempo_trabajo_dia != OLD.tiempo_trabajo_dia THEN
    IF NEW.tiempo_trabajo_dia <= 0 OR NEW.tiempo_trabajo_dia > 12 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El tiempo de trabajo debe estar entre 0.5 y 12 horas';
    END IF;
  END IF;
  
  -- Recalcular hora de fin si cambió entrada o tiempo de trabajo
  IF NEW.hora_entrada != OLD.hora_entrada OR NEW.tiempo_trabajo_dia != OLD.tiempo_trabajo_dia THEN
    SET @hora_entrada_minutos = TIME_TO_SEC(NEW.hora_entrada) / 60;
    SET @tiempo_trabajo_minutos = NEW.tiempo_trabajo_dia * 60;
    SET @tiempo_almuerzo_minutos = 60; -- 1 hora de almuerzo
    SET @hora_fin_calculada_minutos = @hora_entrada_minutos + @tiempo_trabajo_minutos + @tiempo_almuerzo_minutos;
    
    -- Si se pasa de medianoche, ajustar
    IF @hora_fin_calculada_minutos >= 1440 THEN
      SET @hora_fin_calculada_minutos = @hora_fin_calculada_minutos - 1440;
    END IF;
    
    SET @hora_fin_calculada = SEC_TO_TIME(@hora_fin_calculada_minutos * 60);
    SET NEW.fin_jornada_laboral = @hora_fin_calculada;
  END IF;
END//

DELIMITER ;

-- ================================================
-- Vista para consultas frecuentes con información del usuario
-- ================================================
CREATE OR REPLACE VIEW `v_jornadas_config_detallada` AS
SELECT 
  jc.id,
  jc.hora_entrada,
  jc.tiempo_trabajo_dia,
  jc.fin_jornada_laboral,
  jc.usuario_id,
  jc.activa,
  jc.fecha_creacion,
  jc.fecha_actualizacion,
  u.nombre as usuario_nombre,
  u.apellido as usuario_apellido,
  u.email as usuario_email,
  u.tipo_usuario,
  -- Campos calculados
  CASE 
    WHEN jc.tiempo_trabajo_dia > 8 THEN jc.tiempo_trabajo_dia - 8
    ELSE 0 
  END as horas_extras_diarias,
  TIMEDIFF(jc.fin_jornada_laboral, jc.hora_entrada) as duracion_total_jornada,
  CASE 
    WHEN jc.activa = 1 THEN 'Activa'
    ELSE 'Inactiva' 
  END as estado_configuracion
FROM `jornadas_config` jc
LEFT JOIN `usuarios` u ON jc.usuario_id = u.id;

-- ================================================
-- Datos de ejemplo para pruebas (opcional)
-- ================================================

-- Insertar configuraciones de ejemplo solo si no existen usuarios con configuración
INSERT INTO `jornadas_config` (
  `hora_entrada`, 
  `tiempo_trabajo_dia`, 
  `fin_jornada_laboral`, 
  `usuario_id`, 
  `activa`
) 
SELECT '08:00:00', 8.00, '17:00:00', u.id, TRUE
FROM `usuarios` u 
WHERE u.tipo_usuario = 'empleado' 
AND NOT EXISTS (
  SELECT 1 FROM `jornadas_config` jc WHERE jc.usuario_id = u.id
)
LIMIT 3;

-- ================================================
-- Procedimiento almacenado para obtener estadísticas
-- ================================================
DELIMITER //

CREATE PROCEDURE `sp_estadisticas_jornadas`()
BEGIN
  -- Estadísticas generales
  SELECT 
    'Estadísticas Generales' as categoria,
    (SELECT COUNT(*) FROM jornadas_config) as total_configuraciones,
    (SELECT COUNT(*) FROM jornadas_config WHERE activa = 1) as configuraciones_activas,
    (SELECT ROUND(AVG(tiempo_trabajo_dia), 2) FROM jornadas_config WHERE activa = 1) as promedio_horas_trabajo,
    (SELECT COUNT(*) FROM jornadas_config WHERE activa = 1 AND tiempo_trabajo_dia > 8) as empleados_horas_extras;
  
  -- Distribución por horas de trabajo
  SELECT 
    'Distribución por Horas' as categoria,
    tiempo_trabajo_dia as horas_trabajo,
    COUNT(*) as cantidad_empleados,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM jornadas_config WHERE activa = 1)), 2) as porcentaje
  FROM jornadas_config 
  WHERE activa = 1 
  GROUP BY tiempo_trabajo_dia 
  ORDER BY tiempo_trabajo_dia;
  
  -- Horarios más comunes
  SELECT 
    'Horarios de Entrada Comunes' as categoria,
    hora_entrada,
    COUNT(*) as cantidad_empleados
  FROM jornadas_config 
  WHERE activa = 1 
  GROUP BY hora_entrada 
  ORDER BY cantidad_empleados DESC
  LIMIT 5;
END//

DELIMITER ;

-- ================================================
-- Índices adicionales para optimización
-- ================================================

-- Índice compuesto para consultas de administración
CREATE INDEX `idx_fecha_activa` ON `jornadas_config` (`fecha_creacion`, `activa`);

-- Índice para búsquedas por rango de horas
CREATE INDEX `idx_tiempo_trabajo` ON `jornadas_config` (`tiempo_trabajo_dia`);

-- Índice para horarios de entrada
CREATE INDEX `idx_hora_entrada` ON `jornadas_config` (`hora_entrada`);

-- ================================================
-- Comentarios finales
-- ================================================

/*
NOTAS DE IMPLEMENTACIÓN:

1. La tabla garantiza que cada usuario tenga máximo una configuración activa
2. Los triggers automáticamente calculan la hora de fin basada en entrada + trabajo + almuerzo
3. Se incluyen validaciones de negocio a nivel de base de datos
4. La vista facilita consultas con información del usuario
5. El procedimiento almacenado proporciona estadísticas útiles

CAMPOS PRINCIPALES:
- hora_entrada: Hora en que debe registrar entrada (TIME)
- tiempo_trabajo_dia: Horas netas de trabajo (DECIMAL 4,2)
- fin_jornada_laboral: Calculada automáticamente (entrada + trabajo + 1h almuerzo)
- usuario_id: Referencia al usuario (FK con CASCADE)
- activa: Solo una configuración activa por usuario

RESTRICCIONES:
- Tiempo de trabajo: 0.5 a 12 horas máximo
- Solo una configuración activa por usuario
- Integridad referencial con tabla usuarios

USO:
1. Ejecutar este script en la base de datos
2. Los triggers se encargan de mantener consistencia
3. Usar la vista v_jornadas_config_detallada para consultas complejas
4. Llamar al procedimiento sp_estadisticas_jornadas() para reportes
*/