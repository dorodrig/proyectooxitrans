/**
 * Test de APIs del Módulo de Consultas de Colaboradores
 * Verifica todos los endpoints implementados en ColaboradoresController
 */

const BASE_URL = 'http://localhost:3001/api';

// Configuración de pruebas
const TEST_CONFIG = {
  usuario_admin: {
    email: 'admin@oxitrans.com',
    password: 'admin123'
  },
  usuario_supervisor: {
    email: 'supervisor@oxitrans.com', 
    password: 'supervisor123'
  }
};

let authToken = '';

// Función auxiliar para hacer requests autenticados
async function authenticatedRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    ...(options.headers || {})
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}

// Test de autenticación
async function testLogin() {
  console.log('🔐 Testing login...');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CONFIG.usuario_admin)
    });

    const result = await response.json();
    
    if (result.success && result.data.token) {
      authToken = result.data.token;
      console.log('✅ Login exitoso');
      console.log(`👤 Usuario: ${result.data.usuario.nombre} ${result.data.usuario.apellido}`);
      console.log(`🏢 Rol: ${result.data.usuario.rol}`);
      return true;
    } else {
      console.log('❌ Login fallido:', result.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return false;
  }
}

// Test de búsqueda de colaboradores
async function testBuscarColaboradores() {
  console.log('\n🔍 Testing búsqueda de colaboradores...');
  
  const terminosBusqueda = ['123', 'García', '987654321'];
  
  for (const termino of terminosBusqueda) {
    try {
      console.log(`\n  Buscando: "${termino}"`);
      
      const response = await authenticatedRequest(`${BASE_URL}/colaboradores/buscar/${termino}?page=1&limit=5`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ Búsqueda exitosa para "${termino}"`);
        console.log(`📊 Total resultados: ${result.pagination?.total || 0}`);
        
        if (result.data && result.data.length > 0) {
          console.log(`👥 Primeros resultados:`);
          result.data.slice(0, 2).forEach(colaborador => {
            console.log(`   - ${colaborador.nombre} ${colaborador.apellido} (${colaborador.documento})`);
          });
        } else {
          console.log('   No se encontraron colaboradores');
        }
      } else {
        console.log(`❌ Error en búsqueda: ${result.message}`);
      }
    } catch (error) {
      console.error(`❌ Error en búsqueda "${termino}":`, error.message);
    }
  }
}

// Test de historial de jornadas
async function testHistorialJornadas() {
  console.log('\n📅 Testing historial de jornadas...');
  
  // Primero obtener un colaborador para probar
  try {
    const busquedaResponse = await authenticatedRequest(`${BASE_URL}/colaboradores/buscar/123?limit=1`);
    const busquedaResult = await busquedaResponse.json();
    
    if (!busquedaResult.success || !busquedaResult.data || busquedaResult.data.length === 0) {
      console.log('⚠️  No se encontraron colaboradores para probar historial');
      return;
    }
    
    const colaboradorId = busquedaResult.data[0].id;
    const nombreColaborador = `${busquedaResult.data[0].nombre} ${busquedaResult.data[0].apellido}`;
    
    console.log(`\n  Testing historial para: ${nombreColaborador} (ID: ${colaboradorId})`);
    
    // Probar sin filtros de fecha
    const response1 = await authenticatedRequest(`${BASE_URL}/colaboradores/${colaboradorId}/jornadas?page=1&limit=5`);
    const result1 = await response1.json();
    
    if (response1.ok && result1.success) {
      console.log('✅ Consulta de historial exitosa (sin filtros)');
      console.log(`📊 Total jornadas: ${result1.data.pagination?.total || 0}`);
      
      if (result1.data.jornadas && result1.data.jornadas.length > 0) {
        console.log('📋 Últimas jornadas:');
        result1.data.jornadas.slice(0, 2).forEach(jornada => {
          console.log(`   - ${jornada.fecha}: ${jornada.entrada || 'Sin entrada'} - ${jornada.salida || 'Sin salida'}`);
        });
      }
    } else {
      console.log(`❌ Error en historial: ${result1.message}`);
    }
    
    // Probar con filtros de fecha
    const fechaInicio = '2024-01-01';
    const fechaFin = '2024-12-31';
    
    const response2 = await authenticatedRequest(
      `${BASE_URL}/colaboradores/${colaboradorId}/jornadas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&page=1&limit=3`
    );
    const result2 = await response2.json();
    
    if (response2.ok && result2.success) {
      console.log('✅ Consulta de historial exitosa (con filtros de fecha)');
      console.log(`📊 Jornadas en período: ${result2.data.pagination?.total || 0}`);
    } else {
      console.log(`❌ Error en historial con filtros: ${result2.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error en test de historial:', error.message);
  }
}

// Test de ubicaciones GPS
async function testUbicacionesGPS() {
  console.log('\n🗺️  Testing ubicaciones GPS...');
  
  try {
    // Usar el mismo colaborador del test anterior
    const busquedaResponse = await authenticatedRequest(`${BASE_URL}/colaboradores/buscar/123?limit=1`);
    const busquedaResult = await busquedaResponse.json();
    
    if (!busquedaResult.success || !busquedaResult.data || busquedaResult.data.length === 0) {
      console.log('⚠️  No se encontraron colaboradores para probar ubicaciones GPS');
      return;
    }
    
    const colaboradorId = busquedaResult.data[0].id;
    const nombreColaborador = `${busquedaResult.data[0].nombre} ${busquedaResult.data[0].apellido}`;
    
    console.log(`\n  Testing ubicaciones GPS para: ${nombreColaborador} (ID: ${colaboradorId})`);
    
    const response = await authenticatedRequest(`${BASE_URL}/colaboradores/${colaboradorId}/ubicaciones?page=1&limit=10`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Consulta de ubicaciones GPS exitosa');
      console.log(`📍 Total registros GPS: ${result.data.total_registros || 0}`);
      
      if (result.data.ubicaciones && result.data.ubicaciones.length > 0) {
        console.log('🗺️  Primeras ubicaciones:');
        result.data.ubicaciones.slice(0, 3).forEach(ubicacion => {
          console.log(`   - ${ubicacion.fecha} ${ubicacion.hora} (${ubicacion.tipo}): ${ubicacion.latitud}, ${ubicacion.longitud}`);
        });
      } else {
        console.log('   No se encontraron registros GPS');
      }
    } else {
      console.log(`❌ Error en ubicaciones GPS: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error en test de ubicaciones GPS:', error.message);
  }
}

// Test de cálculo de horas extras
async function testCalculoHorasExtras() {
  console.log('\n⏰ Testing cálculo de horas extras...');
  
  try {
    // Usar el mismo colaborador
    const busquedaResponse = await authenticatedRequest(`${BASE_URL}/colaboradores/buscar/123?limit=1`);
    const busquedaResult = await busquedaResponse.json();
    
    if (!busquedaResult.success || !busquedaResult.data || busquedaResult.data.length === 0) {
      console.log('⚠️  No se encontraron colaboradores para probar cálculo de horas extras');
      return;
    }
    
    const colaboradorId = busquedaResult.data[0].id;
    const nombreColaborador = `${busquedaResult.data[0].nombre} ${busquedaResult.data[0].apellido}`;
    
    console.log(`\n  Testing cálculo horas extras para: ${nombreColaborador} (ID: ${colaboradorId})`);
    
    const payload = {
      colaborador_id: colaboradorId,
      fecha_inicio: '2024-10-01',
      fecha_fin: '2024-10-10',
      horas_legales_dia: 8
    };
    
    const response = await authenticatedRequest(`${BASE_URL}/colaboradores/horas-extras`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Cálculo de horas extras exitoso');
      
      if (result.data && result.data.totales) {
        const totales = result.data.totales;
        console.log('📊 Totales del período:');
        console.log(`   - Días trabajados: ${totales.dias_trabajados}`);
        console.log(`   - Horas trabajadas: ${totales.total_horas_trabajadas}h`);
        console.log(`   - Horas diurnas: ${totales.total_horas_diurnas}h`);
        console.log(`   - Horas nocturnas: ${totales.total_horas_nocturnas}h`);
        console.log(`   - Horas extras total: ${totales.total_horas_extras}h`);
        console.log(`   - Promedio horas/día: ${totales.promedio_horas_dia}h`);
      }
      
      if (result.data && result.data.calculo_diario && result.data.calculo_diario.length > 0) {
        console.log('\n📅 Ejemplo días trabajados:');
        result.data.calculo_diario.slice(0, 3).forEach(dia => {
          console.log(`   - ${dia.fecha}: ${dia.horas_trabajadas}h total (${dia.horas_extras_total}h extras)`);
        });
      }
    } else {
      console.log(`❌ Error en cálculo de horas extras: ${result.message}`);
      
      if (result.errors) {
        console.log('   Errores de validación:');
        result.errors.forEach(error => {
          console.log(`   - ${error.msg}: ${error.param}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error en test de cálculo horas extras:', error.message);
  }
}

// Test de validaciones y errores
async function testValidacionesErrores() {
  console.log('\n🛡️  Testing validaciones y manejo de errores...');
  
  const tests = [
    {
      name: 'Búsqueda con término muy corto',
      request: () => authenticatedRequest(`${BASE_URL}/colaboradores/buscar/12`)
    },
    {
      name: 'Historial con ID inválido',
      request: () => authenticatedRequest(`${BASE_URL}/colaboradores/999999/jornadas`)
    },
    {
      name: 'Ubicaciones con ID no numérico',
      request: () => authenticatedRequest(`${BASE_URL}/colaboradores/abc/ubicaciones`)
    },
    {
      name: 'Horas extras sin datos requeridos',
      request: () => authenticatedRequest(`${BASE_URL}/colaboradores/horas-extras`, {
        method: 'POST',
        body: JSON.stringify({})
      })
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n  Testing: ${test.name}`);
      const response = await test.request();
      const result = await response.json();
      
      if (!response.ok) {
        console.log(`✅ Error manejado correctamente (${response.status}): ${result.message}`);
      } else {
        console.log(`⚠️  Se esperaba error pero la respuesta fue exitosa`);
      }
    } catch (error) {
      console.log(`✅ Error capturado correctamente: ${error.message}`);
    }
  }
}

// Función principal de ejecución
async function runTests() {
  console.log('🚀 INICIANDO TESTS DEL MÓDULO DE CONSULTAS DE COLABORADORES');
  console.log('='.repeat(70));
  
  // Test de autenticación
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ No se pudo autenticar. Abortando tests.');
    return;
  }
  
  // Ejecutar todos los tests
  await testBuscarColaboradores();
  await testHistorialJornadas();
  await testUbicacionesGPS();
  await testCalculoHorasExtras();
  await testValidacionesErrores();
  
  console.log('\n' + '='.repeat(70));
  console.log('🏁 TESTS COMPLETADOS');
  console.log('✨ Módulo de Consultas de Colaboradores verificado');
}

// Ejecutar tests si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('💥 Error fatal en tests:', error);
    process.exit(1);
  });
}

export { runTests };