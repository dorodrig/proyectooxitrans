-- ================================================
-- SCRIPT DE CORRECCIÓN - Crear tabla jornadas_config
-- ================================================

-- Crear tabla jornadas_config si no existe
CREATE TABLE IF NOT EXISTS `jornadas_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hora_entrada` TIME NOT NULL COMMENT 'Hora de entrada del personal (formato HH:MM)',
  `tiempo_trabajo_dia` DECIMAL(4,2) NOT NULL COMMENT 'Tiempo de trabajo en horas por día (ej: 8.00, 8.50)',
  `fin_jornada_laboral` TIME NOT NULL COMMENT 'Hora calculada de fin de jornada (incluye almuerzo)',
  `usuario_id` INT NOT NULL COMMENT 'ID del usuario al que pertenece esta configuración (-1 para global)',
  `activa` BOOLEAN DEFAULT TRUE COMMENT 'Indica si esta configuración está activa',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  
  -- Índices para optimización
  INDEX `idx_usuario_id` (`usuario_id`),
  INDEX `idx_activa` (`activa`),
  INDEX `idx_usuario_activa` (`usuario_id`, `activa`),
  INDEX `idx_fecha_creacion` (`fecha_creacion`),
    
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
-- CONFIRMACIÓN
-- ================================================
SELECT 'Tabla jornadas_config creada exitosamente' as resultado;