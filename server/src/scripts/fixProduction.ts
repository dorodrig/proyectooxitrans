import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

const fixProduction = async () => {
  console.log('🔧 Iniciando corrección de base de datos de producción...');
  
  try {
    // Leer el script SQL
    const sqlScript = fs.readFileSync(
      path.join(__dirname, '../../../database/fix-production.sql'), 
      'utf8'
    );
    
    // Dividir el script en statements individuales
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Ejecutando ${statements.length} statements...`);
    
    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.includes('DELIMITER')) {
        console.log(`⏭️  Saltando DELIMITER statement ${i + 1}`);
        continue;
      }
      
      try {
        console.log(`▶️  Ejecutando statement ${i + 1}/${statements.length}`);
        await pool.execute(statement);
        console.log(`✅ Statement ${i + 1} ejecutado correctamente`);
      } catch (error: any) {
        if (error.code === 'ER_TRG_DOES_NOT_EXIST' || 
            error.code === 'ER_SP_DOES_NOT_EXIST' ||
            error.code === 'ER_NO_SUCH_TABLE') {
          console.log(`⚠️  Statement ${i + 1} - Objeto no existe (normal): ${error.message}`);
        } else {
          console.error(`❌ Error en statement ${i + 1}:`, error.message);
          console.log(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }
    
    // Verificar que todo funciona
    console.log('\n🔍 Verificando corrección...');
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM usuarios');
    console.log(`✅ Tabla usuarios accesible: ${(rows as any)[0].count} registros`);
    
    console.log('\n🎉 ¡Corrección completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  fixProduction()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falló:', error);
      process.exit(1);
    });
}

export default fixProduction;
