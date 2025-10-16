const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTriggers() {
  try {
    const connection = await mysql.createConnection({
      host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'oxitrans06092025*',
      database: 'control_acceso_oxitrans'
    });

    console.log('🔍 Verificando triggers...');
    
    const [triggers] = await connection.execute('SHOW TRIGGERS LIKE "jornadas_config"');
    console.log('📋 Triggers encontrados:', triggers.length);
    
    if (triggers.length > 0) {
      triggers.forEach((trigger, index) => {
        console.log(`🔧 Trigger ${index + 1}:`, {
          name: trigger.Trigger,
          event: trigger.Event,
          timing: trigger.Timing,
          table: trigger.Table
        });
      });
      
      // Intentar eliminar triggers problemáticos
      for (const trigger of triggers) {
        try {
          console.log(`🗑️ Eliminando trigger: ${trigger.Trigger}`);
          await connection.execute(`DROP TRIGGER IF EXISTS ${trigger.Trigger}`);
          console.log(`✅ Trigger ${trigger.Trigger} eliminado`);
        } catch (err) {
          console.log(`❌ Error eliminando trigger ${trigger.Trigger}:`, err.message);
        }
      }
    }
    
    await connection.end();
    console.log('🔚 Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTriggers();