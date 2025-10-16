// ================================================
// TEST: ASIGNAR CONTRASEÑAS A USUARIOS CREADOS  
// Los usuarios necesitan contraseñas para hacer login
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// Usuarios que necesitan contraseñas
const usuariosParaPassword = [
  { documento: '12345001', password: 'pass123' },
  { documento: '12345002', password: 'pass123' },
  { documento: '12345003', password: 'pass123' },
  { documento: '12345004', password: 'pass123' },
  { documento: '12345005', password: 'pass123' },
  { documento: '12345006', password: 'pass123' },
  { documento: '12345007', password: 'pass123' },
  { documento: '12345008', password: 'pass123' },
  { documento: '12345009', password: 'pass123' },
  { documento: '12345010', password: 'pass123' }
];

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
      console.log('✅ Login admin exitoso');
      return data.data?.token || data.token;
    } else {
      console.log(`❌ Error login admin: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return null;
  }
}

async function obtenerUsuarios(adminToken) {
  try {
    console.log('📋 Obteniendo usuarios...');
    
    const response = await fetch(`${BASE_URL}/usuarios?limit=50`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      return data.data?.usuarios || [];
    } else {
      console.log(`❌ Error obteniendo usuarios: ${data.message}`);
      return [];
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    return [];
  }
}

async function asignarPassword(adminToken, userId, documento, password) {
  try {
    console.log(`🔑 Reseteando contraseña para usuario ${documento}...`);
    
    const response = await fetch(`${BASE_URL}/usuarios/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      const tempPassword = data.data?.tempPassword;
      console.log(`   ✅ Contraseña temporal generada: ${tempPassword}`);
      return { success: true, password: tempPassword };
    } else {
      console.log(`   ❌ Error reseteando contraseña: ${data.message}`);
      return { success: false, password: null };
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    return { success: false, password: null };
  }
}

async function verificarLogin(documento, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Login verificado correctamente`);
      return true;
    } else {
      console.log(`   ❌ Login falló: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error verificando login: ${error.message}`);
    return false;
  }
}

async function ejecutarAsignacionPasswords() {
  console.log('🔑 ASIGNANDO CONTRASEÑAS A USUARIOS');
  console.log('='.repeat(50));
  console.log(`👥 Total usuarios: ${usuariosParaPassword.length}`);
  console.log('🔒 Contraseña por defecto: "pass123"');
  console.log('='.repeat(50));

  const adminToken = await loginAdmin();
  if (!adminToken) {
    console.error('💥 No se pudo obtener token de administrador');
    return;
  }

  const usuarios = await obtenerUsuarios(adminToken);
  if (usuarios.length === 0) {
    console.error('💥 No se pudieron obtener usuarios');
    return;
  }

  console.log('\n🔑 INICIANDO ASIGNACIÓN DE CONTRASEÑAS...');
  console.log('─'.repeat(50));

  let passwordsAsignadas = 0;
  let passwordsFallidas = 0;

  const passwordsGeneradas = [];

  for (const userPass of usuariosParaPassword) {
    const usuario = usuarios.find(u => u.documento === userPass.documento);
    
    if (!usuario) {
      console.log(`❌ Usuario con documento ${userPass.documento} no encontrado`);
      passwordsFallidas++;
      continue;
    }

    try {
      const resultado = await asignarPassword(adminToken, usuario.id, userPass.documento, userPass.password);
      
      if (resultado.success && resultado.password) {
        // Verificar que el login funciona con la contraseña temporal
        await new Promise(resolve => setTimeout(resolve, 500));
        const loginExito = await verificarLogin(userPass.documento, resultado.password);
        
        if (loginExito) {
          passwordsAsignadas++;
          passwordsGeneradas.push({
            documento: userPass.documento,
            nombre: usuario.nombre + ' ' + usuario.apellido,
            password: resultado.password
          });
        } else {
          passwordsFallidas++;
        }
      } else {
        passwordsFallidas++;
      }
    } catch (error) {
      console.log(`❌ Error con usuario ${userPass.documento}: ${error.message}`);
      passwordsFallidas++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('   ' + '─'.repeat(40));
  }

  console.log('\n🎉 ASIGNACIÓN DE CONTRASEÑAS COMPLETADA');
  console.log('='.repeat(50));
  console.log(`✅ Contraseñas asignadas: ${passwordsAsignadas}`);
  console.log(`❌ Contraseñas fallidas: ${passwordsFallidas}`);
  console.log(`📈 Tasa de éxito: ${((passwordsAsignadas / usuariosParaPassword.length) * 100).toFixed(1)}%`);

  if (passwordsGeneradas.length > 0) {
    console.log('\n🔑 CONTRASEÑAS GENERADAS:');
    console.log('─'.repeat(50));
    passwordsGeneradas.forEach(user => {
      console.log(`👤 ${user.nombre} (${user.documento}): ${user.password}`);
    });
  }

  if (passwordsAsignadas === usuariosParaPassword.length) {
    console.log('\n🎯 ¡TODOS LOS USUARIOS TIENEN CONTRASEÑAS!');
    console.log('✅ Ahora puedes ejecutar la simulación de jornadas');
    console.log('📝 Comando: node tests/simulacion-jornadas-15-dias-v2.mjs');
  }

  console.log('\n💾 Guarda las contraseñas generadas para usarlas en la simulación');
}

console.log('🔑 ASIGNANDO CONTRASEÑAS A USUARIOS CREADOS');
console.log('⚠️  Los usuarios necesitan contraseñas para hacer login en la simulación');
console.log('🔒 Se asignará la contraseña "pass123" a todos los empleados');
console.log('⏳ Iniciando en 2 segundos...\n');

setTimeout(() => {
  ejecutarAsignacionPasswords().catch(error => {
    console.error('💥 Error fatal:', error);
  });
}, 2000);