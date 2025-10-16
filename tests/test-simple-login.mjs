// ================================================
// TEST SIMPLE DE LOGIN Y CREACIÓN
// ================================================

const BASE_URL = 'http://localhost:3001/api';

async function testLoginAdmin() {
  try {
    console.log('🔐 Probando login de administrador...');
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('📄 Respuesta completa:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login exitoso');
      const token = data.data?.token || data.token;
      console.log('🔑 Token recibido:', token ? 'SÍ' : 'NO');
      return token;
    } else {
      console.log(`❌ Login falló: ${data.message || data.error}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return null;
  }
}

async function testCrearRegional(token) {
  try {
    console.log('🏢 Probando crear regional...');
    
    const regionalTest = {
      nombre: 'Regional Test',
      descripcion: 'Regional de prueba - Dirección de ejemplo',
      latitud: 4.6097,
      longitud: -74.0817
    };

    const response = await fetch(`${BASE_URL}/regionales`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(regionalTest)
    });

    const data = await response.json();
    console.log('📄 Respuesta crear regional:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Regional creada exitosamente');
      return data;
    } else {
      console.log(`❌ Error creando regional: ${data.message || data.error}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión creando regional:', error.message);
    return null;
  }
}

async function ejecutarTest() {
  console.log('🚀 TEST SIMPLE DE FUNCIONALIDAD');
  console.log('='.repeat(50));
  
  const token = await testLoginAdmin();
  
  if (token) {
    console.log('\n🏢 Probando crear regional con token válido...');
    const regional = await testCrearRegional(token);
    
    if (regional) {
      console.log('🎉 Test exitoso: Login y creación funcionan correctamente');
    } else {
      console.log('❌ Test parcial: Login OK, pero falla creación');
    }
  } else {
    console.log('❌ Test fallido: No se pudo obtener token');
  }
}

// Ejecutar
ejecutarTest().catch(console.error);