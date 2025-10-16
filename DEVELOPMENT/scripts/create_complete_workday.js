const mysql = require('mysql2/promise');

async function createCompleteWorkday() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔧 CREANDO JORNADA COMPLETA CON HORARIOS COLOMBIA...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Horarios en Colombia para una jornada típica
    const horarios = {
      entrada: `${today} 08:15:00`,              // 8:15 AM
      descansoAMInicio: `${today} 10:30:00`,     // 10:30 AM  
      descansoAMFin: `${today} 10:45:00`,        // 10:45 AM
      almuerzoInicio: `${today} 12:00:00`,       // 12:00 PM
      almuerzoFin: `${today} 13:00:00`,          // 1:00 PM
      // Jornada en curso (sin descanso PM ni salida aún)
    };
    
    console.log('📅 Horarios programados (Colombia):');
    Object.entries(horarios).forEach(([evento, hora]) => {
      console.log(`${evento}: ${hora}`);
    });
    
    // Eliminar jornada existente
    await connection.execute('DELETE FROM jornadas_laborales WHERE usuario_id = 1 AND fecha = CURDATE()');
    
    // Crear jornada completa
    await connection.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada,
        descanso_manana_inicio, descanso_manana_fin,
        almuerzo_inicio, almuerzo_fin,
        horas_trabajadas,
        latitud_entrada, longitud_entrada, precision_entrada
      ) VALUES (1, CURDATE(), ?, ?, ?, ?, ?, 5.25, 4.6097, -74.0817, 5.0)
    `, [
      horarios.entrada,
      horarios.descansoAMInicio, 
      horarios.descansoAMFin,
      horarios.almuerzoInicio,
      horarios.almuerzoFin
    ]);
    
    console.log('✅ Jornada completa creada');
    
    // También crear registros de acceso correspondientes
    await connection.execute('DELETE FROM registros_acceso WHERE usuario_id = 1 AND DATE(timestamp) = CURDATE()');
    
    const registros = [
      [1, 'entrada', horarios.entrada, 'Entrada matutina'],
      [1, 'salida', horarios.descansoAMInicio, 'Descanso AM inicio'], 
      [1, 'entrada', horarios.descansoAMFin, 'Descanso AM fin'],
      [1, 'salida', horarios.almuerzoInicio, 'Almuerzo inicio'],
      [1, 'entrada', horarios.almuerzoFin, 'Almuerzo fin']
    ];
    
    for (const [usuarioId, tipo, timestamp, nota] of registros) {
      await connection.execute(`
        INSERT INTO registros_acceso (
          usuario_id, tipo, timestamp, latitud, longitud, 
          dispositivo, notas, created_at
        ) VALUES (?, ?, ?, 4.6097, -74.0817, 'Web Dashboard', ?, NOW())
      `, [usuarioId, tipo, timestamp, nota]);
    }
    
    console.log('✅ Registros de acceso creados');
    
    // Verificar resultado final
    const [jornada] = await connection.execute(`
      SELECT 
        entrada,
        descanso_manana_inicio,
        descanso_manana_fin,
        almuerzo_inicio,
        almuerzo_fin,
        horas_trabajadas,
        DATE_FORMAT(entrada, '%H:%i:%s') as entrada_hora,
        DATE_FORMAT(descanso_manana_inicio, '%H:%i:%s') as descanso_am_inicio_hora,
        DATE_FORMAT(descanso_manana_fin, '%H:%i:%s') as descanso_am_fin_hora,
        DATE_FORMAT(almuerzo_inicio, '%H:%i:%s') as almuerzo_inicio_hora,
        DATE_FORMAT(almuerzo_fin, '%H:%i:%s') as almuerzo_fin_hora
      FROM jornadas_laborales 
      WHERE usuario_id = 1 AND fecha = CURDATE()
    `);
    
    console.log('\n📊 JORNADA FINAL:');
    console.table(jornada);
    
    // Verificar cómo se ven las conversiones de timezone
    if (jornada.length > 0) {
      const j = jornada[0];
      console.log('\n🇨🇴 CONVERSIONES TIMEZONE:');
      
      ['entrada', 'descanso_manana_inicio', 'descanso_manana_fin', 'almuerzo_inicio', 'almuerzo_fin'].forEach(campo => {
        if (j[campo]) {
          const fecha = new Date(j[campo]);
          console.log(`${campo}:`, fecha.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Bogota',
            hour12: false
          }));
        }
      });
    }
    
    console.log('\n🎯 AHORA REFRESQUE LA PÁGINA PARA VER LOS CAMBIOS');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createCompleteWorkday();