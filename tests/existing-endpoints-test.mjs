/**
 * Test de endpoint existente para verificar sistema base
 */

const BASE_URL = 'http://localhost:3001/api';

async function testExistingEndpoints() {
  console.log('🔍 TESTING ENDPOINTS EXISTENTES');
  
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

  // 2. Test endpoint usuarios existente
  console.log('\n📋 Testing endpoint usuarios...');
  
  try {
    const response = await fetch(`${BASE_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status usuarios:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Endpoint usuarios funciona');
      console.log('Total usuarios:', result.data?.length || 0);
    } else {
      const error = await response.text();
      console.log('❌ Error en usuarios:', error);
    }
    
  } catch (error) {
    console.log('❌ Error fetch usuarios:', error.message);
  }
}

testExistingEndpoints().catch(console.error);