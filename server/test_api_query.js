const { executeQuery } = require('./dist/config/database.js');

async function testUsersApi() {
  try {
    console.log('Probando la misma consulta que usa la API...');
    
    // Esta es la misma consulta que usa UsuarioModel.findAllPaginated
    const page = 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    
    let whereClause = "WHERE estado != 'eliminado'";
    const params = [];
    
    console.log('Ejecutando consulta de conteo...');
    const countQuery = `SELECT COUNT(*) as total FROM usuarios ${whereClause}`;
    const countResults = await executeQuery(countQuery, params);
    const total = countResults[0].total;
    console.log('Total usuarios activos:', total);

    console.log('Ejecutando consulta de datos...');
    const dataQuery = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const dataResults = await executeQuery(dataQuery, [...params, limit, offset]);
    console.log('Número de usuarios obtenidos:', dataResults.length);
    console.log('Primer usuario:', dataResults[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    process.exit(1);
  }
}

testUsersApi();
