// Test de diagnóstico para creación de usuarios
// Este test enviará solo un usuario y mostrará la respuesta completa

const BASE_URL = 'http://localhost:3001/api';

async function loginAdmin() {
  try {
    console.log('🔐 Login como administrador...');
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login exitoso');
      return data.data?.token || data.token;
    } else {
      console.log(`❌ Error login: ${JSON.stringify(data, null, 2)}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión en login:', error.message);
    return null;
  }
}

async function testCrearUsuario(adminToken) {
  const usuarioTest = {
    nombre: 'Carlos Andrés',
    apellido: 'Rodríguez García',
    documento: '12345001',
    tipoDocumento: 'CC', 
    email: 'carlos.rodriguez@oxitrans.com',
    telefono: '3001234567',
    rol: 'empleado',
    cargo: 'Conductor Senior',
    departamento: 'Operaciones',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  };

  try {
    console.log('\n📤 Datos a enviar:');
    console.log(JSON.stringify(usuarioTest, null, 2));

    console.log('\n👤 Creando usuario de prueba...');
    
    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuarioTest)
    });

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📋 Response Headers:');
    for (let [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }

    const responseText = await response.text();
    console.log('\n📄 Raw Response:');
    console.log(responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('\n📦 Parsed Response:');
      console.log(JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.log('\n❌ No se pudo parsear como JSON');
    }

    return response.ok;
  } catch (error) {
    console.log(`\n❌ Error de conexión: ${error.message}`);
    return false;
  }
}

async function ejecutarDiagnostico() {
  console.log('🔍 DIAGNÓSTICO DE CREACIÓN DE USUARIOS');
  console.log('='.repeat(50));

  const adminToken = await loginAdmin();
  if (!adminToken) {
    console.error('💥 No se pudo obtener token de administrador');
    return;
  }

  console.log(`🎫 Token obtenido: ${adminToken.substring(0, 20)}...`);

  await testCrearUsuario(adminToken);
}

ejecutarDiagnostico().catch(error => {
  console.error('💥 Error fatal:', error);
});