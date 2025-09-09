-- ====================================
-- AGREGAR TABLA DE NOVEDADES
-- OXITRANS S.A.S - Control de Acceso
-- ====================================

USE control_acceso_oxitrans;

-- Verificar si la tabla ya existe
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = 'control_acceso_oxitrans'
    AND table_name = 'novedades'
);

-- Crear tabla de novedades si no existe
CREATE TABLE IF NOT EXISTS novedades (
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

-- Insertar datos de prueba
INSERT IGNORE INTO novedades (usuarioId, tipo, fechaInicio, fechaFin, horas) VALUES
(1, 'incapacidad', '2025-09-01', '2025-09-03', 24),
(1, 'permiso', '2025-09-05', '2025-09-05', 4),
(2, 'ausentismo', '2025-09-02', '2025-09-02', 8);

-- Verificar resultados
SELECT 'Tabla novedades creada exitosamente' AS resultado;
SELECT COUNT(*) as total_novedades FROM novedades;

-- Mostrar estructura de la tabla
DESCRIBE novedades;
