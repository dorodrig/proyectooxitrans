const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePassword() {
  try {
    // Generar el hash correcto para "admin123"
    const correctHash = await bcrypt.hash('admin123', 10);
    console.log('🔐 Nuevo hash generado para "admin123":', correctHash);
    
    // Verificar que el hash funciona
    const isValid = await bcrypt.compare('admin123', correctHash);
    console.log('✅ Verificación del nuevo hash:', isValid ? 'VÁLIDO' : 'INVÁLIDO');
    
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'control_acceso_oxitrans'
    });
    
    // Actualizar el hash en la base de datos
    const [result] = await connection.execute(
      'UPDATE usuarios SET password_hash = ? WHERE email = ?',
      [correctHash, 'admin@oxitrans.com']
    );
    
    console.log('📝 Resultado de actualización:', result.affectedRows, 'fila(s) actualizada(s)');
    
    // Verificar que la actualización fue exitosa
    const [users] = await connection.execute(
      'SELECT password_hash FROM usuarios WHERE email = ?',
      ['admin@oxitrans.com']
    );
    
    if (users.length > 0) {
      const verifyUpdate = await bcrypt.compare('admin123', users[0].password_hash);
      console.log('🎉 Verificación final:', verifyUpdate ? '✅ EXITOSA' : '❌ FALLÓ');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updatePassword();
