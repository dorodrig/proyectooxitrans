/**
 * 👥 TEST DE USUARIOS
 * Prueba todos los endpoints relacionados con gestión de usuarios
 */

const API_BASE_URL = 'http://localhost:3001';

// Importar credentials de login desde el test anterior
const { TEST_USER_LOGIN } = require('./01-auth-tests');

// Variable global para almacenar el token
let authToken = null;
let testUserId = null;

// Datos de prueba para crear usuario
const TEST_USER_CREATE = {
  nombre: 'Ana María',
  apellido: 'López Vargas',
  email: 'ana.lopez@oxitrans.com',
  documento: '87654321',
  tipoDocumento: 'CC',
  telefono: '3009876543',
  rol: 'empleado',
  departamento: 'Recursos Humanos',
  cargo: 'Analista RRHH',
  fechaIngreso: '2025-01-10'
};

async function setupAuth() {
  console.log('🔐 Obteniendo token de autenticación...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER_LOGIN),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.data && data.data.token) {
      authToken = data.data.token;
      console.log('✅ Autenticación exitosa');
      return true;
    } else {
      console.log('❌ Error en autenticación para tests de usuarios');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en setup de autenticación:', error.message);
    return false;
  }
}

async function testGetAllUsers() {
  console.log('📋 === TEST OBTENER TODOS LOS USUARIOS ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/usuarios');
    
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Obtener usuarios EXITOSO');
      console.log(`📊 Total de usuarios encontrados: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log('👤 Primer usuario:', data.data[0].nombre, data.data[0].apellido);
      }
      
      return true;
    } else {
      console.log('❌ Obtener usuarios FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en obtener usuarios:', error.message);
    return false;
  }
}

async function testCreateUser() {
  console.log('\n👤 === TEST CREAR USUARIO ===\n');
  
  try {
    console.log('📡 Probando endpoint: POST /api/usuarios');
    console.log('📊 Datos del usuario:', JSON.stringify(TEST_USER_CREATE, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(TEST_USER_CREATE),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Crear usuario EXITOSO');
      console.log('📊 Usuario creado ID:', data.data.id);
      
      // Guardar ID para otros tests
      testUserId = data.data.id;
      
      return true;
    } else {
      console.log('❌ Crear usuario FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      
      // Si el usuario ya existe, intentar obtener su ID
      if (data.message && data.message.includes('ya existe')) {
        console.log('ℹ️  Usuario ya existe, buscándolo...');
        return await findExistingUser();
      }
      
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en crear usuario:', error.message);
    return false;
  }
}

async function findExistingUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/search?q=${TEST_USER_CREATE.documento}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.data.length > 0) {
      testUserId = data.data[0].id;
      console.log('✅ Usuario existente encontrado con ID:', testUserId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('❌ ERROR buscando usuario existente:', error.message);
    return false;
  }
}

async function testGetUserById() {
  console.log('\n🔍 === TEST OBTENER USUARIO POR ID ===\n');
  
  if (!testUserId) {
    console.log('❌ No hay ID de usuario para probar');
    return false;
  }
  
  try {
    console.log('📡 Probando endpoint: GET /api/usuarios/' + testUserId);
    
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${testUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Obtener usuario por ID EXITOSO');
      console.log('📊 Usuario:', data.data.nombre, data.data.apellido);
      console.log('📊 Email:', data.data.email);
      console.log('📊 Rol:', data.data.rol);
      return true;
    } else {
      console.log('❌ Obtener usuario por ID FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en obtener usuario por ID:', error.message);
    return false;
  }
}

async function testUpdateUser() {
  console.log('\n✏️ === TEST ACTUALIZAR USUARIO ===\n');
  
  if (!testUserId) {
    console.log('❌ No hay ID de usuario para probar');
    return false;
  }
  
  const updateData = {
    telefono: '3001111111',
    departamento: 'Tecnología Actualizada'
  };
  
  try {
    console.log('📡 Probando endpoint: PUT /api/usuarios/' + testUserId);
    console.log('📊 Datos de actualización:', JSON.stringify(updateData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${testUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(updateData),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Actualizar usuario EXITOSO');
      console.log('📊 Usuario actualizado:', data.data.nombre, data.data.apellido);
      console.log('📊 Nuevo teléfono:', data.data.telefono);
      console.log('📊 Nuevo departamento:', data.data.departamento);
      return true;
    } else {
      console.log('❌ Actualizar usuario FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en actualizar usuario:', error.message);
    return false;
  }
}

async function testGetUsersStats() {
  console.log('\n📊 === TEST ESTADÍSTICAS DE USUARIOS ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/usuarios/stats');
    
    const response = await fetch(`${API_BASE_URL}/api/usuarios/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Obtener estadísticas EXITOSO');
      console.log('📊 Estadísticas:', JSON.stringify(data.data, null, 2));
      return true;
    } else {
      console.log('❌ Obtener estadísticas FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en obtener estadísticas:', error.message);
    return false;
  }
}

async function testSearchUsers() {
  console.log('\n🔍 === TEST BUSCAR USUARIOS ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/usuarios/search?q=Juan');
    
    const response = await fetch(`${API_BASE_URL}/api/usuarios/search?q=Juan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Buscar usuarios EXITOSO');
      console.log(`📊 Usuarios encontrados: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log('👤 Primer resultado:', data.data[0].nombre, data.data[0].apellido);
      }
      
      return true;
    } else {
      console.log('❌ Buscar usuarios FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en buscar usuarios:', error.message);
    return false;
  }
}

// Función principal para ejecutar todos los tests de usuarios
async function runUsersTests() {
  console.log('👥 === INICIANDO TESTS DE USUARIOS ===\n');
  
  const authResult = await setupAuth();
  if (!authResult) {
    console.log('❌ No se pudo obtener autenticación. Abortando tests de usuarios.');
    return { success: false };
  }
  
  const getAllResult = await testGetAllUsers();
  const createResult = await testCreateUser();
  const getByIdResult = await testGetUserById();
  const updateResult = await testUpdateUser();
  const statsResult = await testGetUsersStats();
  const searchResult = await testSearchUsers();
  
  console.log('\n🎯 === RESUMEN USERS TESTS ===');
  console.log(`Obtener Todos: ${getAllResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Crear Usuario: ${createResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Obtener por ID: ${getByIdResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Actualizar: ${updateResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Estadísticas: ${statsResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Buscar: ${searchResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = getAllResult && createResult && getByIdResult && updateResult && statsResult && searchResult;
  console.log(`Estado general: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  
  return {
    success: allPassed,
    testUserId,
    results: {
      getAll: getAllResult,
      create: createResult,
      getById: getByIdResult,
      update: updateResult,
      stats: statsResult,
      search: searchResult
    }
  };
}

// Si se ejecuta directamente
if (require.main === module) {
  runUsersTests();
}

module.exports = { runUsersTests };
