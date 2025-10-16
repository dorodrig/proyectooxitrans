const mysql = require('mysql2/promise');

async function createRealisticColombianWorkday() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🇨🇴 CREANDO JORNADA REALISTA HORA COLOMBIA...');
    
    // Obtener fecha actual de Colombia
    const fechaColombia = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Bogota'
    }); // Formato YYYY-MM-DD
    
    console.log('📅 Fecha Colombia:', fechaColombia);
    
    // Crear horarios realistas de Colombia (como si fuera una jornada normal)
    // Estos son los horarios LOCALES de Colombia que queremos mostrar
    const horariosDeseados = {
      entrada: '08:30:00',          // 8:30 AM
      descansoAMInicio: '10:15:00', // 10:15 AM  
      descansoAMFin: '10:30:00',    // 10:30 AM
      almuerzoInicio: '12:00:00',   // 12:00 PM
      almuerzoFin: '13:00:00',      // 1:00 PM
    };
    
    console.log('⏰ Horarios deseados (Colombia):');
    Object.entries(horariosDeseados).forEach(([evento, hora]) => {
      console.log(`  ${evento}: ${hora}`);
    });
    
    // Crear timestamps que cuando se muestren en Colombia aparezcan como los horarios deseados
    // Para esto, creo fechas en timezone de Colombia directamente
    const crearTimestampColombia = (horaDeseada) => {
      // Crear un timestamp que represente la hora local de Colombia
      return `${fechaColombia} ${horaDeseada}`;
    };
    
    const timestamps = {
      entrada: crearTimestampColombia(horariosDeseados.entrada),
      descansoAMInicio: crearTimestampColombia(horariosDeseados.descansoAMInicio),
      descansoAMFin: crearTimestampColombia(horariosDeseados.descansoAMFin),
      almuerzoInicio: crearTimestampColombia(horariosDeseados.almuerzoInicio),
      almuerzoFin: crearTimestampColombia(horariosDeseados.almuerzoFin),
    };
    
    console.log('📊 Timestamps a insertar:');
    Object.entries(timestamps).forEach(([evento, timestamp]) => {
      console.log(`  ${evento}: ${timestamp}`);
    });
    
    // Eliminar jornada existente
    await connection.execute('DELETE FROM jornadas_laborales WHERE usuario_id = 1 AND fecha = CURDATE()');
    console.log('✅ Jornada anterior eliminada');
    
    // Insertar nueva jornada con horarios de Colombia
    await connection.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada,
        descanso_manana_inicio, descanso_manana_fin,
        almuerzo_inicio, almuerzo_fin,
        horas_trabajadas,
        latitud_entrada, longitud_entrada, precision_entrada
      ) VALUES (1, CURDATE(), ?, ?, ?, ?, ?, 6.25, 4.6097, -74.0817, 5.0)
    `, [
      timestamps.entrada,
      timestamps.descansoAMInicio,
      timestamps.descansoAMFin,
      timestamps.almuerzoInicio,
      timestamps.almuerzoFin
    ]);
    
    console.log('✅ Nueva jornada insertada');
    
    // Eliminar y recrear registros de acceso
    await connection.execute('DELETE FROM registros_acceso WHERE usuario_id = 1 AND DATE(timestamp) = CURDATE()');
    
    const registros = [
      [1, 'entrada', timestamps.entrada, 'Entrada matutina'],
      [1, 'salida', timestamps.descansoAMInicio, 'Descanso AM inicio'],
      [1, 'entrada', timestamps.descansoAMFin, 'Descanso AM fin'],
      [1, 'salida', timestamps.almuerzoInicio, 'Almuerzo inicio'],
      [1, 'entrada', timestamps.almuerzoFin, 'Almuerzo fin']
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
    
    // Verificar resultado
    const [resultado] = await connection.execute(`
      SELECT 
        entrada,
        descanso_manana_inicio,
        descanso_manana_fin,
        almuerzo_inicio,
        almuerzo_fin,
        horas_trabajadas,
        DATE_FORMAT(entrada, '%H:%i:%s') as entrada_hora_bd,
        DATE_FORMAT(descanso_manana_inicio, '%H:%i:%s') as descanso_am_inicio_hora_bd,
        DATE_FORMAT(descanso_manana_fin, '%H:%i:%s') as descanso_am_fin_hora_bd,
        DATE_FORMAT(almuerzo_inicio, '%H:%i:%s') as almuerzo_inicio_hora_bd,
        DATE_FORMAT(almuerzo_fin, '%H:%i:%s') as almuerzo_fin_hora_bd
      FROM jornadas_laborales 
      WHERE usuario_id = 1 AND fecha = CURDATE()
    `);
    
    console.log('\n📊 RESULTADO EN BASE DE DATOS:');
    console.table(resultado);
    
    // Verificar cómo se ven cuando se convierten a Colombia
    if (resultado.length > 0) {
      const j = resultado[0];
      console.log('\n🇨🇴 CÓMO SE VERÁN EN COLOMBIA:');
      
      ['entrada', 'descanso_manana_inicio', 'descanso_manana_fin', 'almuerzo_inicio', 'almuerzo_fin'].forEach(campo => {
        if (j[campo]) {
          const fecha = new Date(j[campo]);
          const horaFormateada = fecha.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Bogota',
            hour12: false
          });
          console.log(`${campo}: ${horaFormateada} (deseado: ${horariosDeseados[campo.replace('_', '')]} aproximadamente)`);
        }
      });
    }
    
    console.log('\n🎯 AHORA REFRESQUE LA PÁGINA PARA VER HORARIOS CORRECTOS DE COLOMBIA');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createRealisticColombianWorkday();
