-- ====================================
-- 🔧 CORREGIR TABLA NOVEDADES - AGREGAR HORAS EXTRA
-- Actualización para incluir el tipo "horas_extra"
-- ====================================

-- Modificar el ENUM para incluir horas_extra
ALTER TABLE novedades 
MODIFY COLUMN tipo ENUM(
    'incapacidad', 
    'ausentismo', 
    'permiso', 
    'no_remunerado', 
    'lic_maternidad', 
    'lic_paternidad', 
    'dia_familia',
    'horas_extra'
) NOT NULL;

-- Agregar índice para horas extra (sintaxis MySQL compatible)
CREATE INDEX idx_horas_extra_usuario ON novedades (usuarioId, tipo, fechaInicio);

-- Insertar algunos registros de prueba de horas extra
INSERT IGNORE INTO novedades (usuarioId, tipo, fechaInicio, fechaFin, horas) VALUES
(20, 'horas_extra', '2025-10-02', '2025-10-02', 3),
(20, 'horas_extra', '2025-10-03', '2025-10-03', 2),
(20, 'horas_extra', '2025-10-04', '2025-10-04', 4),
(20, 'horas_extra', '2025-10-06', '2025-10-06', 2);

-- Verificar los cambios
SELECT 'Tabla novedades actualizada para incluir horas extra' AS resultado;

-- Mostrar las horas extra registradas
SELECT 
    n.id,
    u.nombre,
    u.apellido,
    n.tipo,
    n.fechaInicio,
    n.fechaFin,
    n.horas,
    n.created_at
FROM novedades n
JOIN usuarios u ON n.usuarioId = u.id
WHERE n.tipo = 'horas_extra'
ORDER BY n.fechaInicio DESC;

-- Verificar estructura actualizada
SHOW COLUMNS FROM novedades WHERE Field = 'tipo';