const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Script para poblar la base de datos con datos de prueba
 * Para el módulo de Jornadas Laborales - OXITRANS S.A.S
 */

async function executeSeeder() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Crear conexión
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('✅ Conexión establecida correctamente');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'seed_jornadas_laborales.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Archivo SQL no encontrado: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 Archivo SQL leído correctamente');
    console.log('🚀 Ejecutando script de datos de prueba...');

    // Ejecutar el SQL
    const [results] = await connection.execute(sqlContent);
    
    console.log('✅ Script ejecutado exitosamente');
    
    // Mostrar estadísticas finales
    console.log('\n📊 VERIFICANDO DATOS INSERTADOS...\n');
    
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_jornadas,
        COUNT(DISTINCT usuario_id) as empleados_con_registros,
        AVG(horas_trabajadas) as promedio_horas,
        MAX(fecha) as fecha_mas_reciente,
        MIN(fecha) as fecha_mas_antigua
      FROM jornadas_laborales
    `);
    
    console.log('📈 ESTADÍSTICAS GENERALES:');
    console.log(`   - Total de jornadas: ${stats[0].total_jornadas}`);
    console.log(`   - Empleados con registros: ${stats[0].empleados_con_registros}`);
    console.log(`   - Promedio de horas: ${parseFloat(stats[0].promedio_horas || 0).toFixed(2)}`);
    console.log(`   - Fecha más reciente: ${stats[0].fecha_mas_reciente}`);
    console.log(`   - Fecha más antigua: ${stats[0].fecha_mas_antigua}`);

    // Mostrar distribución por empleado
    const [employeeStats] = await connection.execute(`
      SELECT 
        u.nombre,
        u.apellido,
        COUNT(j.id) as total_jornadas,
        COALESCE(AVG(j.horas_trabajadas), 0) as promedio_horas,
        COUNT(CASE WHEN j.auto_cerrada = 1 THEN 1 END) as auto_cerradas,
        COUNT(CASE WHEN j.salida IS NULL THEN 1 END) as incompletas
      FROM usuarios u 
      LEFT JOIN jornadas_laborales j ON u.id = j.usuario_id 
      GROUP BY u.id, u.nombre, u.apellido
      HAVING COUNT(j.id) > 0
      ORDER BY u.id
    `);

    console.log('\n👥 DISTRIBUCIÓN POR EMPLEADO:');
    employeeStats.forEach(emp => {
      console.log(`   - ${emp.nombre} ${emp.apellido}:`);
      console.log(`     * Jornadas: ${emp.total_jornadas}`);
      console.log(`     * Promedio horas: ${parseFloat(emp.promedio_horas).toFixed(2)}`);
      console.log(`     * Auto-cerradas: ${emp.auto_cerradas}`);
      console.log(`     * Incompletas: ${emp.incompletas}`);
    });

    // Mostrar registros de hoy
    const [todayStats] = await connection.execute(`
      SELECT 
        u.nombre,
        u.apellido,
        j.entrada,
        j.salida,
        CASE 
          WHEN j.salida IS NOT NULL THEN 'Completa'
          WHEN j.almuerzo_inicio IS NOT NULL AND j.almuerzo_fin IS NULL THEN 'En almuerzo'
          WHEN j.descanso_tarde_inicio IS NOT NULL AND j.descanso_tarde_fin IS NULL THEN 'En descanso PM'
          WHEN j.entrada IS NOT NULL THEN 'En curso'
          ELSE 'Sin registrar'
        END as estado
      FROM usuarios u 
      INNER JOIN jornadas_laborales j ON u.id = j.usuario_id 
      WHERE DATE(j.fecha) = CURDATE()
      ORDER BY j.entrada ASC
    `);

    console.log('\n📅 JORNADAS DE HOY:');
    todayStats.forEach(reg => {
      const entrada = reg.entrada ? reg.entrada.substring(0, 5) : '--:--';
      const salida = reg.salida ? reg.salida.substring(0, 5) : '--:--';
      console.log(`   - ${reg.nombre} ${reg.apellido}: ${entrada} - ${salida} (${reg.estado})`);
    });

    console.log('\n🎉 ¡DATOS DE PRUEBA INSERTADOS EXITOSAMENTE!');
    console.log('\n📱 LISTO PARA PROBAR JornadaLaboralPage.tsx');
    console.log('   - Frontend: http://localhost:5174/jornada-laboral');
    console.log('   - Backend: http://localhost:3001/api/jornadas');
    
  } catch (error) {
    console.error('❌ Error ejecutando el seeder:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  executeSeeder();
}

module.exports = { executeSeeder };