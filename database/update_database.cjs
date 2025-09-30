const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    const connection = await mysql.createConnection({
      host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'oxitrans06092025*',
      database: 'control_acceso_oxitrans'
    });

    console.log('✅ Conexión establecida');

    // Verificar si las columnas ya existen
    console.log('🔍 Verificando si las columnas ya existen...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'control_acceso_oxitrans' 
      AND TABLE_NAME = 'usuarios' 
      AND COLUMN_NAME IN ('ubicacion_trabajo_latitud', 'ubicacion_trabajo_longitud')
    `);

    if (columns.length > 0) {
      console.log('⚠️  Las columnas ya existen. Saltando actualización.');
    } else {
      console.log('📝 Agregando nuevas columnas...');
      
      // Agregar las columnas
      await connection.execute(`
        ALTER TABLE usuarios 
        ADD COLUMN ubicacion_trabajo_latitud DECIMAL(10, 8),
        ADD COLUMN ubicacion_trabajo_longitud DECIMAL(11, 8),
        ADD COLUMN nombre_ubicacion_trabajo VARCHAR(200),
        ADD COLUMN descripcion_ubicacion_trabajo TEXT,
        ADD COLUMN tolerancia_ubicacion_metros INT DEFAULT 50
      `);

      console.log('📚 Agregando índices...');
      
      // Agregar índices
      await connection.execute(`
        ALTER TABLE usuarios 
        ADD INDEX idx_ubicacion_lat (ubicacion_trabajo_latitud),
        ADD INDEX idx_ubicacion_lng (ubicacion_trabajo_longitud)
      `);

      console.log('✅ Actualización completada exitosamente!');
    }

    await connection.end();
    console.log('🔚 Conexión cerrada');

  } catch (error) {
    console.error('❌ Error actualizando base de datos:', error.message);
    process.exit(1);
  }
}

updateDatabase();