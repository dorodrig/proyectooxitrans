const mysql = require('mysql2/promise');

async function fixCurrentEntry() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔧 Corrigiendo timestamp de entrada...');
    
    // Obtener hora actual de Colombia (8:42 PM = 20:42)
    const ahoraColobmia = new Date();
    // Restar 5 minutos para simular que entró a las 8:42 PM
    ahoraColobmia.setMinutes(ahoraColobmia.getMinutes() - 9); // Hace 9 minutos: 8:42
    
    const entradaCorrecta = ahoraColobmia.toISOString().slice(0, 19).replace('T', ' ');
    console.log('✅ Nueva hora de entrada (Colombia):', ahoraColobmia.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false
    }));
    
    // Actualizar la jornada del admin (usuario 1) con la hora correcta
    await connection.execute(`
      UPDATE jornadas_laborales 
      SET entrada = ?
      WHERE usuario_id = 1 AND fecha = CURDATE()
    `, [entradaCorrecta]);
    
    console.log('✅ Jornada actualizada');
    
    // También vamos a crear/actualizar un registro de acceso correspondiente
    const today = new Date().toISOString().split('T')[0];
    
    // Eliminar registro de entrada anterior del admin
    await connection.execute(`
      DELETE FROM registros_acceso 
      WHERE usuario_id = 1 AND tipo = 'entrada' AND DATE(timestamp) = CURDATE()
    `);
    
    // Insertar registro de entrada correcto
    await connection.execute(`
      INSERT INTO registros_acceso (
        usuario_id, tipo, timestamp, latitud, longitud, 
        dispositivo, notas, created_at
      ) VALUES (1, 'entrada', ?, 4.6097, -74.0817, 'Web Dashboard', 'Entrada admin corregida', NOW())
    `, [entradaCorrecta]);
    
    console.log('✅ Registro de acceso actualizado');
    
    // Verificar resultado
    const [verificacion] = await connection.execute(`
      SELECT 
        jl.entrada,
        DATE_FORMAT(jl.entrada, '%H:%i:%s') as entrada_hora_bd,
        ra.timestamp,
        DATE_FORMAT(ra.timestamp, '%H:%i:%s') as timestamp_hora_bd
      FROM jornadas_laborales jl
      LEFT JOIN registros_acceso ra ON ra.usuario_id = jl.usuario_id 
        AND ra.tipo = 'entrada' AND DATE(ra.timestamp) = jl.fecha
      WHERE jl.usuario_id = 1 AND jl.fecha = CURDATE()
    `);
    
    console.log('📊 Verificación - Datos corregidos:');
    console.table(verificacion);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixCurrentEntry();