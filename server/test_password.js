const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testPassword() {
  try {
    // Obtener el hash de la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'control_acceso_oxitrans'
    });
    
    const [users] = await connection.execute(
      'SELECT password_hash FROM usuarios WHERE email = ?',
      ['admin@oxitrans.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    const storedHash = users[0].password_hash;
    console.log('🔐 Hash almacenado:', storedHash);
    
    // Probar diferentes contraseñas
    const passwordsToTest = ['admin123', 'admin', '12345678', 'password'];
    
    for (const pwd of passwordsToTest) {
      const isValid = await bcrypt.compare(pwd, storedHash);
      console.log(`🔍 Contraseña "${pwd}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
    }
    
    // Verificar que el hash sea válido generando uno nuevo
    const testHash = await bcrypt.hash('admin123', 10);
    const testResult = await bcrypt.compare('admin123', testHash);
    console.log('🧪 Test de bcrypt (nuevo hash):', testResult ? '✅ OK' : '❌ ERROR');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPassword();
