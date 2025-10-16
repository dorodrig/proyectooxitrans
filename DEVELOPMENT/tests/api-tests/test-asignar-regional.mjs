// Test completo de la funcionalidad de asignación regional
// Usando fetch nativo de Node.js 18+

const API_BASE = 'http://localhost:3001/api';

async function testAsignarRegionalAPI() {
  try {
    console.log('🔐 Iniciando sesión como administrador...');
    
    // 1. Login como admin
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('❌ Error en login:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. Obtener lista de usuarios
    console.log('👥 Obteniendo lista de usuarios...');
    const usuariosResponse = await fetch(`${API_BASE}/usuarios`, {
      headers
    });

    const usuariosData = await usuariosResponse.json();
    console.log('Usuarios encontrados:', usuariosData.data?.usuarios?.length || 0);

    if (!usuariosData.success || !usuariosData.data?.usuarios?.length) {
      console.error('❌ No hay usuarios disponibles');
      return;
    }

    // 3. Obtener lista de regionales
    console.log('🏢 Obteniendo lista de regionales...');
    const regionalesResponse = await fetch(`${API_BASE}/regionales`, {
      headers
    });

    const regionalesData = await regionalesResponse.json();
    console.log('Regionales encontradas:', regionalesData.data?.length || 0);

    if (!regionalesData.success || !regionalesData.data?.length) {
      console.error('❌ No hay regionales disponibles');
      return;
    }

    // 4. Seleccionar usuario para prueba (que no sea el admin)
    const usuarioPrueba = usuariosData.data.usuarios.find(u => u.documento !== '12345678') || usuariosData.data.usuarios[0];
    const regionalPrueba = regionalesData.data[0];
    const tipoUsuarioPrueba = 'visita';

    console.log(`🧪 Probando asignación vía API:`);
    console.log(`   Usuario: ${usuarioPrueba.nombre} ${usuarioPrueba.apellido} (ID: ${usuarioPrueba.id})`);
    console.log(`   Regional: ${regionalPrueba.nombre} (ID: ${regionalPrueba.id})`);
    console.log(`   Tipo: ${tipoUsuarioPrueba}`);

    // 5. Realizar asignación
    const asignacionResponse = await fetch(`${API_BASE}/usuarios/${usuarioPrueba.id}/regional`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        regionalId: regionalPrueba.id,
        tipoUsuario: tipoUsuarioPrueba
      })
    });

    const asignacionData = await asignacionResponse.json();
    console.log('📊 Resultado de asignación:', asignacionData);

    if (!asignacionData.success) {
      console.error('❌ Error en asignación:', asignacionData.message);
      return;
    }

    // 6. Verificar que se aplicó el cambio
    console.log('🔍 Verificando cambios vía API...');
    const verificacionResponse = await fetch(`${API_BASE}/usuarios/${usuarioPrueba.id}`, {
      headers
    });

    const verificacionData = await verificacionResponse.json();
    console.log('✅ Usuario actualizado:', verificacionData.data);

    // 7. Obtener lista actualizada de usuarios para verificar
    console.log('📋 Obteniendo lista actualizada...');
    const usuariosActualizadosResponse = await fetch(`${API_BASE}/usuarios`, {
      headers
    });

    const usuariosActualizadosData = await usuariosActualizadosResponse.json();
    const usuarioActualizado = usuariosActualizadosData.data.usuarios.find(u => u.id === usuarioPrueba.id);
    
    console.log('🎯 Usuario en lista actualizada:');
    console.log({
      id: usuarioActualizado.id,
      nombre: usuarioActualizado.nombre,
      apellido: usuarioActualizado.apellido,
      documento: usuarioActualizado.documento,
      regional_id: usuarioActualizado.regional_id,
      tipo_usuario: usuarioActualizado.tipo_usuario,
      regionalNombre: usuarioActualizado.regionalNombre
    });

    console.log('✅ Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testAsignarRegionalAPI();