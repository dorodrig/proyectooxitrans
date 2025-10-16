const mysql = require('mysql2/promise');

async function verificarDatos() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });
  
  try {
    const [results] = await connection.execute(
      'SELECT fecha, horas_trabajadas, entrada, salida FROM jornadas_laborales WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 15',
      [20]
    );
    
    console.log('=== DATOS ACTUALES BD USUARIO 20 ===');
    results.forEach((row, i) => {
      console.log(`[${i+1}] ${row.fecha} | ${row.horas_trabajadas}h | ${row.entrada}-${row.salida}`);
    });
    
    console.log(`\nTotal registros encontrados: ${results.length}`);
  } finally {
    await connection.end();
  }
}

verificarDatos().catch(console.error);