// ================================================
// DIAGNÓSTICO: REGISTRO DE TIEMPO
// Test para verificar qué está fallando en el registro de eventos
// ================================================

const BASE_URL = 'http://localhost:3001/api';

async function testRegistroTiempo() {
  console.log('🔍 DIAGNÓSTICO DE REGISTRO DE TIEMPO');
  console.log('='.repeat(50));

  // Usar usuario con contraseña conocida
  const documento = '12345001';
  const password = 'gsv2hfke';

  try {
    // 1. Login
    console.log('🔐 1. Testeando login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento, password })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log(`❌ Login falló: ${loginData.message}`);
      return;
    }

    const token = loginData.data?.token || loginData.token;
    console.log(`✅ Login exitoso, token: ${token.substring(0, 20)}...`);

    // 2. Test registro básico
    console.log('\n⏰ 2. Testeando registro de entrada...');
    
    const registroData = {
      tipo: 'entrada',
      timestamp: new Date().toISOString(),
      ubicacion: {
        latitude: 5.8245,
        longitude: -73.0198,
        accuracy: 10.5
      }
    };

    console.log('📤 Datos a enviar:');
    console.log(JSON.stringify(registroData, null, 2));

    const registroResponse = await fetch(`${BASE_URL}/jornadas/registrar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registroData)
    });

    console.log(`\n📊 Response Status: ${registroResponse.status} ${registroResponse.statusText}`);
    
    const registroResponseText = await registroResponse.text();
    console.log('📄 Raw Response:');
    console.log(registroResponseText);

    try {
      const registroResponseData = JSON.parse(registroResponseText);
      console.log('\n📦 Parsed Response:');
      console.log(JSON.stringify(registroResponseData, null, 2));
    } catch (parseError) {
      console.log('\n❌ No se pudo parsear la respuesta como JSON');
    }

    if (registroResponse.ok) {
      console.log('\n✅ Registro de tiempo exitoso!');
    } else {
      console.log('\n❌ Registro de tiempo falló');
    }

  } catch (error) {
    console.error('💥 Error en diagnóstico:', error.message);
  }
}

console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE REGISTRO DE TIEMPO');
console.log('📋 Verificará login y registro de eventos paso a paso');
console.log('⏳ Iniciando en 2 segundos...\n');

setTimeout(() => {
  testRegistroTiempo().catch(error => {
    console.error('💥 Error fatal:', error);
  });
}, 2000);