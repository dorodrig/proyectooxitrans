const mysql = require('mysql2/promise');

async function corregirNovedades() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔧 Actualizando tabla novedades...');
    
    // Modificar el ENUM para incluir horas_extra
    await connection.execute(`
      ALTER TABLE novedades 
      MODIFY COLUMN tipo ENUM(
        'incapacidad', 
        'ausentismo', 
        'permiso', 
        'no_remunerado', 
        'lic_maternidad', 
        'lic_paternidad', 
        'dia_familia',
        'horas_extra'
      ) NOT NULL
    `);
    
    console.log('✅ ENUM actualizado');

    // Insertar registros de prueba
    await connection.execute(`
      INSERT IGNORE INTO novedades (usuarioId, tipo, fechaInicio, fechaFin, horas) VALUES
      (20, 'horas_extra', '2025-10-02', '2025-10-02', 3),
      (20, 'horas_extra', '2025-10-03', '2025-10-03', 2),
      (20, 'horas_extra', '2025-10-04', '2025-10-04', 4),
      (20, 'horas_extra', '2025-10-06', '2025-10-06', 2)
    `);
    
    console.log('✅ Registros de prueba insertados');
    
    // Verificar los datos
    const [rows] = await connection.execute("SELECT * FROM novedades WHERE tipo = 'horas_extra'");
    console.log('📊 Horas extra registradas:', rows.length);
    console.log('📋 Datos:', rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

corregirNovedades();