const mysql = require('mysql2/promise');
const fs = require('fs');

async function executeSQLFile() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans',
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync('../database/fix_timezone_simple.sql', 'utf8');
    console.log('🔧 Ejecutando corrección de timezone Colombia...');
    
    const [results] = await connection.execute(sql);
    console.log('✅ Timezone corregido exitosamente');
    
    // Mostrar algunos resultados
    if (Array.isArray(results)) {
      results.forEach((result, index) => {
        if (result && result.length > 0) {
          console.log(`Resultado ${index + 1}:`, result);
        }
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

executeSQLFile();