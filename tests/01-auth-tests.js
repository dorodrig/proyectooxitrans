/**
 * 🔐 TEST DE AUTENTICACIÓN
 * Prueba todos los endpoints relacionados con autenticación
 */

const API_BASE_URL = 'http://localhost:3001';

// Datos de prueba
const TEST_USER_REGISTER = {
  nombre: 'Juan Carlos',
  apellido: 'Pérez González',
  email: 'test@oxitrans.com',
  documento: '12345678',
  tipo_documento: 'CC',
  telefono: '3001234567',
  departamento: 'Tecnología',
  cargo: 'Desarrollador',
  password: 'password123',
  fecha_ingreso: '2025-01-01'
};

const TEST_USER_LOGIN = {
  documento: '12345678',
  password: 'password123'
};

// Variable global para almacenar el token
let authToken = null;

async function testRegisterUser() {
  console.log('📝 === TEST DE REGISTRO DE USUARIO ===\n');
  
  try {
    console.log('📡 Probando endpoint: POST /api/auth/registro');
    console.log('📊 Datos enviados:', JSON.stringify(TEST_USER_REGISTER, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER_REGISTER),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registro EXITOSO');
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ Registro FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      
      // Si el usuario ya existe, podemos continuar con el login
      if (data.message && data.message.includes('ya existe')) {
        console.log('ℹ️  Usuario ya existe, continuando con tests...');
        return true;
      }
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en registro:', error.message);
    return false;
  }
}

async function testLoginUser() {
  console.log('\n🔐 === TEST DE LOGIN ===\n');
  
  try {
    console.log('📡 Probando endpoint: POST /api/auth/login');
    console.log('📊 Credenciales:', JSON.stringify(TEST_USER_LOGIN, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER_LOGIN),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.data && data.data.token) {
      console.log('✅ Login EXITOSO');
      console.log('📊 Usuario:', data.data.user.nombre, data.data.user.apellido);
      console.log('📊 Role:', data.data.user.rol);
      
      // Guardar token para otros tests
      authToken = data.data.token;
      console.log('🔑 Token guardado para próximos tests');
      
      return true;
    } else {
      console.log('❌ Login FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en login:', error.message);
    return false;
  }
}

async function testVerifyToken() {
  console.log('\n🔍 === TEST DE VERIFICACIÓN DE TOKEN ===\n');
  
  if (!authToken) {
    console.log('❌ No hay token disponible para verificar');
    return false;
  }
  
  try {
    console.log('📡 Probando endpoint: GET /api/auth/verify');
    console.log('🔑 Usando token de autenticación');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Verificación de token EXITOSA');
      console.log('📊 Usuario verificado:', data.data.user.nombre, data.data.user.apellido);
      return true;
    } else {
      console.log('❌ Verificación de token FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en verificación de token:', error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n🚪 === TEST DE LOGOUT ===\n');
  
  try {
    console.log('📡 Probando endpoint: POST /api/auth/logout');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Logout EXITOSO');
      console.log('📊 Respuesta:', data.message);
      return true;
    } else {
      console.log('❌ Logout FALLÓ');
      console.log('📊 Status:', response.status);
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en logout:', error.message);
    return false;
  }
}

// Función principal para ejecutar todos los tests de autenticación
async function runAuthTests() {
  console.log('🔐 === INICIANDO TESTS DE AUTENTICACIÓN ===\n');
  
  const registerResult = await testRegisterUser();
  const loginResult = await testLoginUser();
  const verifyResult = await testVerifyToken();
  const logoutResult = await testLogout();
  
  console.log('\n🎯 === RESUMEN AUTH TESTS ===');
  console.log(`Registro: ${registerResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login: ${loginResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Verificar Token: ${verifyResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Logout: ${logoutResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = registerResult && loginResult && verifyResult && logoutResult;
  console.log(`Estado general: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  
  return {
    success: allPassed,
    authToken, // Retornar token para otros tests
    results: {
      register: registerResult,
      login: loginResult,
      verify: verifyResult,
      logout: logoutResult
    }
  };
}

// Si se ejecuta directamente
if (require.main === module) {
  runAuthTests();
}

module.exports = { runAuthTests, TEST_USER_LOGIN };
