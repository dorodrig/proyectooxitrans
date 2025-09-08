-- ====================================
-- SCRIPT DE ACTUALIZACIÓN DE BASE DE DATOS
-- AGREGAR TABLA REGIONALES Y RELACIÓN
-- ====================================

USE control_acceso_oxitrans;

-- ====================================
-- 1. CREAR TABLA REGIONALES
-- ====================================
CREATE TABLE IF NOT EXISTS regionales (
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
-- 2. AGREGAR COLUMNA REGIONAL_ID A USUARIOS
-- ====================================
-- Verificar si la columna ya existe
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'control_acceso_oxitrans'
    AND TABLE_NAME = 'usuarios'
    AND COLUMN_NAME = 'regional_id'
);

-- Agregar columna solo si no existe
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE usuarios ADD COLUMN regional_id INT, ADD INDEX idx_regional_id (regional_id)',
    'SELECT "La columna regional_id ya existe" as mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ====================================
-- 3. AGREGAR FOREIGN KEY (si no existe)
-- ====================================
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = 'control_acceso_oxitrans'
    AND TABLE_NAME = 'usuarios'
    AND CONSTRAINT_NAME = 'usuarios_ibfk_regional'
);

SET @sql_fk = IF(@fk_exists = 0,
    'ALTER TABLE usuarios ADD CONSTRAINT usuarios_ibfk_regional FOREIGN KEY (regional_id) REFERENCES regionales(id) ON DELETE SET NULL',
    'SELECT "La foreign key ya existe" as mensaje'
);

PREPARE stmt FROM @sql_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ====================================
-- 4. INSERTAR DATOS INICIALES DE REGIONALES
-- ====================================
INSERT IGNORE INTO regionales (nombre, descripcion, latitud, longitud) VALUES
('bogotá', 'Regional principal en Bogotá D.C.', 4.60971, -74.08175),
('medellín', 'Regional Antioquia - Medellín', 6.25184, -75.56359),
('cali', 'Regional Valle del Cauca - Cali', 3.43722, -76.5225),
('barranquilla', 'Regional Atlántico - Barranquilla', 10.96854, -74.78132),
('cartagena', 'Regional Bolívar - Cartagena', 10.39972, -75.51444),
('bucaramanga', 'Regional Santander - Bucaramanga', 7.11392, -73.1198);

-- ====================================
-- 5. VERIFICACIÓN
-- ====================================
SELECT 'Verificando tabla regionales...' as paso;
SELECT COUNT(*) as total_regionales FROM regionales;

SELECT 'Verificando columna regional_id en usuarios...' as paso;
DESCRIBE usuarios;

SELECT 'Regionales disponibles:' as paso;
SELECT id, nombre, descripcion FROM regionales;

SELECT '¡Actualización completada!' as resultado;
