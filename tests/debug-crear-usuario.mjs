// ================================================
// TEST DEBUG - CREAR USUARIO
// ================================================

const BASE_URL = 'http://localhost:3001/api';

async function testCrearUsuario() {
  try {
    // 1. Login admin
    console.log('🔐 Login administrador...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    if (!token) {
      console.log('❌ No se pudo obtener token');
      return;
    }

    console.log('✅ Token obtenido');

    // 2. Probar crear usuario
    const usuarioTest = {
      nombre: 'Test',
      apellido: 'Usuario',
      documento: '99999999',
      tipoDocumento: 'CC',
      email: 'test.usuario@oxitrans.com',
      telefono: '3009999999',
      rol: 'empleado',
      cargo: 'Tester',
      departamento: 'Testing',
      fechaIngreso: '2024-10-07'
    };

    console.log('👤 Creando usuario de prueba...');
    console.log('📤 Datos enviados:', JSON.stringify(usuarioTest, null, 2));

    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuarioTest)
    });

    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📥 Respuesta completa:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Usuario creado exitosamente');
    } else {
      console.log('❌ Error creando usuario');
      
      if (data.errors) {
        console.log('📝 Errores de validación:');
        data.errors.forEach(error => {
          console.log(`   - ${error.param}: ${error.msg}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Ejecutar test
testCrearUsuario();