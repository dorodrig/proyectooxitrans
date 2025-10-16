// ================================================
// TEST DE VERIFICACIÓN DE USUARIOS EXISTENTES
// ================================================

const BASE_URL = 'http://localhost:3001/api';

async function testLogin(email, password) {
  try {
    console.log(`🔍 Probando login: ${email}`);
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Login exitoso: ${email}`);
      return { success: true, token: data.token, user: data.user };
    } else {
      console.log(`❌ Login fallido: ${email} - ${data.error || data.message}`);
      return { success: false, error: data.error || data.message };
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${email} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function listarUsuarios(adminToken) {
  try {
    console.log('\n📋 Obteniendo lista de usuarios...');
    const response = await fetch(`${BASE_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Usuarios encontrados: ${data.usuarios?.length || data.length || 0}`);
      const usuarios = data.usuarios || data;
      
      if (Array.isArray(usuarios)) {
        usuarios.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.nombre} (${user.email}) - ${user.tipo_usuario || 'N/A'}`);
        });
        return usuarios;
      } else {
        console.log('📄 Respuesta:', data);
        return [];
      }
    } else {
      console.log(`❌ Error obteniendo usuarios: ${data.message || 'Error desconocido'}`);
      return [];
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    return [];
  }
}

async function verificarUsuariosExistentes() {
  console.log('🔍 VERIFICANDO USUARIOS EXISTENTES EN EL SISTEMA');
  console.log('='.repeat(60));
  
  // Credenciales comunes a probar
  const credencialesPrueba = [
    { email: 'admin@oxitrans.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin' },
    { email: 'test@test.com', password: 'test123' },
    { email: 'empleado@oxitrans.com', password: 'empleado123' },
    { email: 'user@oxitrans.com', password: 'user123' }
  ];

  let adminToken = null;
  
  for (const cred of credencialesPrueba) {
    const result = await testLogin(cred.email, cred.password);
    if (result.success) {
      adminToken = result.token;
      console.log(`🔑 Token obtenido de ${cred.email}`);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (adminToken) {
    console.log('\n📊 Listando usuarios existentes...');
    const usuarios = await listarUsuarios(adminToken);
    
    if (usuarios.length > 0) {
      console.log('\n💡 USUARIOS DISPONIBLES PARA SIMULACIÓN:');
      console.log('─'.repeat(50));
      usuarios.forEach((user, index) => {
        if (user.tipo_usuario === 'empleado' || !user.tipo_usuario) {
          console.log(`   ✓ ${user.nombre} (${user.email})`);
        }
      });
    }
  } else {
    console.log('❌ No se pudo obtener acceso de administrador');
  }
}

// Ejecutar verificación
verificarUsuariosExistentes().catch(console.error);