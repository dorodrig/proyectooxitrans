/**
 * Test de debugging para el módulo de colaboradores
 */

const BASE_URL = 'http://localhost:3001/api';

console.log('🔧 INICIANDO TEST DE DEBUG');

// Test con token válido
async function testWithAuth() {
  console.log('\n🔐 Obteniendo token...');
  
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      documento: '12345678',
      password: 'admin123'
    })
  });

  const loginResult = await loginResponse.json();
  
  if (!loginResult.success) {
    console.log('❌ Login fallido:', loginResult.message);
    return;
  }

  const token = loginResult.data.token;
  console.log('✅ Token obtenido');

  // Test búsqueda con término válido
  console.log('\n🔍 Testing búsqueda básica...');
  
  try {
    const response = await fetch(`${BASE_URL}/colaboradores/buscar/test`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    const result = await response.text(); // Usar text() primero para ver qué devuelve
    console.log('Raw response:', result);
    
    try {
      const jsonResult = JSON.parse(result);
      console.log('Parsed JSON:', jsonResult);
    } catch (e) {
      console.log('No es JSON válido');
    }
    
  } catch (error) {
    console.log('❌ Error en fetch:', error.message);
  }
}

// Ejecutar
testWithAuth().catch(error => {
  console.error('💥 Error:', error);
});