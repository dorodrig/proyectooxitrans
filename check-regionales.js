import mysql from 'mysql2/promise';

async function checkRegionalesTable() {
  try {
    console.log('🔍 Verificando estructura de tabla regionales...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'user2025+',
      database: 'control_acceso_oxitrans'
    });

    // Verificar estructura de tabla regionales
    const [columns] = await connection.execute('DESCRIBE regionales');
    console.log('📋 Columnas de tabla regionales:');
    console.log(columns.map(col => `- ${col.Field} (${col.Type})`).join('\n'));

    // Verificar si hay datos
    const [data] = await connection.execute('SELECT * FROM regionales LIMIT 3');
    console.log('\n📊 Datos de ejemplo:');
    console.log(data);

    await connection.end();
    console.log('\n✅ Verificación completa');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRegionalesTable();