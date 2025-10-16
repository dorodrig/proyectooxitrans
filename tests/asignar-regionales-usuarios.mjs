// ================================================
// TEST: ASIGNAR REGIONALES A USUARIOS EXISTENTES
// Actualiza los usuarios creados con regional_id
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// IDs reales de las regionales (según imagen de BD)
const regionalesDisponibles = [62, 66, 67, 68, 71, 72, 77];

// Mapeo de usuarios a regionales según sus documentos
const asignacionesRegionales = [
  { documento: '12345001', regional_id: 72 }, // Carlos Andrés → Duitama
  { documento: '12345002', regional_id: 66 }, // María Fernanda → Bucaramanga  
  { documento: '12345003', regional_id: 67 }, // Juan Pablo → Barranquilla
  { documento: '12345004', regional_id: 68 }, // Ana Sofía → Drummond
  { documento: '12345005', regional_id: 62 }, // Diego Alejandro → Bogotá
  { documento: '12345006', regional_id: 77 }, // Claudia Patricia → Cartagena
  { documento: '12345007', regional_id: 71 }, // Roberto Carlos → Neiva
  { documento: '12345008', regional_id: 72 }, // Luisa Fernanda → Duitama
  { documento: '12345009', regional_id: 66 }, // Andrés Felipe → Bucaramanga
  { documento: '12345010', regional_id: 62 }  // Sandra Milena → Bogotá
];

// Nombres de las regionales para mostrar
const nombresRegionales = {
  62: 'Bogotá',
  66: 'Bucaramanga', 
  67: 'Barranquilla',
  68: 'Drummond',
  71: 'Neiva',
  72: 'Duitama',
  77: 'Cartagena'
};

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

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
    console.log('📋 Obteniendo lista de usuarios...');
    
    const response = await fetch(`${BASE_URL}/usuarios?limit=50`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Se obtuvieron ${data.data?.usuarios?.length || 0} usuarios`);
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

async function actualizarUsuarioRegional(adminToken, userId, regionalId, documento) {
  try {
    const nombreRegional = nombresRegionales[regionalId];
    console.log(`👤 Actualizando usuario ${documento} → ${nombreRegional} (ID: ${regionalId})`);
    
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
      console.log(`   ✅ Usuario actualizado exitosamente`);
      return true;
    } else {
      console.log(`   ❌ Error actualizando usuario: ${data.message || data.error}`);
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(error => {
          console.log(`      • ${error.msg || error.message} (${error.param || error.field})`);
        });
      }
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    return false;
  }
}

// ================================================
// FUNCIÓN PRINCIPAL
// ================================================

async function ejecutarAsignacionRegionales() {
  console.log('🏢 ASIGNANDO REGIONALES A USUARIOS');
  console.log('='.repeat(60));
  console.log(`📊 Total asignaciones a realizar: ${asignacionesRegionales.length}`);
  console.log('📍 Usando regionales existentes con IDs reales');
  console.log('='.repeat(60));

  // Login como administrador
  const adminToken = await loginAdmin();
  if (!adminToken) {
    console.error('💥 No se pudo obtener token de administrador. Abortando...');
    return;
  }

  // Obtener usuarios actuales
  const usuarios = await obtenerUsuarios(adminToken);
  if (usuarios.length === 0) {
    console.error('💥 No se pudieron obtener usuarios. Abortando...');
    return;
  }

  console.log('\n📋 USUARIOS ENCONTRADOS EN BASE DE DATOS:');
  console.log('─'.repeat(60));
  usuarios.forEach(user => {
    const regionalActual = user.regional_id ? `Regional ID: ${user.regional_id}` : 'Sin regional';
    console.log(`   • ${user.nombre} ${user.apellido} (${user.documento}) - ${regionalActual}`);
  });

  console.log('\n🏢 INICIANDO ASIGNACIÓN DE REGIONALES...');
  console.log('─'.repeat(60));

  let asignacionesExitosas = 0;
  let asignacionesFallidas = 0;
  const resultados = [];

  // Procesar cada asignación
  for (let i = 0; i < asignacionesRegionales.length; i++) {
    const asignacion = asignacionesRegionales[i];
    
    // Buscar el usuario por documento
    const usuario = usuarios.find(u => u.documento === asignacion.documento);
    
    if (!usuario) {
      console.log(`❌ Usuario con documento ${asignacion.documento} no encontrado`);
      asignacionesFallidas++;
      continue;
    }

    try {
      const exito = await actualizarUsuarioRegional(
        adminToken, 
        usuario.id, 
        asignacion.regional_id,
        asignacion.documento
      );
      
      if (exito) {
        asignacionesExitosas++;
        resultados.push({
          usuario: `${usuario.nombre} ${usuario.apellido}`,
          documento: usuario.documento,
          regional_id: asignacion.regional_id,
          regional_nombre: nombresRegionales[asignacion.regional_id]
        });
      } else {
        asignacionesFallidas++;
      }
    } catch (error) {
      console.log(`   ❌ Error inesperado con ${usuario.nombre}: ${error.message}`);
      asignacionesFallidas++;
    }
    
    // Pausa entre actualizaciones
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Separador visual
    if (i < asignacionesRegionales.length - 1) {
      console.log('   ' + '─'.repeat(50));
    }
  }

  // ============================================
  // RESUMEN FINAL
  // ============================================

  console.log('\n🎉 ASIGNACIÓN DE REGIONALES COMPLETADA');
  console.log('='.repeat(60));
  console.log(`✅ Asignaciones exitosas: ${asignacionesExitosas}`);
  console.log(`❌ Asignaciones fallidas: ${asignacionesFallidas}`);
  console.log(`📊 Total procesadas: ${asignacionesExitosas + asignacionesFallidas}`);
  console.log(`📈 Tasa de éxito: ${((asignacionesExitosas / asignacionesRegionales.length) * 100).toFixed(1)}%`);

  if (resultados.length > 0) {
    console.log('\n👥 USUARIOS ASIGNADOS POR REGIONAL:');
    console.log('─'.repeat(60));
    
    // Agrupar por regional
    const usuariosPorRegional = {};
    resultados.forEach(result => {
      if (!usuariosPorRegional[result.regional_nombre]) {
        usuariosPorRegional[result.regional_nombre] = [];
      }
      usuariosPorRegional[result.regional_nombre].push(result);
    });

    Object.keys(usuariosPorRegional).forEach(regional => {
      const usuarios = usuariosPorRegional[regional];
      console.log(`📍 ${regional.toUpperCase()}: ${usuarios.length} usuarios`);
      usuarios.forEach(user => {
        console.log(`   • ${user.usuario} (${user.documento})`);
      });
      console.log('');
    });

    console.log('🎯 PRÓXIMO PASO:');
    console.log('✓ Los usuarios ahora tienen regionales asignadas');
    console.log('✓ Puedes ejecutar el test de simulación de jornadas');
    console.log('📝 Comando: node tests/simulacion-jornadas-completa.mjs');
  }

  console.log('\n💾 Verifica la base de datos para confirmar las asignaciones');
}

// ================================================
// EJECUCIÓN
// ================================================

console.log('⚠️  ADVERTENCIA: Este test modificará usuarios reales en la base de datos');
console.log('📋 Asegúrate de que el servidor esté ejecutándose en http://localhost:3001');
console.log('👤 Los usuarios deben existir con documentos 12345001-12345010');
console.log('📍 Las regionales deben existir con los IDs: 62, 66, 67, 68, 71, 72, 77');
console.log('⏳ Iniciando en 3 segundos...\n');

setTimeout(() => {
  ejecutarAsignacionRegionales().catch(error => {
    console.error('💥 Error fatal en la asignación de regionales:', error);
  });
}, 3000);