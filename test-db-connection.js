import mysql from 'mysql2/promise';

async function testBackendDB() {
  try {
    console.log('🔍 Probando conexión a base de datos...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'user2025+',
      database: 'control_acceso_oxitrans'
    });

    console.log('✅ Conexión exitosa');

    // Verificar estructura de tabla usuarios
    const [columns] = await connection.execute('DESCRIBE usuarios');
    console.log('📋 Columnas de tabla usuarios:');
    console.log(columns.map(col => `- ${col.Field} (${col.Type})`).join('\n'));

    // Verificar si hay usuarios
    const [users] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    console.log(`\n👥 Total usuarios: ${users[0].total}`);

    // Probar búsqueda simple
    const [searchResult] = await connection.execute(`
      SELECT u.id, u.nombre, u.apellido, u.documento, u.created_at 
      FROM usuarios u 
      WHERE u.estado = 'activo' 
      LIMIT 5
    `);
    
    console.log('\n🔍 Primeros 5 usuarios activos:');
    searchResult.forEach(user => {
      console.log(`- ${user.nombre} ${user.apellido} (${user.documento})`);
    });

    await connection.end();
    console.log('\n✅ Prueba completa exitosa');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`Código de error: ${error.code}`);
    }
  }
}

testBackendDB();