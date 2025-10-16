const mysql = require('mysql2/promise');

async function checkCurrentTimestamp() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔍 Verificando timestamps actuales...');
    console.log('Hora del sistema Node.js:', new Date().toString());
    console.log('Hora UTC:', new Date().toISOString());
    console.log('Hora Colombia local:', new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false
    }));
    
    // Verificar hora del servidor MySQL
    const [serverTime] = await connection.execute('SELECT NOW() as servidor_mysql, UTC_TIMESTAMP() as utc_mysql');
    console.log('📊 Tiempos del servidor MySQL:');
    console.table(serverTime);
    
    // Verificar los registros más recientes de jornadas
    const [jornadas] = await connection.execute(`
      SELECT 
        jl.usuario_id,
        u.nombre,
        jl.entrada,
        DATE_FORMAT(jl.entrada, '%Y-%m-%d %H:%i:%s') as entrada_formatted,
        CONVERT_TZ(jl.entrada, '+00:00', '-05:00') as entrada_colombia_tz,
        DATE_FORMAT(CONVERT_TZ(jl.entrada, '+00:00', '-05:00'), '%H:%i:%s') as entrada_colombia_formatted
      FROM jornadas_laborales jl
      INNER JOIN usuarios u ON jl.usuario_id = u.id
      WHERE jl.fecha = CURDATE()
      ORDER BY jl.entrada DESC
      LIMIT 3
    `);
    
    console.log('📊 Jornadas actuales en BD:');
    console.table(jornadas);
    
    // Verificar registros de acceso recientes
    const [registros] = await connection.execute(`
      SELECT 
        ra.usuario_id,
        u.nombre,
        ra.tipo,
        ra.timestamp,
        DATE_FORMAT(ra.timestamp, '%Y-%m-%d %H:%i:%s') as timestamp_formatted,
        CONVERT_TZ(ra.timestamp, '+00:00', '-05:00') as timestamp_colombia_tz,
        DATE_FORMAT(CONVERT_TZ(ra.timestamp, '+00:00', '-05:00'), '%H:%i:%s') as timestamp_colombia_formatted
      FROM registros_acceso ra
      INNER JOIN usuarios u ON ra.usuario_id = u.id
      WHERE DATE(ra.timestamp) = CURDATE()
      ORDER BY ra.timestamp DESC
      LIMIT 5
    `);
    
    console.log('📊 Registros de acceso recientes:');
    console.table(registros);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkCurrentTimestamp();