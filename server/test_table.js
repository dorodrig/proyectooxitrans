const { executeQuery } = require('./dist/config/database.js');

async function testTableStructure() {
  try {
    console.log('Verificando estructura de la tabla usuarios...');
    
    // Describir la tabla
    const structure = await executeQuery('DESCRIBE usuarios');
    console.log('Estructura de la tabla usuarios:');
    structure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\nProbando consulta simple...');
    const simpleQuery = await executeQuery('SELECT COUNT(*) as total FROM usuarios');
    console.log('Total usuarios:', simpleQuery[0].total);
    
    console.log('\nProbando consulta con LIMIT sin parámetros...');
    const limitQuery = await executeQuery('SELECT id, nombre, apellido FROM usuarios LIMIT 5');
    console.log('Usuarios obtenidos:', limitQuery.length);
    
    console.log('\nProbando consulta con LIMIT con parámetros...');
    const paramQuery = await executeQuery('SELECT id, nombre, apellido FROM usuarios LIMIT ?', [5]);
    console.log('Usuarios obtenidos con parámetro:', paramQuery.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testTableStructure();
