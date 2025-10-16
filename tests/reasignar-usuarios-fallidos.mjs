// ================================================
// TEST: REASIGNAR USUARIOS FALLIDOS A REGIONALES DISPONIBLES
// Reasigna Diego (12345005) y Sandra (12345010) a regionales que funcionan
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// Reasignaciones para los usuarios que fallaron
const reasignaciones = [
  { documento: '12345005', regional_id: 66, nombre: 'Diego Alejandro Ruiz Castro' }, // → Bucaramanga
  { documento: '12345010', regional_id: 71, nombre: 'Sandra Milena Jiménez Torres' }  // → Neiva
];

// Nombres de las regionales
const nombresRegionales = {
  66: 'Bucaramanga',
  71: 'Neiva'
};

async function loginAdmin() {
  try {
    console.log('🔐 Intentando login como administrador...');
    
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
      console.log('✅ Login de administrador exitoso');
      return data.data?.token || data.token;
    } else {
      console.log(`❌ Error login admin: ${data.message || data.error}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión en login admin:', error.message);
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
      console.log(`❌ Error obteniendo usuarios: ${data.message || data.error}`);
      return [];
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    return [];
  }
}

async function actualizarUsuarioRegional(adminToken, userId, regionalId, documento, nombre) {
  try {
    const nombreRegional = nombresRegionales[regionalId];
    console.log(`👤 Reasignando ${nombre} (${documento}) → ${nombreRegional} (ID: ${regionalId})`);
    
    const response = await fetch(`${BASE_URL}/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        regional_id: regionalId
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Usuario reasignado exitosamente a ${nombreRegional}`);
      return true;
    } else {
      console.log(`   ❌ Error reasignando usuario: ${data.message || data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    return false;
  }
}

async function ejecutarReasignaciones() {
  console.log('🔄 REASIGNANDO USUARIOS FALLIDOS');
  console.log('='.repeat(50));
  console.log(`📊 Total reasignaciones: ${reasignaciones.length}`);
  console.log('📍 Usando regionales que funcionan correctamente');
  console.log('='.repeat(50));

  // Login como administrador
  const adminToken = await loginAdmin();
  if (!adminToken) {
    console.error('💥 No se pudo obtener token de administrador');
    return;
  }

  // Obtener usuarios
  const usuarios = await obtenerUsuarios(adminToken);
  if (usuarios.length === 0) {
    console.error('💥 No se pudieron obtener usuarios');
    return;
  }

  console.log('\n🔄 INICIANDO REASIGNACIONES...');
  console.log('─'.repeat(50));

  let reasignacionesExitosas = 0;

  for (const reasignacion of reasignaciones) {
    // Buscar usuario por documento
    const usuario = usuarios.find(u => u.documento === reasignacion.documento);
    
    if (!usuario) {
      console.log(`❌ Usuario con documento ${reasignacion.documento} no encontrado`);
      continue;
    }

    const exito = await actualizarUsuarioRegional(
      adminToken,
      usuario.id,
      reasignacion.regional_id,
      reasignacion.documento,
      reasignacion.nombre
    );

    if (exito) {
      reasignacionesExitosas++;
    }

    // Pausa entre actualizaciones
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('   ' + '─'.repeat(40));
  }

  console.log('\n🎉 REASIGNACIONES COMPLETADAS');
  console.log('='.repeat(50));
  console.log(`✅ Reasignaciones exitosas: ${reasignacionesExitosas}/${reasignaciones.length}`);
  console.log(`📈 Tasa de éxito: ${((reasignacionesExitosas / reasignaciones.length) * 100).toFixed(1)}%`);

  if (reasignacionesExitosas === reasignaciones.length) {
    console.log('\n🎯 ¡TODOS LOS USUARIOS TIENEN REGIONAL ASIGNADA!');
    console.log('✅ Ahora puedes ejecutar la simulación de jornadas');
    console.log('📝 Comando: node tests/simulacion-jornadas-completa.mjs');
  }

  console.log('\n💾 Verifica la base de datos para confirmar las reasignaciones');
}

console.log('🔄 REASIGNANDO USUARIOS A REGIONALES DISPONIBLES');
console.log('⚠️  Los usuarios Diego (12345005) y Sandra (12345010) serán reasignados');
console.log('📍 Diego → Bucaramanga (66) | Sandra → Neiva (71)');
console.log('⏳ Iniciando en 2 segundos...\n');

setTimeout(() => {
  ejecutarReasignaciones().catch(error => {
    console.error('💥 Error fatal en reasignaciones:', error);
  });
}, 2000);