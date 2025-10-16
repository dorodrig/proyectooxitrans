const mysql = require('mysql2/promise');

async function fixTimestampCorrectly() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔧 CORRIGIENDO TIMESTAMP CORRECTAMENTE...');
    
    // La hora actual en Colombia es 21:03 (9:03 PM)
    // Quiero simular que entró hace 20 minutos: 20:43 (8:43 PM)
    
    // Para crear un timestamp que represente 20:43 Colombia:
    // Colombia es UTC-5, entonces 20:43 Colombia = 01:43 UTC del día siguiente
    
    const today = new Date().toISOString().split('T')[0]; // 2025-09-30
    const horaColombiaDeseada = '20:43:00'; // 8:43 PM Colombia
    
    // Crear timestamp correcto: Colombia 20:43 = UTC 01:43 del día siguiente
    const timestampColombia = `${today} ${horaColombiaDeseada}`;
    
    console.log('Hora deseada en Colombia:', timestampColombia);
    
    // Eliminar jornada actual
    await connection.execute('DELETE FROM jornadas_laborales WHERE usuario_id = 1 AND fecha = CURDATE()');
    console.log('✅ Jornada anterior eliminada');
    
    // Insertar con hora de Colombia directamente
    await connection.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada, horas_trabajadas,
        latitud_entrada, longitud_entrada, precision_entrada
      ) VALUES (1, CURDATE(), ?, 0.33, 4.6097, -74.0817, 5.0)
    `, [timestampColombia]);
    
    console.log('✅ Nueva jornada insertada con hora Colombia');
    
    // Verificar resultado
    const [resultado] = await connection.execute(`
      SELECT 
        entrada,
        DATE_FORMAT(entrada, '%Y-%m-%d %H:%i:%s') as entrada_formateada
      FROM jornadas_laborales 
      WHERE usuario_id = 1 AND fecha = CURDATE()
    `);
    
    console.log('\n📊 VERIFICACIÓN:');
    console.table(resultado);
    
    if (resultado.length > 0) {
      const timestamp = new Date(resultado[0].entrada);
      console.log('\n🎯 CONVERSIONES:');
      console.log('Timestamp BD:', resultado[0].entrada);
      console.log('Objeto Date:', timestamp.toString());
      console.log('UTC:', timestamp.toISOString());
      
      // Diferentes formas de mostrar en Colombia
      console.log('\n🇨🇴 FORMATOS COLOMBIA:');
      console.log('Con timeZone America/Bogota:', timestamp.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Bogota',
        hour12: false
      }));
      
      console.log('Fecha completa Colombia:', timestamp.toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        hour12: false
      }));
      
      // Prueba: crear Date sin timezone y ver qué pasa
      console.log('\n🧪 PRUEBA SIN TIMEZONE:');
      const sinTimezone = new Date(resultado[0].entrada_formateada + ' UTC');
      console.log('Sin timezone conversion:', sinTimezone.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      }));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixTimestampCorrectly();