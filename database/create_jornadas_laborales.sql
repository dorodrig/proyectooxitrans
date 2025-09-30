-- ====================================
-- SCRIPT PARA CREAR TABLA JORNADAS_LABORALES
-- OXITRANS S.A.S - Control de Acceso
-- ====================================

-- Usar la base de datos
USE control_acceso_oxitrans;

-- ====================================
-- TABLA DE JORNADAS LABORALES
-- ====================================
CREATE TABLE IF NOT EXISTS jornadas_laborales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    
    -- Marcación de entrada
    entrada TIMESTAMP NULL,
    latitud_entrada DECIMAL(10, 8) NULL,
    longitud_entrada DECIMAL(11, 8) NULL,
    precision_entrada DECIMAL(6, 2) NULL,
    observaciones_entrada TEXT NULL,
    
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
    latitud_salida DECIMAL(10, 8) NULL,
    longitud_salida DECIMAL(11, 8) NULL,
    precision_salida DECIMAL(6, 2) NULL,
    observaciones_salida TEXT NULL,
    
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
    
    -- Validaciones adicionales
    CONSTRAINT chk_horas_trabajadas CHECK (horas_trabajadas >= 0 AND horas_trabajadas <= 24),
    CONSTRAINT chk_entrada_salida CHECK (entrada IS NULL OR salida IS NULL OR salida >= entrada),
    CONSTRAINT chk_almuerzo_orden CHECK (almuerzo_inicio IS NULL OR almuerzo_fin IS NULL OR almuerzo_fin >= almuerzo_inicio),
    CONSTRAINT chk_descanso_manana_orden CHECK (descanso_manana_inicio IS NULL OR descanso_manana_fin IS NULL OR descanso_manana_fin >= descanso_manana_inicio),
    CONSTRAINT chk_descanso_tarde_orden CHECK (descanso_tarde_inicio IS NULL OR descanso_tarde_fin IS NULL OR descanso_tarde_fin >= descanso_tarde_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- TRIGGERS PARA CÁLCULO AUTOMÁTICO
-- ====================================

-- Trigger para calcular horas trabajadas antes de actualizar
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS calculate_worked_hours_before_update
    BEFORE UPDATE ON jornadas_laborales
    FOR EACH ROW
BEGIN
    DECLARE total_minutes INT DEFAULT 0;
    DECLARE almuerzo_minutes INT DEFAULT 0;
    DECLARE descanso_manana_minutes INT DEFAULT 0;
    DECLARE descanso_tarde_minutes INT DEFAULT 0;
    
    -- Solo calcular si hay entrada
    IF NEW.entrada IS NOT NULL THEN
        -- Calcular tiempo total desde entrada hasta salida (o ahora si no hay salida)
        SET total_minutes = TIMESTAMPDIFF(MINUTE, NEW.entrada, COALESCE(NEW.salida, NOW()));
        
        -- Restar tiempo de almuerzo
        IF NEW.almuerzo_inicio IS NOT NULL AND NEW.almuerzo_fin IS NOT NULL THEN
            SET almuerzo_minutes = GREATEST(0, TIMESTAMPDIFF(MINUTE, NEW.almuerzo_inicio, NEW.almuerzo_fin));
        ELSEIF NEW.almuerzo_inicio IS NOT NULL AND NEW.salida IS NOT NULL THEN
            -- Si comenzó almuerzo pero no terminó, restar desde inicio de almuerzo hasta salida
            SET almuerzo_minutes = GREATEST(0, TIMESTAMPDIFF(MINUTE, NEW.almuerzo_inicio, NEW.salida));
        END IF;
        
        -- Restar descansos
        IF NEW.descanso_manana_inicio IS NOT NULL AND NEW.descanso_manana_fin IS NOT NULL THEN
            SET descanso_manana_minutes = GREATEST(0, TIMESTAMPDIFF(MINUTE, NEW.descanso_manana_inicio, NEW.descanso_manana_fin));
        END IF;
        
        IF NEW.descanso_tarde_inicio IS NOT NULL AND NEW.descanso_tarde_fin IS NOT NULL THEN
            SET descanso_tarde_minutes = GREATEST(0, TIMESTAMPDIFF(MINUTE, NEW.descanso_tarde_inicio, NEW.descanso_tarde_fin));
        END IF;
        
        -- Calcular horas netas trabajadas
        SET NEW.horas_trabajadas = GREATEST(0, (total_minutes - almuerzo_minutes - descanso_manana_minutes - descanso_tarde_minutes) / 60.0);
    END IF;
    
    -- Actualizar timestamp
    SET NEW.updated_at = NOW();
END$$

DELIMITER ;

-- ====================================
-- CONFIRMACIÓN
-- ====================================
SELECT 'Tabla jornadas_laborales creada exitosamente' AS mensaje;

-- Mostrar estructura de la tabla creada
DESCRIBE jornadas_laborales;