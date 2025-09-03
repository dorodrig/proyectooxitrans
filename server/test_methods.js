const { executeQuery } = require('./dist/config/database.js');

async function testDifferentMethods() {
  try {
    console.log('Probando diferentes métodos de consulta...');
    
    // Método 1: Sin parámetros (esto funciona)
    console.log('\nMétodo 1: consulta directa sin parámetros');
    const result1 = await executeQuery('SELECT id, nombre, apellido FROM usuarios LIMIT 5');
    console.log('Funciona! Usuarios obtenidos:', result1.length);
    
    // Método 2: Construir query con valores directos (evitando parámetros preparados)
    console.log('\nMétodo 2: consulta construida directamente');
    const limit = 50;
    const offset = 0;
    const query2 = `SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at FROM usuarios WHERE estado != 'eliminado' ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const result2 = await executeQuery(query2);
    console.log('Funciona! Usuarios obtenidos:', result2.length);
    console.log('Primer usuario:', result2[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDifferentMethods();
