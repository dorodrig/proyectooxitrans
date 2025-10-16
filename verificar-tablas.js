import mysql from 'mysql2/promise';

async function verificarTablasJornadas() {
  try {
    console.log('🔍 VERIFICANDO TABLAS DE JORNADAS EXISTENTES');
    console.log('='.repeat(50));
    
    const connection = await mysql.createConnection({
          host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
          user: 'admin',
          password: 'oxitrans06092025*',
          database: 'control_acceso_oxitrans'
    });

    // Listar todas las tablas que contengan "jornada"
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%jornada%'
    `);
    
    console.log('📋 Tablas relacionadas con jornadas:');
    if (tables.length === 0) {
      console.log('  ❌ No se encontraron tablas con "jornada" en el nombre');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  ✅ ${tableName}`);
      });
    }

    // Listar todas las tablas para buscar nombres similares
    console.log('\n📋 TODAS LAS TABLAS EN LA BASE DE DATOS:');
    const [allTables] = await connection.execute('SHOW TABLES');
    allTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Buscar tablas que puedan contener información de jornadas/asistencia
    console.log('\n🔍 Buscando tablas relacionadas con asistencia/jornadas:');
    const possibleTables = ['registros_acceso', 'asistencia', 'marcaciones', 'horarios', 'turnos'];
    
    for (const tableName of possibleTables) {
      try {
        const [exists] = await connection.execute(`SHOW TABLES LIKE '${tableName}'`);
        if (exists.length > 0) {
          console.log(`  ✅ Encontrada: ${tableName}`);
          const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
          console.log(`    Columnas: ${columns.map(col => col.Field).join(', ')}`);
        }
      } catch (e) {
        // Tabla no existe, continuar
      }
    }

    await connection.end();
    console.log('\n✅ Verificación completa');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarTablasJornadas();