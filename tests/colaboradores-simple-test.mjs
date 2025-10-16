/**
 * Test simple de APIs del Módulo de Colaboradores
 */

const BASE_URL = 'http://localhost:3001/api';

console.log('🚀 INICIANDO TESTS SIMPLES DEL MÓDULO DE COLABORADORES');

// Test básico de conexión
async function testHealth() {
  console.log('\n💓 Testing conexión...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Servidor conectado correctamente');
      return true;
    } else {
      console.log('❌ Servidor no responde correctamente');
      return false;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return false;
  }
}

// Test de login
async function testLogin() {
  console.log('\n🔐 Testing login...');
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });

    const result = await response.json();
    
    if (result.success && result.data?.token) {
      console.log('✅ Login exitoso');
      return result.data.token;
    } else {
      console.log('❌ Login fallido:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error en login:', error.message);
    return null;
  }
}

// Test búsqueda de colaboradores
async function testBusqueda(token) {
  console.log('\n🔍 Testing búsqueda de colaboradores...');
  try {
    const response = await fetch(`${BASE_URL}/colaboradores/buscar/123`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Búsqueda exitosa');
      console.log(`📊 Total: ${result.pagination?.total || 0} colaboradores`);
      return true;
    } else {
      console.log('❌ Error en búsqueda:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error en búsqueda:', error.message);
    return false;
  }
}

// Ejecutar todos los tests
async function runSimpleTests() {
  console.log('=' * 50);
  
  // 1. Test de conexión
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ Abortando - servidor no disponible');
    return;
  }
  
  // 2. Test de login
  const token = await testLogin();
  if (!token) {
    console.log('\n❌ Abortando - no se pudo autenticar');
    return;
  }
  
  // 3. Test de búsqueda
  await testBusqueda(token);
  
  console.log('\n🏁 TESTS COMPLETADOS');
}

// Ejecutar
runSimpleTests().catch(error => {
  console.error('💥 Error fatal:', error);
});