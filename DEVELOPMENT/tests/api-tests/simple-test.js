/**
 * 🧪 TEST SIMPLE CON AXIOS
 * Prueba básica de endpoints usando axios
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002';

async function testHealthCheck() {
  console.log('🏥 === TEST DE HEALTH CHECK ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /api/health');
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Health check EXITOSO');
      console.log('📊 Respuesta:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log('❌ Health check FALLÓ');
      console.log('📊 Respuesta:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en health check:', error.message);
    return false;
  }
}

async function testRootEndpoint() {
  console.log('\n📡 === TEST DE ROOT ENDPOINT ===\n');
  
  try {
    console.log('📡 Probando endpoint: GET /');
    const response = await axios.get(`${API_BASE_URL}/`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Root endpoint EXITOSO');
      console.log('📊 Endpoints disponibles:', JSON.stringify(response.data.endpoints, null, 2));
      return true;
    } else {
      console.log('❌ Root endpoint FALLÓ');
      console.log('📊 Respuesta:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en root endpoint:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 === TEST DE LOGIN ===\n');
  
  const credentials = {
    documento: '12345678',
    password: 'password123'
  };
  
  try {
    console.log('📡 Probando endpoint: POST /api/auth/login');
    console.log('📊 Credenciales:', JSON.stringify(credentials, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Login EXITOSO');
      console.log('📊 Usuario:', response.data.data.user.nombre, response.data.data.user.apellido);
      console.log('🔑 Token obtenido exitosamente');
      return response.data.data.token;
    } else {
      console.log('❌ Login FALLÓ');
      console.log('📊 Respuesta:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    console.log('❌ ERROR en login:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📊 Data:', error.response.data);
    }
    return null;
  }
}

async function testGetUsers(token) {
  console.log('\n👥 === TEST DE OBTENER USUARIOS ===\n');
  
  if (!token) {
    console.log('❌ No hay token para probar usuarios');
    return false;
  }
  
  try {
    console.log('📡 Probando endpoint: GET /api/usuarios');
    const response = await axios.get(`${API_BASE_URL}/api/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Obtener usuarios EXITOSO');
      console.log(`📊 Total de usuarios: ${response.data.data.length}`);
      return true;
    } else {
      console.log('❌ Obtener usuarios FALLÓ');
      console.log('📊 Respuesta:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR en obtener usuarios:', error.message);
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📊 Data:', error.response.data);
    }
    return false;
  }
}

async function runSimpleTests() {
  console.log('🧪 === INICIANDO TESTS SIMPLES ===\n');
  
  const healthResult = await testHealthCheck();
  const rootResult = await testRootEndpoint();
  const token = await testLogin();
  const usersResult = await testGetUsers(token);
  
  console.log('\n🎯 === RESUMEN FINAL ===');
  console.log(`Health Check: ${healthResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Root Endpoint: ${rootResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login: ${token ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Get Users: ${usersResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = healthResult && rootResult && token && usersResult;
  console.log(`\nEstado general: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  
  return allPassed;
}

runSimpleTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ ERROR ejecutando tests:', error);
  process.exit(1);
});
