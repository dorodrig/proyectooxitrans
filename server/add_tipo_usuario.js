const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTipoUsuarioField() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexión establecida');

    // Verificar si el campo ya existe
    console.log('🔍 Verificando si el campo tipo_usuario ya existe...');
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'tipo_usuario'
    `, [process.env.DB_NAME]);

    if (columns.length > 0) {
      console.log('✅ El campo tipo_usuario ya existe');
      return;
    }

    console.log('➕ Agregando campo tipo_usuario...');
    
    await connection.execute(`
      ALTER TABLE usuarios 
      ADD COLUMN tipo_usuario ENUM('planta', 'visita') DEFAULT 'planta' 
      AFTER regional_id
    `);

    console.log('🔧 Agregando índice...');
    
    await connection.execute(`
      ALTER TABLE usuarios 
      ADD INDEX idx_tipo_usuario (tipo_usuario)
    `);

    console.log('✅ Campo tipo_usuario agregado exitosamente');

    // Verificar la estructura
    console.log('🔍 Verificando estructura final...');
    const [structure] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios' 
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);

    console.log('📋 Estructura de tabla usuarios:');
    structure.forEach(col => {
      if (col.COLUMN_NAME === 'regional_id' || col.COLUMN_NAME === 'tipo_usuario') {
        console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} (Default: ${col.COLUMN_DEFAULT})`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

addTipoUsuarioField();