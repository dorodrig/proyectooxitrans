const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertExampleData() {
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

    console.log('📝 Insertando datos de ejemplo...');
    
    const insertSQL = `
      INSERT IGNORE INTO jornadas_config (hora_entrada, tiempo_trabajo_dia, fin_jornada_laboral, usuario_id, activa)  
      VALUES 
      ('07:00:00', 8.00, '16:00:00', 1, TRUE),
      ('08:00:00', 8.00, '17:00:00', 2, TRUE),
      ('06:30:00', 8.50, '16:00:00', 3, TRUE),
      ('07:30:00', 8.00, '16:30:00', 4, TRUE),
      ('08:30:00', 8.00, '17:30:00', 5, TRUE)
    `;

    const [result] = await connection.execute(insertSQL);
    console.log('✅ Datos insertados. Afectados:', result.affectedRows);
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM jornadas_config');
    console.log(`📊 Total registros: ${rows[0].count}`);
    
    // Mostrar algunos datos
    const [sample] = await connection.execute('SELECT * FROM jornadas_config LIMIT 3');
    console.log('📋 Datos de ejemplo:', sample);
    
    await connection.end();
    console.log('🔚 Todo completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

insertExampleData();