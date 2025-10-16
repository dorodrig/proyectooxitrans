import mysql from 'mysql2/promise';

async function testColaboradoresQuery() {
  try {
    console.log('🔍 Probando query de colaboradores corregida...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'user2025+',
      database: 'control_acceso_oxitrans'
    });

    const termino = '1022442541';
    const searchTerm = `%${termino}%`;

    // Probar la query corregida
    const searchQuery = `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.documento,
        u.email,
        u.telefono,
        u.rol,
        u.estado,
        u.created_at as fecha_creacion,
        u.regional_id,
        r.nombre as regional_nombre,
        u.departamento,
        u.cargo as cargo_nombre,
        NULL as cargo_id
      FROM usuarios u
      LEFT JOIN regionales r ON u.regional_id = r.id
      WHERE (u.documento LIKE ? OR u.apellido LIKE ?)
      AND u.estado = 'activo'
      ORDER BY u.apellido, u.nombre
      LIMIT 10 OFFSET 0
    `;

    console.log('🔎 Ejecutando query...');
    const [results] = await connection.execute(searchQuery, [searchTerm, searchTerm]);
    
    console.log(`✅ Query exitosa! Encontrados: ${results.length} resultado(s)`);
    if (results.length > 0) {
      console.log('📊 Primer resultado:');
      console.log(JSON.stringify(results[0], null, 2));
    } else {
      console.log('⚠️ No se encontraron resultados para el término:', termino);
    }

    await connection.end();
    console.log('✅ Prueba completa');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testColaboradoresQuery();