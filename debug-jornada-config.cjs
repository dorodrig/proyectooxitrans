// DEBUG SCRIPT - Test jornada config creation
// Ejecutar con: node debug-jornada-config.cjs

const mysql = require('mysql2/promise');

async function debugJornadaConfig() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Cambiar por tu password
      database: 'oxitrans_control_acceso'
    });

    console.log('✅ Conexión a base de datos exitosa');

    // 1. Verificar que la tabla existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'jornadas_config'");
    console.log('🔍 Tabla jornadas_config existe:', tables.length > 0);

    if (tables.length === 0) {
      console.log('❌ ERROR: La tabla jornadas_config no existe');
      return;
    }

    // 2. Verificar estructura de la tabla
    const [columns] = await connection.execute("DESCRIBE jornadas_config");
    console.log('📋 Estructura de la tabla:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key} ${col.Default || ''}`);
    });

    // 3. Verificar restricciones de clave foránea
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'oxitrans_control_acceso' 
      AND TABLE_NAME = 'jornadas_config' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('🔗 Restricciones de clave foránea:');
    if (constraints.length === 0) {
      console.log('  - No hay restricciones FK');
    } else {
      constraints.forEach(fk => {
        console.log(`  - ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    }

    // 4. Verificar configuraciones existentes
    const [existing] = await connection.execute('SELECT * FROM jornadas_config WHERE usuario_id = -1');
    console.log('📊 Configuraciones globales existentes:', existing.length);
    existing.forEach(config => {
      console.log(`  - ID: ${config.id}, Activa: ${config.activa}, Entrada: ${config.hora_entrada}`);
    });

    // 5. Probar desactivación (paso 1 del error)
    console.log('🧪 Probando desactivación de configuraciones globales...');
    const [updateResult] = await connection.execute(`
      UPDATE jornadas_config 
      SET activa = 0, fecha_actualizacion = NOW() 
      WHERE usuario_id = -1 AND activa = 1
    `);
    console.log('✅ Desactivación exitosa, filas afectadas:', updateResult.affectedRows);

    // 6. Probar inserción (paso 2 del error)
    console.log('🧪 Probando inserción de nueva configuración global...');
    const testData = {
      horaEntrada: '08:00:00',
      tiempoTrabajoDia: 6.0,
      finJornadaLaboral: '15:00:00',
      activa: true
    };

    try {
      const [insertResult] = await connection.execute(`
        INSERT INTO jornadas_config (
          hora_entrada,
          tiempo_trabajo_dia,
          fin_jornada_laboral,
          usuario_id,
          activa,
          fecha_creacion,
          fecha_actualizacion
        ) VALUES (?, ?, ?, -1, ?, NOW(), NOW())
      `, [
        testData.horaEntrada,
        testData.tiempoTrabajoDia,
        testData.finJornadaLaboral,
        testData.activa
      ]);
      
      console.log('✅ Inserción exitosa, ID:', insertResult.insertId);

      // 7. Probar obtener por ID (paso 3 del error)
      const [newConfig] = await connection.execute('SELECT * FROM jornadas_config WHERE id = ?', [insertResult.insertId]);
      console.log('✅ Configuración obtenida:', newConfig[0] ? 'Sí' : 'No');
      
      if (newConfig[0]) {
        console.log('📄 Datos obtenidos:', {
          id: newConfig[0].id,
          hora_entrada: newConfig[0].hora_entrada,
          tiempo_trabajo_dia: newConfig[0].tiempo_trabajo_dia,
          fin_jornada_laboral: newConfig[0].fin_jornada_laboral,
          usuario_id: newConfig[0].usuario_id,
          activa: newConfig[0].activa
        });
      }

    } catch (insertError) {
      console.log('❌ ERROR en inserción:', insertError.message);
      console.log('   SQL State:', insertError.sqlState);
      console.log('   Error Code:', insertError.code);
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.sqlState) {
      console.error('   SQL State:', error.sqlState);
    }
    if (error.code) {
      console.error('   Error Code:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 Conexión cerrada');
    }
  }
}

debugJornadaConfig();