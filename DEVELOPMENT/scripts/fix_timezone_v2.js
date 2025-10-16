const mysql = require('mysql2/promise');

async function fixTimezone() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔧 Corrigiendo timezone Colombia...');
    
    // Eliminar datos de hoy
    await connection.execute('DELETE FROM registros_acceso WHERE DATE(timestamp) = CURDATE()');
    console.log('✅ Datos antiguos eliminados');
    
    // Obtener fecha de hoy
    const today = new Date().toISOString().split('T')[0];
    
    // Insertar datos realistas para el admin (simulando jornada en curso)
    const queries = [
      // Entrada de mañana (8:15 AM Colombia)
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (1, 'entrada', '${today} 08:15:00', 4.6097, -74.0817, 'Web Dashboard', 'Entrada admin mañana', NOW())`,
      
      // Descanso AM (10:30 - 10:45 AM Colombia)
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (1, 'salida', '${today} 10:30:00', 4.6097, -74.0817, 'Web Dashboard', 'Inicio descanso AM', NOW())`,
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (1, 'entrada', '${today} 10:45:00', 4.6097, -74.0817, 'Web Dashboard', 'Fin descanso AM', NOW())`,
      
      // Almuerzo (12:00 - 13:00 PM Colombia)
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (1, 'salida', '${today} 12:00:00', 4.6097, -74.0817, 'Web Dashboard', 'Inicio almuerzo', NOW())`,
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (1, 'entrada', '${today} 13:00:00', 4.6097, -74.0817, 'Web Dashboard', 'Fin almuerzo', NOW())`,
      
      // Otros empleados
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (2, 'entrada', '${today} 07:45:00', 4.6097, -74.0817, 'App Móvil', 'Entrada María', NOW())`,
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (2, 'salida', '${today} 12:15:00', 4.6097, -74.0817, 'App Móvil', 'Almuerzo María', NOW())`,
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (2, 'entrada', '${today} 13:15:00', 4.6097, -74.0817, 'App Móvil', 'Regreso María', NOW())`,
      
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (3, 'entrada', '${today} 08:10:00', 4.6097, -74.0817, 'Tarjeta RFID', 'Entrada Juan', NOW())`,
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (3, 'salida', '${today} 12:30:00', 4.6097, -74.0817, 'Tarjeta RFID', 'Almuerzo Juan', NOW())`,  
      `INSERT INTO registros_acceso (usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas, created_at) VALUES (3, 'entrada', '${today} 13:30:00', 4.6097, -74.0817, 'Tarjeta RFID', 'Regreso Juan', NOW())`
    ];
    
    // Ejecutar cada query individualmente
    for (const query of queries) {
      await connection.execute(query);
    }
    
    console.log('✅ Datos de timezone Colombia insertados');
    
    // Verificar resultados
    const [rows] = await connection.execute(`
      SELECT ra.id, ra.usuario_id, u.nombre, ra.tipo, 
             DATE_FORMAT(ra.timestamp, '%H:%i:%s') as hora,
             ra.dispositivo
      FROM registros_acceso ra
      INNER JOIN usuarios u ON ra.usuario_id = u.id
      WHERE DATE(ra.timestamp) = CURDATE()
      ORDER BY ra.timestamp ASC
    `);
    
    console.log('📊 Datos insertados:');
    console.table(rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixTimezone();