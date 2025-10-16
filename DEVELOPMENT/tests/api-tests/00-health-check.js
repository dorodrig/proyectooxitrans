/**
 * 🏥 TEST DE HEALTH CHECK
 * Verifica que el servidor esté funcionando correctamente
 */

const API_BASE_URL = 'http://localhost:3001';

async function testHealthCheck() {
  console.log('🏥 === TEST DE HEALTH CHECK ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/health');
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Health check EXITOSO');
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Health check FALLÓ');
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
    }
    
    return response.ok && data.success;
  } catch (error) {
    console.log('❌ ERROR en health check:', error.message);
    return false;
  }
}

async function testRootEndpoint() {
  console.log('\n📡 Probando endpoint: GET /');
  
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Root endpoint EXITOSO');
      console.log('📊 Endpoints disponibles:', JSON.stringify(data.endpoints, null, 2));
    } else {
      console.log('❌ Root endpoint FALLÓ');
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
    }
    
    return response.ok && data.success;
  } catch (error) {
    console.log('❌ ERROR en root endpoint:', error.message);
    return false;
  }
}

// Ejecutar tests
async function runHealthTests() {
  const healthResult = await testHealthCheck();
  const rootResult = await testRootEndpoint();
  
  console.log('\n🎯 === RESUMEN HEALTH TESTS ===');
  console.log(`Health Check: ${healthResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Root Endpoint: ${rootResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Estado general: ${healthResult && rootResult ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  
  return healthResult && rootResult;
}

// Si se ejecuta directamente
if (require.main === module) {
  runHealthTests();
}

module.exports = { runHealthTests };
