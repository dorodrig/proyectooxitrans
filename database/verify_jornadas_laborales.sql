-- ====================================
-- SCRIPT DE VERIFICACIÓN Y DATOS DE PRUEBA
-- Jornadas Laborales - OXITRANS S.A.S
-- ====================================

-- Usar la base de datos
USE control_acceso_oxitrans;

-- ====================================
-- 1. VERIFICAR QUE LA TABLA EXISTE
-- ====================================
SHOW TABLES LIKE 'jornadas_laborales';

-- ====================================
-- 2. MOSTRAR ESTRUCTURA DE LA TABLA
-- ====================================
DESCRIBE jornadas_laborales;

-- ====================================
-- 3. VERIFICAR ÍNDICES
-- ====================================
SHOW INDEX FROM jornadas_laborales;

-- ====================================
-- 4. VERIFICAR TRIGGERS
-- ====================================
SHOW TRIGGERS LIKE 'jornadas_laborales';

-- ====================================
-- 5. CONSULTA DE PRUEBA (debe estar vacía)
-- ====================================
SELECT COUNT(*) as total_jornadas FROM jornadas_laborales;

-- ====================================
-- 6. VERIFICAR FOREIGN KEYS
-- ====================================
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'jornadas_laborales' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ====================================
-- 7. OPCIONAL: DATOS DE PRUEBA
-- ====================================
-- Descomentar las siguientes líneas si quieres insertar datos de prueba
-- (Necesitarás reemplazar el usuario_id por un ID válido de tu tabla usuarios)

/*
-- Ejemplo de jornada de prueba
INSERT INTO jornadas_laborales (
    usuario_id, 
    fecha, 
    entrada,
    latitud_entrada,
    longitud_entrada,
    precision_entrada,
    observaciones_entrada
) VALUES (
    1, -- Cambiar por un ID de usuario válido
    CURDATE(),
    NOW(),
    4.651234, -- Coordenadas de ejemplo (Medellín)
    -74.123456,
    10.5,
    'Entrada registrada desde app móvil'
);
*/

SELECT 'Verificación completada. Revisa los resultados anteriores.' AS mensaje;