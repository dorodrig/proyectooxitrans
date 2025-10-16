import mysql from 'mysql2/promise';

async function analizarEstructuraCompleta() {
  try {
    console.log('🔍 ANÁLISIS COMPLETO DE ESTRUCTURA DE BASE DE DATOS');
    console.log('='.repeat(60));
    
    const connection = await mysql.createConnection({
      host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
      user: 'admin',
      password: 'oxitrans06092025*',
      database: 'control_acceso_oxitrans'
    });

    // ===================================
    // 1. TABLA USUARIOS
    // ===================================
    console.log('\n📋 1. TABLA USUARIOS');
    console.log('-'.repeat(40));
    
    const [usuariosColumns] = await connection.execute('DESCRIBE usuarios');
    console.log('📊 Estructura:');
    usuariosColumns.forEach(col => {
      console.log(`  - ${col.Field.padEnd(20)} | ${col.Type.padEnd(20)} | ${col.Null.padEnd(5)} | ${col.Key.padEnd(5)} | Default: ${col.Default || 'NULL'}`);
    });

    const [usuariosCount] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    console.log(`📈 Total registros: ${usuariosCount[0].total}`);

    const [usuariosSample] = await connection.execute('SELECT * FROM usuarios LIMIT 3');
    console.log('📝 Ejemplos:');
    usuariosSample.forEach((usuario, index) => {
      console.log(`  Ejemplo ${index + 1}: ${usuario.nombre} ${usuario.apellido} (${usuario.documento}) - ${usuario.rol}`);
    });

    // ===================================
    // 2. TABLA JORNADAS_LABORALES  
    // ===================================
    console.log('\n📋 2. TABLA JORNADAS_LABORALES');
    console.log('-'.repeat(40));
    
    const [jornadasColumns] = await connection.execute('DESCRIBE jornadas_laborales');
    console.log('📊 Estructura:');
    jornadasColumns.forEach(col => {
      console.log(`  - ${col.Field.padEnd(20)} | ${col.Type.padEnd(20)} | ${col.Null.padEnd(5)} | ${col.Key.padEnd(5)} | Default: ${col.Default || 'NULL'}`);
    });

    const [jornadasCount] = await connection.execute('SELECT COUNT(*) as total FROM jornadas_laborales');
    console.log(`📈 Total registros: ${jornadasCount[0].total}`);

    const [jornadasSample] = await connection.execute('SELECT * FROM jornadas_laborales LIMIT 3');
    console.log('📝 Ejemplos:');
    jornadasSample.forEach((jornada, index) => {
      console.log(`  Ejemplo ${index + 1}: Usuario ${jornada.usuario_id} - Fecha: ${jornada.fecha} - Entrada: ${jornada.entrada || 'NULL'}`);
    });

    // ===================================
    // 3. TABLA REGIONALES
    // ===================================
    console.log('\n📋 3. TABLA REGIONALES');
    console.log('-'.repeat(40));
    
    const [regionalesColumns] = await connection.execute('DESCRIBE regionales');
    console.log('📊 Estructura:');
    regionalesColumns.forEach(col => {
      console.log(`  - ${col.Field.padEnd(20)} | ${col.Type.padEnd(20)} | ${col.Null.padEnd(5)} | ${col.Key.padEnd(5)} | Default: ${col.Default || 'NULL'}`);
    });

    const [regionalesCount] = await connection.execute('SELECT COUNT(*) as total FROM regionales');
    console.log(`📈 Total registros: ${regionalesCount[0].total}`);

    const [regionalesSample] = await connection.execute('SELECT * FROM regionales LIMIT 5');
    console.log('📝 Ejemplos:');
    regionalesSample.forEach((regional, index) => {
      console.log(`  Ejemplo ${index + 1}: ${regional.nombre} - ${regional.descripcion} (Lat: ${regional.latitud}, Lng: ${regional.longitud})`);
    });

    // ===================================
    // 4. RELACIONES ENTRE TABLAS
    // ===================================
    console.log('\n🔗 4. ANÁLISIS DE RELACIONES');
    console.log('-'.repeat(40));

    // Verificar relación usuarios -> regionales
    const [usuarioRegional] = await connection.execute(`
      SELECT u.nombre, u.apellido, u.regional_id, r.nombre as regional_nombre
      FROM usuarios u 
      LEFT JOIN regionales r ON u.regional_id = r.id 
      WHERE u.regional_id IS NOT NULL 
      LIMIT 3
    `);
    console.log('🔗 Relación usuarios -> regionales:');
    usuarioRegional.forEach(rel => {
      console.log(`  ${rel.nombre} ${rel.apellido} -> Regional: ${rel.regional_nombre} (ID: ${rel.regional_id})`);
    });

    // Verificar relación jornadas_laborales -> usuarios
    const [jornadaUsuario] = await connection.execute(`
      SELECT j.fecha, j.entrada, j.usuario_id, u.nombre, u.apellido
      FROM jornadas_laborales j 
      LEFT JOIN usuarios u ON j.usuario_id = u.id 
      WHERE j.usuario_id IS NOT NULL 
      LIMIT 3
    `);
    console.log('🔗 Relación jornadas_laborales -> usuarios:');
    jornadaUsuario.forEach(rel => {
      console.log(`  ${rel.fecha} ${rel.entrada || 'Sin entrada'} -> Usuario: ${rel.nombre} ${rel.apellido} (ID: ${rel.usuario_id})`);
    });

    // ===================================
    // 5. CAMPOS IMPORTANTES PARA MÓDULO CONSULTAS
    // ===================================
    console.log('\n🎯 5. CAMPOS CLAVE PARA MÓDULO CONSULTAS');
    console.log('-'.repeat(40));
    
    console.log('📋 USUARIOS - Campos principales:');
    console.log('  - id, nombre, apellido, documento, email, telefono');
    console.log('  - rol, estado, departamento, cargo');  
    console.log('  - regional_id (FK -> regionales), created_at, updated_at');
    
    console.log('\n📋 JORNADAS_LABORALES - Campos principales:');
    console.log('  - id, usuario_id (FK -> usuarios), fecha');
    console.log('  - entrada, latitud_entrada, longitud_entrada, precision_entrada');
    console.log('  - salida, descanso_manana_inicio, descanso_manana_fin, etc.');
    
    console.log('\n📋 REGIONALES - Campos principales:');
    console.log('  - id, nombre, descripcion');
    console.log('  - latitud, longitud, created_at, updated_at');

    await connection.end();
    console.log('\n✅ ANÁLISIS COMPLETO FINALIZADO');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error en análisis:', error.message);
  }
}

analizarEstructuraCompleta();