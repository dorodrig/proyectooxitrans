-- ====================================
-- VERIFICACIÓN Y CREACIÓN DE TABLA PASSWORD_RESET_TOKENS
-- Para solucionar problemas de reset de contraseña
-- ====================================

USE control_acceso_oxitrans;

-- Verificar si la tabla existe
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'control_acceso_oxitrans' 
AND TABLE_NAME = 'password_reset_tokens';

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_usado (usado)
);

-- Verificar que se creó correctamente
DESCRIBE password_reset_tokens;

-- Verificar datos de prueba
SELECT COUNT(*) as total_tokens FROM password_reset_tokens;

SELECT 'Tabla password_reset_tokens verificada/creada exitosamente' as status;