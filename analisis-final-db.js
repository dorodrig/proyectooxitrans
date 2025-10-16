import mysql from 'mysql2/promise';

async function analisisCompletoDB() {
  try {
    console.log('🔍 ANÁLISIS COMPLETO DE BASE DE DATOS - OXITRANS');
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
    console.log('\n📋 1. TABLA USUARIOS (Colaboradores)');
    console.log('-'.repeat(50));
    
    const [usuariosColumns] = await connection.execute('DESCRIBE usuarios');
    console.log('📊 Estructura completa:');
    usuariosColumns.forEach(col => {
      console.log(`  ${col.Field.padEnd(18)} | ${col.Type.padEnd(30)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    const [usuariosCount] = await connection.execute('SELECT COUNT(*) as total FROM usuarios WHERE estado = "activo"');
    console.log(`\n📈 Usuarios activos: ${usuariosCount[0].total}`);

    const [usuariosRoles] = await connection.execute(`
      SELECT rol, COUNT(*) as cantidad 
      FROM usuarios 
      WHERE estado = 'activo' 
      GROUP BY rol
    `);
    console.log('👥 Por rol:');
    usuariosRoles.forEach(role => {
      console.log(`  - ${role.rol}: ${role.cantidad} usuarios`);
    });

    // ===================================
    // 2. TABLA JORNADAS_LABORALES
    // ===================================
    console.log('\n📋 2. TABLA JORNADAS_LABORALES');
    console.log('-'.repeat(50));
    
    const [jornadasColumns] = await connection.execute('DESCRIBE jornadas_laborales');
    console.log('📊 Estructura completa:');
    jornadasColumns.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} | ${col.Type.padEnd(20)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    const [jornadasCount] = await connection.execute('SELECT COUNT(*) as total FROM jornadas_laborales');
    console.log(`\n📈 Total jornadas registradas: ${jornadasCount[0].total}`);

    // Analizar fechas de jornadas
    const [fechasJornadas] = await connection.execute(`
      SELECT 
        MIN(fecha) as fecha_min, 
        MAX(fecha) as fecha_max,
        COUNT(DISTINCT fecha) as dias_registrados,
        COUNT(DISTINCT usuario_id) as usuarios_con_jornadas
      FROM jornadas_laborales
    `);
    console.log('📅 Rango de fechas:');
    if (fechasJornadas[0].fecha_min) {
      console.log(`  Desde: ${fechasJornadas[0].fecha_min}`);
      console.log(`  Hasta: ${fechasJornadas[0].fecha_max}`);
      console.log(`  Días registrados: ${fechasJornadas[0].dias_registrados}`);
      console.log(`  Usuarios con jornadas: ${fechasJornadas[0].usuarios_con_jornadas}`);
    } else {
      console.log('  ❌ No hay registros de jornadas aún');
    }

    // ===================================
    // 3. TABLA REGIONALES  
    // ===================================
    console.log('\n📋 3. TABLA REGIONALES');
    console.log('-'.repeat(50));
    
    const [regionalesColumns] = await connection.execute('DESCRIBE regionales');
    console.log('📊 Estructura completa:');
    regionalesColumns.forEach(col => {
      console.log(`  ${col.Field.padEnd(15)} | ${col.Type.padEnd(25)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    const [regionalesData] = await connection.execute('SELECT * FROM regionales ORDER BY nombre');
    console.log(`\n📈 Total regionales: ${regionalesData.length}`);
    console.log('🏢 Lista de regionales:');
    regionalesData.forEach(regional => {
      console.log(`  - ${regional.nombre} (${regional.descripcion}) - Lat: ${regional.latitud}, Lng: ${regional.longitud}`);
    });

    // ===================================
    // 4. TABLA REGISTROS_ACCESO (Importante para asistencia)
    // ===================================
    console.log('\n📋 4. TABLA REGISTROS_ACCESO');
    console.log('-'.repeat(50));
    
    const [registrosColumns] = await connection.execute('DESCRIBE registros_acceso');
    console.log('📊 Estructura completa:');
    registrosColumns.forEach(col => {
      console.log(`  ${col.Field.padEnd(15)} | ${col.Type.padEnd(25)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    const [registrosCount] = await connection.execute('SELECT COUNT(*) as total FROM registros_acceso');
    console.log(`\n📈 Total registros de acceso: ${registrosCount[0].total}`);

    // ===================================
    // 5. RELACIONES Y ANÁLISIS AVANZADO
    // ===================================
    console.log('\n🔗 5. ANÁLISIS DE RELACIONES');
    console.log('-'.repeat(50));

    // Usuarios por regional
    const [usuariosRegional] = await connection.execute(`
      SELECT r.nombre as regional, COUNT(u.id) as usuarios_activos
      FROM regionales r
      LEFT JOIN usuarios u ON r.id = u.regional_id AND u.estado = 'activo'
      GROUP BY r.id, r.nombre
      ORDER BY usuarios_activos DESC
    `);
    console.log('👥 Usuarios activos por regional:');
    usuariosRegional.forEach(rel => {
      console.log(`  - ${rel.regional}: ${rel.usuarios_activos} usuarios`);
    });

    // Jornadas por usuario (top 5)
    if (jornadasCount[0].total > 0) {
      const [jornadasUsuario] = await connection.execute(`
        SELECT u.nombre, u.apellido, COUNT(j.id) as total_jornadas
        FROM usuarios u
        LEFT JOIN jornadas_laborales j ON u.id = j.usuario_id
        WHERE u.estado = 'activo'
        GROUP BY u.id
        HAVING total_jornadas > 0
        ORDER BY total_jornadas DESC
        LIMIT 5
      `);
      console.log('\n📊 Top 5 usuarios con más jornadas:');
      jornadasUsuario.forEach(rel => {
        console.log(`  - ${rel.nombre} ${rel.apellido}: ${rel.total_jornadas} jornadas`);
      });
    }

    // ===================================
    // 6. CAMPOS CLAVE PARA MÓDULO CONSULTAS
    // ===================================
    console.log('\n🎯 6. RESUMEN PARA MÓDULO CONSULTAS COLABORADORES');
    console.log('-'.repeat(50));
    
    console.log('✅ CAMPOS DISPONIBLES PARA BÚSQUEDA DE COLABORADORES:');
    console.log('📋 Datos personales: nombre, apellido, documento, email, telefono');
    console.log('🏢 Datos laborales: rol, estado, departamento, cargo, fecha_ingreso');
    console.log('📍 Ubicación: regional_id -> regionales(nombre, descripcion, lat, lng)');
    console.log('📅 Temporal: created_at, updated_at');
    
    console.log('\n✅ DATOS DE JORNADAS/ASISTENCIA DISPONIBLES:');
    console.log('📊 Jornadas: usuario_id, fecha, entrada, salida, descansos');
    console.log('📍 Ubicación GPS: latitud_entrada, longitud_entrada, precision_entrada');
    console.log('🕒 Registros acceso: tipo (entrada/salida), timestamp, ubicación');

    await connection.end();
    console.log('\n' + '='.repeat(60));
    console.log('✅ ANÁLISIS COMPLETO FINALIZADO - LISTO PARA DESARROLLO');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error en análisis:', error.message);
    console.error(error.stack);
  }
}

analisisCompletoDB();