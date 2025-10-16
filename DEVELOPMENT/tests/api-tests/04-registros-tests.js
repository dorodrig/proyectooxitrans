/**
 * 📝 TEST DE REGISTROS
 * Prueba todos los endpoints relacionados con registros de acceso
 */

const API_BASE_URL = 'http://localhost:3001';

// Importar credentials de login desde el test anterior
const { TEST_USER_LOGIN } = require('./01-auth-tests');

// Variable global para almacenar el token y datos del usuario
let authToken = null;
let currentUserId = null;

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
      currentUserId = data.data.user.id;
      console.log('✅ Autenticación exitosa');
      console.log('👤 Usuario ID:', currentUserId);
      return true;
    } else {
      console.log('❌ Error en autenticación para tests de registros');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en setup de autenticación:', error.message);
    return false;
  }
}

async function testGetAllRegistros() {
  console.log('📋 === TEST OBTENER TODOS LOS REGISTROS ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/registros');
    
    const response = await fetch(`${API_BASE_URL}/api/registros`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Obtener registros EXITOSO');
      console.log(`📊 Total de registros encontrados: ${data.data.length}`);
      
      if (data.data.length > 0) {
        const registro = data.data[0];
        console.log('📝 Primer registro:', registro.tipo, 'a las', new Date(registro.fecha_hora).toLocaleString());
        console.log('👤 Usuario:', registro.usuario_nombre);
      }
      
      return true;
    } else {
      console.log('❌ Obtener registros FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en obtener registros:', error.message);
    return false;
  }
}

async function testGetTodayRegistros() {
  console.log('\n📅 === TEST OBTENER REGISTROS DE HOY ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/registros/today');
    
    const response = await fetch(`${API_BASE_URL}/api/registros/today`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Obtener registros de hoy EXITOSO');
      console.log(`📊 Registros de hoy: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log('📝 Último registro de hoy:', data.data[0].tipo, 'por', data.data[0].usuario_nombre);
      }
      
      return true;
    } else {
      console.log('❌ Obtener registros de hoy FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en obtener registros de hoy:', error.message);
    return false;
  }
}

async function testGetEstadisticas() {
  console.log('\n📊 === TEST OBTENER ESTADÍSTICAS ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/registros/estadisticas');
    
    const response = await fetch(`${API_BASE_URL}/api/registros/estadisticas`, {
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

async function testCreateRegistro() {
  console.log('\n📝 === TEST CREAR REGISTRO MANUAL ===\n');
  
  if (!currentUserId) {
    console.log('❌ No hay ID de usuario para crear registro');
    return false;
  }
  
  const registroData = {
    usuarioId: currentUserId,
    tipo: 'entrada',
    latitud: 4.6097100,
    longitud: -74.0817500,
    notas: 'Registro de prueba automática'
  };
  
  try {
    console.log('📡 Probando endpoint: POST /api/registros');
    console.log('📊 Datos del registro:', JSON.stringify(registroData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/registros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(registroData),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Crear registro EXITOSO');
      console.log('📊 Registro creado ID:', data.data.id);
      console.log('📊 Tipo:', data.data.tipo);
      console.log('📊 Fecha/Hora:', new Date(data.data.fecha_hora).toLocaleString());
      return true;
    } else {
      console.log('❌ Crear registro FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en crear registro:', error.message);
    return false;
  }
}

async function testRegistrarEntrada() {
  console.log('\n🚪➡️ === TEST REGISTRAR ENTRADA RÁPIDA ===\n');
  
  if (!currentUserId) {
    console.log('❌ No hay ID de usuario para registrar entrada');
    return false;
  }
  
  const entradaData = {
    usuarioId: currentUserId,
    latitud: 4.6097100,
    longitud: -74.0817500
  };
  
  try {
    console.log('📡 Probando endpoint: POST /api/registros/entrada');
    console.log('📊 Datos de entrada:', JSON.stringify(entradaData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/registros/entrada`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(entradaData),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Registrar entrada EXITOSO');
      console.log('📊 Registro de entrada ID:', data.data.id);
      console.log('📊 Fecha/Hora:', new Date(data.data.fecha_hora).toLocaleString());
      return true;
    } else {
      console.log('❌ Registrar entrada FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en registrar entrada:', error.message);
    return false;
  }
}

async function testRegistrarSalida() {
  console.log('\n🚪⬅️ === TEST REGISTRAR SALIDA RÁPIDA ===\n');
  
  if (!currentUserId) {
    console.log('❌ No hay ID de usuario para registrar salida');
    return false;
  }
  
  const salidaData = {
    usuarioId: currentUserId,
    latitud: 4.6097100,
    longitud: -74.0817500
  };
  
  try {
    console.log('📡 Probando endpoint: POST /api/registros/salida');
    console.log('📊 Datos de salida:', JSON.stringify(salidaData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/registros/salida`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(salidaData),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Registrar salida EXITOSO');
      console.log('📊 Registro de salida ID:', data.data.id);
      console.log('📊 Fecha/Hora:', new Date(data.data.fecha_hora).toLocaleString());
      return true;
    } else {
      console.log('❌ Registrar salida FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en registrar salida:', error.message);
    return false;
  }
}

// Función principal para ejecutar todos los tests de registros
async function runRegistrosTests() {
  console.log('📝 === INICIANDO TESTS DE REGISTROS ===\n');
  
  const authResult = await setupAuth();
  if (!authResult) {
    console.log('❌ No se pudo obtener autenticación. Abortando tests de registros.');
    return { success: false };
  }
  
  const getAllResult = await testGetAllRegistros();
  const getTodayResult = await testGetTodayRegistros();
  const getStatsResult = await testGetEstadisticas();
  const createResult = await testCreateRegistro();
  const entradaResult = await testRegistrarEntrada();
  const salidaResult = await testRegistrarSalida();
  
  console.log('\n🎯 === RESUMEN REGISTROS TESTS ===');
  console.log(`Obtener Todos: ${getAllResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Obtener Hoy: ${getTodayResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Estadísticas: ${getStatsResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Crear Registro: ${createResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Registrar Entrada: ${entradaResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Registrar Salida: ${salidaResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = getAllResult && getTodayResult && getStatsResult && createResult && entradaResult && salidaResult;
  console.log(`Estado general: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  
  return {
    success: allPassed,
    results: {
      getAll: getAllResult,
      getToday: getTodayResult,
      getStats: getStatsResult,
      create: createResult,
      entrada: entradaResult,
      salida: salidaResult
    }
  };
}

// Si se ejecuta directamente
if (require.main === module) {
  runRegistrosTests();
}

module.exports = { runRegistrosTests };
