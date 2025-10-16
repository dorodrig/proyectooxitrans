// ================================================
// TEST ESPECÍFICO: SOLO CREAR USUARIOS
// Usa los IDs reales de las regionales ya creadas
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// IDs reales de las regionales ya creadas (según imagen de BD)
const regionalesExistentes = {
  duitama: 72,
  bucaramanga: 66,
  barranquilla: 67,
  drummond: 68,
  bogota: 62,
  cartagena: 77,
  neiva: 71
};

// Usuarios a crear con todos los campos requeridos
const usuariosACrear = [
  {
    nombre: 'Ana Sofía',
    apellido: 'García Herrera',
    documento: '12345004',
    tipoDocumento: 'CC',
    email: 'ana.garcia@oxitrans.com',
    telefono: '3034567890',
    rol: 'supervisor',
    cargo: 'Supervisora de Turno',
    departamento: 'Supervisión',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  },
  {
    nombre: 'María Fernanda',
    apellido: 'López Martínez',
    documento: '12345002',
    tipoDocumento: 'CC',
    email: 'maria.lopez@oxitrans.com',
    telefono: '3012345678',
    rol: 'empleado',
    cargo: 'Operadora Logística',
    departamento: 'Logística',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  },
  {
    nombre: 'Juan Pablo',
    apellido: 'Martínez Silva',
    documento: '12345003',
    tipoDocumento: 'CC',
    email: 'juan.martinez@oxitrans.com',
    telefono: '3023456789',
    rol: 'empleado',
    cargo: 'Conductor Junior',
    departamento: 'Operaciones',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  },
  {
    nombre: 'Diego Alejandro',
    apellido: 'Ruiz Castro',
    documento: '12345005',
    tipoDocumento: 'CC',
    email: 'diego.ruiz@oxitrans.com',
    telefono: '3045678901',
    rol: 'empleado',
    cargo: 'Conductor Senior',
    departamento: 'Operaciones',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  },
  {
    nombre: 'Claudia Patricia',
    apellido: 'Herrera Morales',
    documento: '12345006',
    tipoDocumento: 'CC',
    email: 'claudia.herrera@oxitrans.com',
    telefono: '3056789012',
    rol: 'empleado',
    cargo: 'Operadora Logística',
    departamento: 'Logística',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  },
  {
    nombre: 'Roberto Carlos',
    apellido: 'Sánchez Jiménez',
    documento: '12345007',
    tipoDocumento: 'CC',
    email: 'roberto.sanchez@oxitrans.com',
    telefono: '3067890123',
    rol: 'empleado',
    cargo: 'Conductor Senior',
    departamento: 'Operaciones',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  },
  {
    nombre: 'Luisa Fernanda',
    apellido: 'Castro Vargas',
    documento: '12345008',
    tipoDocumento: 'CC',
    email: 'luisa.castro@oxitrans.com',
    telefono: '3078901234',
    rol: 'supervisor',
    cargo: 'Supervisora Regional',
    departamento: 'Supervisión',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  },
  {
    nombre: 'Andrés Felipe',
    apellido: 'Moreno Quintero',
    documento: '12345009',
    tipoDocumento: 'CC',
    email: 'andres.moreno@oxitrans.com',
    telefono: '3089012345',
    rol: 'empleado',
    cargo: 'Técnico de Mantenimiento',
    departamento: 'Mantenimiento',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  },
  {
    nombre: 'Sandra Milena',
    apellido: 'Jiménez Torres',
    documento: '12345010',
    tipoDocumento: 'CC',
    email: 'sandra.jimenez@oxitrans.com',
    telefono: '3090123456',
    rol: 'empleado',
    cargo: 'Operadora Logística',
    departamento: 'Logística',
    fechaIngreso: '2024-01-15',
    estado: 'activo'
  }
];

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

async function crearUsuario(adminToken, userData) {
  try {
    console.log(`👤 Creando usuario: ${userData.nombre} ${userData.apellido} (${userData.documento})`);
    
    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Usuario creado exitosamente`);
      console.log(`   🏢 Departamento: ${userData.departamento}`);
      console.log(`   📧 Email: ${userData.email}`);
      return data.data || data;
    } else {
      console.log(`   ❌ Error creando usuario: ${data.message || data.error}`);
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(error => {
          console.log(`      • ${error.msg || error.message} (${error.param || error.field})`);
        });
      }
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    return null;
  }
}

// ================================================
// FUNCIÓN PRINCIPAL
// ================================================

async function ejecutarCreacionUsuarios() {
  console.log('👥 CREANDO USUARIOS PARA OXITRANS');
  console.log('='.repeat(50));
  console.log(`📊 Total usuarios a crear: ${usuariosACrear.length}`);
  console.log('📍 Usando regionales existentes con IDs reales');
  console.log('='.repeat(50));

  // Login como administrador
  const adminToken = await loginAdmin();
  if (!adminToken) {
    console.error('💥 No se pudo obtener token de administrador. Abortando...');
    return;
  }

  console.log('\n👥 INICIANDO CREACIÓN DE USUARIOS...');
  console.log('─'.repeat(50));

  let usuariosCreados = 0;
  let usuariosFallidos = 0;
  const usuariosExitosos = [];

  // Crear cada usuario
  for (let i = 0; i < usuariosACrear.length; i++) {
    const userData = usuariosACrear[i];
    
    try {
      const usuario = await crearUsuario(adminToken, userData);
      
      if (usuario) {
        usuariosCreados++;
        usuariosExitosos.push({
          ...userData,
          id: usuario.id
        });
      } else {
        usuariosFallidos++;
      }
    } catch (error) {
      console.log(`   ❌ Error inesperado con ${userData.nombre}: ${error.message}`);
      usuariosFallidos++;
    }
    
    // Pausa entre creaciones para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Separador visual entre usuarios
    if (i < usuariosACrear.length - 1) {
      console.log('   ' + '─'.repeat(40));
    }
  }

  // ============================================
  // RESUMEN FINAL
  // ============================================

  console.log('\n🎉 CREACIÓN DE USUARIOS COMPLETADA');
  console.log('='.repeat(50));
  console.log(`✅ Usuarios creados exitosamente: ${usuariosCreados}`);
  console.log(`❌ Usuarios fallidos: ${usuariosFallidos}`);
  console.log(`📊 Total procesados: ${usuariosCreados + usuariosFallidos}`);
  console.log(`📈 Tasa de éxito: ${((usuariosCreados / usuariosACrear.length) * 100).toFixed(1)}%`);

  if (usuariosExitosos.length > 0) {
    console.log('\n👥 USUARIOS CREADOS POR REGIONAL:');
    console.log('─'.repeat(50));
    
    // Agrupar por regional
    const usuariosPorRegional = {};
    usuariosExitosos.forEach(user => {
      const regionalName = Object.keys(regionalesExistentes).find(key => 
        regionalesExistentes[key] === user.regional_id
      );
      
      if (!usuariosPorRegional[regionalName]) {
        usuariosPorRegional[regionalName] = [];
      }
      usuariosPorRegional[regionalName].push(user);
    });

    Object.keys(usuariosPorRegional).forEach(regional => {
      const usuarios = usuariosPorRegional[regional];
      console.log(`📍 ${regional.toUpperCase()}: ${usuarios.length} usuarios`);
      usuarios.forEach(user => {
        console.log(`   • ${user.nombre} ${user.apellido} (${user.documento}) - ${user.cargo}`);
      });
    });

    console.log('\n🎯 PRÓXIMO PASO:');
    console.log('✓ Los usuarios están listos para simular jornadas laborales');
    console.log('✓ Puedes ejecutar ahora el test de simulación de jornadas');
    console.log('📝 Comando: node tests/simulacion-jornadas-solo.mjs');
  }

  console.log('\n💾 Verifica la base de datos para confirmar los usuarios creados');
}

// ================================================
// EJECUCIÓN
// ================================================

console.log('⚠️  ADVERTENCIA: Este test creará usuarios reales en la base de datos');
console.log('📋 Asegúrate de que el servidor esté ejecutándose en http://localhost:3001');
console.log('📍 Las regionales deben existir con los IDs: 62, 66, 67, 68, 71, 72, 77');
console.log('⏳ Iniciando en 3 segundos...\n');

setTimeout(() => {
  ejecutarCreacionUsuarios().catch(error => {
    console.error('💥 Error fatal en la creación de usuarios:', error);
  });
}, 3000);