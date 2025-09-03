const { executeQuery } = require('./dist/config/database.js');

async function testFixedQuery() {
  try {
    console.log('Probando la consulta API CORREGIDA sin parámetros preparados...');
    
    const page = 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    
    // Método corregido: construir query directamente
    let whereClause = "WHERE estado != 'eliminado'";
    
    console.log('Ejecutando consulta de conteo...');
    const countQuery = `SELECT COUNT(*) as total FROM usuarios ${whereClause}`;
    const countResults = await executeQuery(countQuery);
    const total = countResults[0].total;
    console.log('Total usuarios activos:', total);

    console.log('Ejecutando consulta de datos...');
    const dataQuery = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    const dataResults = await executeQuery(dataQuery);
    console.log('✅ ÉXITO! Usuarios obtenidos:', dataResults.length);
    
    console.log('Estructura de respuesta:');
    console.log({
      success: true,
      data: {
        usuarios: dataResults,
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando consulta:', error.message);
    process.exit(1);
  }
}

testFixedQuery();
