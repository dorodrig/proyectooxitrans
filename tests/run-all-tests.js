/**
 * 🚀 TEST MAESTRO - TODOS LOS ENDPOINTS
 * Ejecuta todos los tests de la API en secuencia
 */

const { runHealthTests } = require('./00-health-check');
const { runAuthTests } = require('./01-auth-tests');
const { runUsersTests } = require('./02-users-tests');
const { runCargosTests } = require('./03-cargos-tests');
const { runRegistrosTests } = require('./04-registros-tests');

async function runAllTests() {
  console.log('🎯 ========================================');
  console.log('🚀 EJECUTANDO TODOS LOS TESTS DE LA API');
  console.log('🎯 ========================================\n');
  
  const startTime = Date.now();
  const results = {};
  
  try {
    // 1. Health Check
    console.log('1️⃣ Health Check...');
    results.health = await runHealthTests();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Authentication Tests
    console.log('2️⃣ Authentication Tests...');
    results.auth = await runAuthTests();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Users Tests
    console.log('3️⃣ Users Management Tests...');
    results.users = await runUsersTests();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Cargos Tests
    console.log('4️⃣ Cargos Management Tests...');
    results.cargos = await runCargosTests();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 5. Registros Tests
    console.log('5️⃣ Registros Management Tests...');
    results.registros = await runRegistrosTests();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Mostrar resumen final
    showFinalSummary(results, startTime);
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO durante la ejecución de tests:', error);
    return false;
  }
}

function showFinalSummary(results, startTime) {
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('🎯 ========================================');
  console.log('📊 RESUMEN FINAL DE TODOS LOS TESTS');
  console.log('🎯 ========================================\n');
  
  console.log('📋 RESULTADOS POR MÓDULO:');
  console.log(`   Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Authentication: ${results.auth?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Users Management: ${results.users?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Cargos Management: ${results.cargos?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Registros Management: ${results.registros?.success ? '✅ PASS' : '❌ FAIL'}`);
  
  // Calcular estadísticas
  const totalModules = 5;
  const passedModules = [
    results.health,
    results.auth?.success,
    results.users?.success,
    results.cargos?.success,
    results.registros?.success
  ].filter(Boolean).length;
  
  const successRate = ((passedModules / totalModules) * 100).toFixed(1);
  
  console.log('\n📊 ESTADÍSTICAS GENERALES:');
  console.log(`   Módulos probados: ${totalModules}`);
  console.log(`   Módulos exitosos: ${passedModules}`);
  console.log(`   Tasa de éxito: ${successRate}%`);
  console.log(`   Tiempo total: ${duration} segundos`);
  
  if (passedModules === totalModules) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!');
    console.log('✅ La API está funcionando correctamente');
    console.log('🚀 Lista para producción');
  } else {
    console.log('\n⚠️  ALGUNOS TESTS FALLARON');
    console.log('❌ Revisar los módulos que fallaron antes de deploy');
    console.log('🔧 Corregir errores y volver a ejecutar tests');
  }
  
  console.log('\n🎯 ========================================');
  
  return passedModules === totalModules;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ ERROR ejecutando tests:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
