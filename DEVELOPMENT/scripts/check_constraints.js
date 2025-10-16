const mysql = require('mysql2/promise');

async function checkConstraints() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔍 VERIFICANDO CONSTRAINTS Y ESTRUCTURA DE BD...');
    
    // Verificar constraints existentes (MySQL específico)
    const [constraints] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = 'control_acceso_oxitrans'
      AND TABLE_NAME IN ('jornadas_laborales', 'registros_acceso')
      AND CONSTRAINT_TYPE = 'CHECK'
    `);
    
    console.log('📊 CONSTRAINTS EXISTENTES:');
    console.table(constraints);
    
    // Verificar estructura de tabla jornadas_laborales
    const [columns] = await connection.execute(`
      DESCRIBE jornadas_laborales
    `);
    
    console.log('📊 ESTRUCTURA jornadas_laborales:');
    console.table(columns);
    
    // Verificar datos actuales
    const [currentData] = await connection.execute(`
      SELECT 
        id, usuario_id, fecha, entrada, salida,
        (entrada IS NOT NULL) as tiene_entrada,
        (salida IS NOT NULL) as tiene_salida
      FROM jornadas_laborales 
      WHERE usuario_id = 1 AND fecha = CURDATE()
    `);
    
    console.log('📊 DATOS ACTUALES jornadas_laborales:');
    console.table(currentData);
    
    // Verificar si hay constraint problemático
    const [checkConstraints] = await connection.execute(`
      SHOW CREATE TABLE jornadas_laborales
    `);
    
    console.log('📊 CREATE TABLE jornadas_laborales:');
    console.log(checkConstraints[0]['Create Table']);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkConstraints();