/**
 * Test para verificar que el endpoint está registrado
 */

const BASE_URL = 'http://localhost:3001/api';

async function testEndpointExists() {
  console.log('🔍 VERIFICANDO ENDPOINT DE COLABORADORES');
  
  // 1. Login
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
    console.log('❌ Login fallido');
    return;
  }

  const token = loginResult.data.token;
  console.log('✅ Login exitoso');

  // 2. Test con término corto para verificar validación
  console.log('\n🔍 Testing validación (término muy corto)...');
  
  try {
    const response = await fetch(`${BASE_URL}/colaboradores/buscar/12`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    const result = await response.json();
    console.log('Respuesta:', result);
    
    // Si es 400, es bueno - significa que nuestro endpoint funciona y las validaciones también
    if (response.status === 400) {
      console.log('✅ Endpoint registrado y validación funcionando');
    } else if (response.status === 500) {
      console.log('⚠️  Endpoint registrado pero hay error interno');
    } else if (response.status === 404) {
      console.log('❌ Endpoint NO registrado');
    }
    
  } catch (error) {
    console.log('❌ Error en fetch:', error.message);
  }
}

testEndpointExists().catch(console.error);