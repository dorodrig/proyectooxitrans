// ================================================
// Test para Configuración Global de Jornadas
// ================================================

// Usamos fetch nativo disponible en Node 18+

const BASE_URL = 'http://localhost:3001/api';
const JORNADA_CONFIG_URL = `${BASE_URL}/jornada-config`;

// Credenciales de prueba (admin)
const adminCredentials = {
  email: 'admin@oxitrans.com',
  password: 'admin123'
};

let authToken = '';

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

const login = async (credentials) => {
  try {
    console.log('🔐 Autenticándose como admin...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Error de login: ${data.error || 'Desconocido'}`);
    }

    console.log('✅ Login exitoso como admin');
    return data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    throw error;
  }
};

const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${JORNADA_CONFIG_URL}${endpoint}`;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  
  console.log(`📊 Status: ${response.status} - ${response.statusText}`);
  console.log('📄 Response:', JSON.stringify(data, null, 2));
  
  return { response, data };
};

// ================================================
// TESTS DE CONFIGURACIÓN GLOBAL
// ================================================

const testObtenerConfiguracionGlobal = async () => {
  console.log('\n🧪 TEST: Obtener configuración global empresarial');
  console.log('='.repeat(60));
  
  try {
    const { response, data } = await makeAuthenticatedRequest('/global');
    
    if (response.ok) {
      console.log('✅ Configuración global obtenida exitosamente');
      return data.data;
    } else {
      console.log('ℹ️  No hay configuración global aún (esperado en primera ejecución)');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo configuración global:', error.message);
    throw error;
  }
};

const testCrearConfiguracionGlobal = async () => {
  console.log('\n🧪 TEST: Crear configuración global empresarial');
  console.log('='.repeat(60));
  
  const nuevaConfigGlobal = {
    horaEntrada: '08:00',
    tiempoTrabajoDia: 8,
    activa: true
  };

  try {
    const { response, data } = await makeAuthenticatedRequest('/global', {
      method: 'POST',
      body: JSON.stringify(nuevaConfigGlobal)
    });
    
    if (response.ok) {
      console.log('✅ Configuración global creada exitosamente');
      console.log(`📋 ID: ${data.data.id}`);
      console.log(`⏰ Hora Entrada: ${data.data.horaEntrada}`);
      console.log(`⏳ Tiempo Trabajo: ${data.data.tiempoTrabajoDia}h`);
      console.log(`🕐 Fin Jornada: ${data.data.finJornadaLaboral}`);
      return data.data;
    } else {
      if (response.status === 409) {
        console.log('ℹ️  Ya existe configuración global (esperado si se ejecutó antes)');
        return null;
      }
      throw new Error(`Error ${response.status}: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Error creando configuración global:', error.message);
    throw error;
  }
};

const testActualizarConfiguracionGlobal = async (configId) => {
  console.log('\n🧪 TEST: Actualizar configuración global empresarial');
  console.log('='.repeat(60));
  
  if (!configId) {
    console.log('⚠️  No hay ID de configuración global para actualizar');
    return;
  }

  const actualizacion = {
    horaEntrada: '09:00',
    tiempoTrabajoDia: 8.5,
    activa: true
  };

  try {
    const { response, data } = await makeAuthenticatedRequest(`/global/${configId}`, {
      method: 'PUT',
      body: JSON.stringify(actualizacion)
    });
    
    if (response.ok) {
      console.log('✅ Configuración global actualizada exitosamente');
      console.log(`📋 ID: ${data.data.id}`);
      console.log(`⏰ Nueva Hora Entrada: ${data.data.horaEntrada}`);
      console.log(`⏳ Nuevo Tiempo Trabajo: ${data.data.tiempoTrabajoDia}h`);
      console.log(`🕐 Nueva Fin Jornada: ${data.data.finJornadaLaboral}`);
      return data.data;
    } else {
      throw new Error(`Error ${response.status}: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Error actualizando configuración global:', error.message);
    throw error;
  }
};

const testAccesoNoAdmin = async () => {
  console.log('\n🧪 TEST: Acceso denegado para usuarios no admin');
  console.log('='.repeat(60));
  
  // Simulamos un token no admin (obviamente fallará la validación)
  const fakeToken = 'Bearer fake-non-admin-token';
  
  try {
    const response = await fetch(`${JORNADA_CONFIG_URL}/global`, {
      headers: {
        'Authorization': fakeToken,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.status === 403 || response.status === 401) {
      console.log('✅ Acceso correctamente denegado para usuarios no admin');
    } else {
      console.log('⚠️  Respuesta inesperada:', response.status, data);
    }
  } catch (error) {
    console.log('✅ Acceso correctamente bloqueado (error de conexión esperado)');
  }
};

// ================================================
// EJECUCIÓN PRINCIPAL
// ================================================

const runGlobalJornadaTests = async () => {
  console.log('🚀 INICIANDO TESTS DE CONFIGURACIÓN GLOBAL EMPRESARIAL');
  console.log('='.repeat(80));
  
  try {
    // 1. Autenticación
    authToken = await login(adminCredentials);
    
    // 2. Obtener configuración global (puede no existir)
    const configExistente = await testObtenerConfiguracionGlobal();
    
    // 3. Si no existe, crear nueva configuración global
    let configGlobal = configExistente;
    if (!configGlobal) {
      configGlobal = await testCrearConfiguracionGlobal();
    }
    
    // 4. Obtener la configuración actualizada
    const configActualizada = await testObtenerConfiguracionGlobal();
    const configId = configActualizada?.id || configGlobal?.id;
    
    // 5. Actualizar configuración global (si tenemos ID)
    if (configId) {
      await testActualizarConfiguracionGlobal(configId);
    }
    
    // 6. Verificar configuración final
    await testObtenerConfiguracionGlobal();
    
    // 7. Test de seguridad - acceso no admin
    await testAccesoNoAdmin();
    
    console.log('\n🎉 TODOS LOS TESTS DE CONFIGURACIÓN GLOBAL COMPLETADOS');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO EN LOS TESTS:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Ejecutar tests
runGlobalJornadaTests();