const mysql = require('mysql2/promise');

async function fullDiagnosis() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO - Hora actual del sistema:');
    console.log('Sistema:', new Date().toString());
    console.log('Colombia:', new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false
    }));
    
    console.log('\n📊 1. VERIFICAR JORNADA ACTUAL (usuario_id = 1):');
    const [jornada] = await connection.execute(`
      SELECT 
        id, usuario_id, fecha,
        entrada,
        DATE_FORMAT(entrada, '%Y-%m-%d %H:%i:%s') as entrada_raw,
        TIMESTAMPDIFF(HOUR, entrada, NOW()) as horas_desde_entrada,
        almuerzo_inicio,
        almuerzo_fin,
        descanso_manana_inicio,
        descanso_manana_fin,
        horas_trabajadas
      FROM jornadas_laborales 
      WHERE usuario_id = 1 AND fecha = CURDATE()
      ORDER BY id DESC LIMIT 1
    `);
    
    if (jornada.length > 0) {
      console.table(jornada);
      
      // Mostrar cómo se ve el timestamp cuando se convierte
      const entrada = new Date(jornada[0].entrada);
      console.log('\n🔧 CONVERSIÓN DE TIMESTAMP:');
      console.log('Timestamp BD:', jornada[0].entrada);
      console.log('Como Date object:', entrada.toString());
      console.log('UTC:', entrada.toISOString());
      console.log('Colombia (correcto):', entrada.toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        hour12: false
      }));
      console.log('Solo hora Colombia:', entrada.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit', 
        second: '2-digit',
        timeZone: 'America/Bogota',
        hour12: false
      }));
    } else {
      console.log('❌ No se encontró jornada para usuario 1');
    }

    console.log('\n📊 2. CREAR JORNADA NUEVA CON HORA ACTUAL:');
    
    // Eliminar jornada actual
    await connection.execute('DELETE FROM jornadas_laborales WHERE usuario_id = 1 AND fecha = CURDATE()');
    
    // Crear timestamp de Colombia actual (9:00 PM = 21:00)
    const ahora = new Date();
    const entradaCorrecta = new Date(ahora.getTime() - (20 * 60 * 1000)); // Hace 20 minutos
    
    console.log('Nueva entrada que vamos a insertar:');
    console.log('Timestamp:', entradaCorrecta.toISOString());
    console.log('Colombia:', entradaCorrecta.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false
    }));
    
    // Insertar nueva jornada
    await connection.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada, horas_trabajadas,
        latitud_entrada, longitud_entrada, precision_entrada
      ) VALUES (1, CURDATE(), ?, 0.33, 4.6097, -74.0817, 5.0)
    `, [entradaCorrecta.toISOString().slice(0, 19).replace('T', ' ')]);
    
    console.log('✅ Nueva jornada insertada');
    
    // Verificar la nueva jornada
    const [nuevaJornada] = await connection.execute(`
      SELECT 
        entrada,
        DATE_FORMAT(entrada, '%H:%i:%s') as entrada_formateada
      FROM jornadas_laborales 
      WHERE usuario_id = 1 AND fecha = CURDATE()
    `);
    
    console.log('\n📊 3. VERIFICAR NUEVA JORNADA:');
    console.table(nuevaJornada);
    
    if (nuevaJornada.length > 0) {
      const ts = new Date(nuevaJornada[0].entrada);
      console.log('\n🎯 RESULTADO FINAL:');
      console.log('Timestamp desde BD:', nuevaJornada[0].entrada);
      console.log('Hora formateada Colombia:', ts.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit', 
        timeZone: 'America/Bogota',
        hour12: false
      }));
      console.log('¿Debería mostrar alrededor de 21:XX? (9 PM)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fullDiagnosis();