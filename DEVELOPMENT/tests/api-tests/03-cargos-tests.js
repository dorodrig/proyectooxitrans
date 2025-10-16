/**
 * 💼 TEST DE CARGOS
 * Prueba todos los endpoints relacionados con gestión de cargos
 */

const API_BASE_URL = 'http://localhost:3001';

// Importar credentials de login desde el test anterior
const { TEST_USER_LOGIN } = require('./01-auth-tests');

// Variable global para almacenar el token y cargo de prueba
let authToken = null;
let testCargoId = null;

// Datos de prueba para crear cargo
const TEST_CARGO_CREATE = {
  nombre: 'Analista de Pruebas',
  descripcion: 'Cargo creado para testing automatizado',
  departamento: 'Tecnología',
  nivel: 'Medio'
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
      console.log('❌ Error en autenticación para tests de cargos');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en setup de autenticación:', error.message);
    return false;
  }
}

async function testGetAllCargos() {
  console.log('📋 === TEST OBTENER TODOS LOS CARGOS ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/cargos');
    
    const response = await fetch(`${API_BASE_URL}/api/cargos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Obtener cargos EXITOSO');
      console.log(`📊 Total de cargos encontrados: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log('💼 Primer cargo:', data.data[0].nombre);
        console.log('🏢 Departamento:', data.data[0].departamento);
      }
      
      return true;
    } else {
      console.log('❌ Obtener cargos FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en obtener cargos:', error.message);
    return false;
  }
}

async function testCreateCargo() {
  console.log('\n💼 === TEST CREAR CARGO ===\n');
  
  try {
    console.log('📡 Probando endpoint: POST /api/cargos');
    console.log('📊 Datos del cargo:', JSON.stringify(TEST_CARGO_CREATE, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/cargos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(TEST_CARGO_CREATE),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Crear cargo EXITOSO');
      console.log('📊 Cargo creado ID:', data.data.id);
      console.log('📊 Nombre:', data.data.nombre);
      console.log('📊 Departamento:', data.data.departamento);
      
      // Guardar ID para otros tests
      testCargoId = data.data.id;
      
      return true;
    } else {
      console.log('❌ Crear cargo FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      
      // Si el cargo ya existe, intentar obtenerlo
      if (data.message && data.message.includes('ya existe')) {
        console.log('ℹ️  Cargo ya existe, continuando tests...');
        return await findExistingCargo();
      }
      
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en crear cargo:', error.message);
    return false;
  }
}

async function findExistingCargo() {
  try {
    // Obtener todos los cargos y buscar el que creamos
    const response = await fetch(`${API_BASE_URL}/api/cargos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const existingCargo = data.data.find(cargo => cargo.nombre === TEST_CARGO_CREATE.nombre);
      if (existingCargo) {
        testCargoId = existingCargo.id;
        console.log('✅ Cargo existente encontrado con ID:', testCargoId);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log('❌ ERROR buscando cargo existente:', error.message);
    return false;
  }
}

async function testUpdateCargo() {
  console.log('\n✏️ === TEST ACTUALIZAR CARGO ===\n');
  
  if (!testCargoId) {
    console.log('❌ No hay ID de cargo para probar');
    return false;
  }
  
  const updateData = {
    descripcion: 'Cargo de pruebas actualizado mediante testing automatizado',
    nivel: 'Senior'
  };
  
  try {
    console.log('📡 Probando endpoint: PUT /api/cargos/' + testCargoId);
    console.log('📊 Datos de actualización:', JSON.stringify(updateData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/cargos/${testCargoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(updateData),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Actualizar cargo EXITOSO');
      console.log('📊 Cargo actualizado:', data.data.nombre);
      console.log('📊 Nueva descripción:', data.data.descripcion);
      console.log('📊 Nuevo nivel:', data.data.nivel);
      return true;
    } else {
      console.log('❌ Actualizar cargo FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en actualizar cargo:', error.message);
    return false;
  }
}

async function testDeleteCargo() {
  console.log('\n🗑️ === TEST ELIMINAR CARGO ===\n');
  
  if (!testCargoId) {
    console.log('❌ No hay ID de cargo para probar');
    return false;
  }
  
  try {
    console.log('📡 Probando endpoint: DELETE /api/cargos/' + testCargoId);
    
    const response = await fetch(`${API_BASE_URL}/api/cargos/${testCargoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Eliminar cargo EXITOSO');
      console.log('📊 Mensaje:', data.message);
      return true;
    } else {
      console.log('❌ Eliminar cargo FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en eliminar cargo:', error.message);
    return false;
  }
}

// Función principal para ejecutar todos los tests de cargos
async function runCargosTests() {
  console.log('💼 === INICIANDO TESTS DE CARGOS ===\n');
  
  const authResult = await setupAuth();
  if (!authResult) {
    console.log('❌ No se pudo obtener autenticación. Abortando tests de cargos.');
    return { success: false };
  }
  
  const getAllResult = await testGetAllCargos();
  const createResult = await testCreateCargo();
  const updateResult = await testUpdateCargo();
  const deleteResult = await testDeleteCargo();
  
  console.log('\n🎯 === RESUMEN CARGOS TESTS ===');
  console.log(`Obtener Todos: ${getAllResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Crear Cargo: ${createResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Actualizar: ${updateResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Eliminar: ${deleteResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = getAllResult && createResult && updateResult && deleteResult;
  console.log(`Estado general: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  
  return {
    success: allPassed,
    results: {
      getAll: getAllResult,
      create: createResult,
      update: updateResult,
      delete: deleteResult
    }
  };
}

// Si se ejecuta directamente
if (require.main === module) {
  runCargosTests();
}

module.exports = { runCargosTests };
