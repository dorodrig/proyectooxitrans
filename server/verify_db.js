const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando configuración de base de datos...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    
    // Crear conexión
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'control_acceso_oxitrans'
    });
    
    console.log('✅ Conexión a base de datos exitosa');
    
    // Verificar si existen las tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas encontradas:', tables.length);
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    // Verificar usuario admin
    const [users] = await connection.execute(
      'SELECT id, nombre, apellido, email, rol, estado FROM usuarios WHERE email = ?',
      ['admin@oxitrans.com']
    );
    
    console.log('👤 Usuario admin encontrado:', users.length > 0 ? 'SÍ' : 'NO');
    if (users.length > 0) {
      console.log('   Datos:', users[0]);
    }
    
    // Verificar hash de contraseña
    const [userWithPassword] = await connection.execute(
      'SELECT password_hash FROM usuarios WHERE email = ?',
      ['admin@oxitrans.com']
    );
    
    if (userWithPassword.length > 0) {
      console.log('🔐 Hash de contraseña existe:', userWithPassword[0].password_hash ? 'SÍ' : 'NO');
      console.log('   Hash:', userWithPassword[0].password_hash?.substring(0, 20) + '...');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyDatabase();
