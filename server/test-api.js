const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAPI() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306')
    });
    
    console.log('✅ Probando API corregida...');
    
    // Test departamentos
    console.log('\n📊 Departamentos:');
    const [departamentos] = await connection.execute(
      'SELECT departamento, COUNT(*) as total FROM usuarios WHERE estado != "eliminado" AND departamento IS NOT NULL AND departamento != "" GROUP BY departamento ORDER BY total DESC'
    );
    console.log(departamentos);
    
    // Test cargos
    console.log('\n💼 Cargos:');
    const [cargos] = await connection.execute(
      'SELECT cargo, COUNT(*) as total FROM usuarios WHERE estado != "eliminado" AND cargo IS NOT NULL AND cargo != "" GROUP BY cargo ORDER BY total DESC'
    );
    console.log(cargos);
    
    // Test novedades
    console.log('\n🔔 Novedades:');
    const [novedades] = await connection.execute(
      'SELECT tipo, COUNT(*) as total FROM novedades GROUP BY tipo'
    );
    console.log(novedades);
    
    await connection.end();
    console.log('\n✅ Todas las consultas funcionan correctamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
