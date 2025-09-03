const { executeQuery } = require('./dist/config/database.js');

async function testParameters() {
  try {
    console.log('Probando con diferentes tipos de parámetros...');
    
    // Probar con números enteros
    console.log('Test 1: números enteros');
    const limit1 = 50;
    const offset1 = 0;
    console.log('limit:', limit1, 'tipo:', typeof limit1);
    console.log('offset:', offset1, 'tipo:', typeof offset1);
    
    const query1 = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios 
      WHERE estado != 'eliminado'
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const result1 = await executeQuery(query1, [limit1, offset1]);
    console.log('Test 1 exitoso. Usuarios obtenidos:', result1.length);
    
    // Probar con números como strings (esto es lo que puede estar pasando)
    console.log('\nTest 2: números como strings');
    const limit2 = '50';
    const offset2 = '0';
    console.log('limit:', limit2, 'tipo:', typeof limit2);
    console.log('offset:', offset2, 'tipo:', typeof offset2);
    
    const result2 = await executeQuery(query1, [limit2, offset2]);
    console.log('Test 2 exitoso. Usuarios obtenidos:', result2.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error en test:', error.message);
    process.exit(1);
  }
}

testParameters();
