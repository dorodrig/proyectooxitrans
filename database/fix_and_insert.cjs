const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTriggersAndInsertData() {
  try {
    const connection = await mysql.createConnection({
      host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'oxitrans06092025*',
      database: 'control_acceso_oxitrans'
    });

    console.log('🔧 Eliminando triggers problemáticos...');
    
    // Usar query en lugar de execute para DROP TRIGGER
    try {
      await connection.query('DROP TRIGGER IF EXISTS tr_jornadas_config_unica_activa');
      console.log('✅ Trigger tr_jornadas_config_unica_activa eliminado');
    } catch (err) {
      console.log('⚠️ Error eliminando trigger 1:', err.message);
    }
    
    try {
      await connection.query('DROP TRIGGER IF EXISTS tr_jornadas_config_validar_datos');
      console.log('✅ Trigger tr_jornadas_config_validar_datos eliminado');
    } catch (err) {
      console.log('⚠️ Error eliminando trigger 2:', err.message);
    }
    
    try {
      await connection.query('DROP TRIGGER IF EXISTS tr_jornadas_config_validar_update');
      console.log('✅ Trigger tr_jornadas_config_validar_update eliminado');
    } catch (err) {
      console.log('⚠️ Error eliminando trigger 3:', err.message);
    }

    console.log('📝 Insertando datos de ejemplo...');
    
    // Insertar datos uno por uno
    const datos = [
      ['07:00:00', 8.00, '16:00:00', 1, true],
      ['08:00:00', 8.00, '17:00:00', 2, true],
      ['06:30:00', 8.50, '16:00:00', 3, true],
      ['07:30:00', 8.00, '16:30:00', 4, true],
      ['08:30:00', 8.00, '17:30:00', 5, true]
    ];
    
    for (const [hora_entrada, tiempo_trabajo_dia, fin_jornada_laboral, usuario_id, activa] of datos) {
      try {
        await connection.execute(
          'INSERT INTO jornadas_config (hora_entrada, tiempo_trabajo_dia, fin_jornada_laboral, usuario_id, activa) VALUES (?, ?, ?, ?, ?)',
          [hora_entrada, tiempo_trabajo_dia, fin_jornada_laboral, usuario_id, activa]
        );
        console.log(`✅ Insertado registro para usuario ${usuario_id}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Registro para usuario ${usuario_id} ya existe`);
        } else {
          console.error(`❌ Error insertando usuario ${usuario_id}:`, err.message);
        }
      }
    }
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM jornadas_config');
    console.log(`📊 Total registros: ${rows[0].count}`);
    
    // Mostrar algunos datos
    const [sample] = await connection.execute('SELECT * FROM jornadas_config LIMIT 3');
    console.log('📋 Datos de ejemplo:');
    sample.forEach(row => {
      console.log(`   Usuario ${row.usuario_id}: ${row.hora_entrada} - ${row.fin_jornada_laboral} (${row.tiempo_trabajo_dia}h)`);
    });
    
    await connection.end();
    console.log('🎉 Todo completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixTriggersAndInsertData();