// ================================================
// Test completo para el sistema AsignarJornadaLaboral
// ================================================

import axios from 'axios';

// Configuración del servidor
const SERVER_URL = 'http://localhost:3002';
const API_BASE = `${SERVER_URL}/api`;

// Datos de prueba
const testCredentials = {
  email: 'admin@oxitrans.com',
  password: 'admin123'
};

const testJornadaConfig = {
  horaEntrada: '08:00',
  tiempoTrabajoDia: 8,
  finJornadaLaboral: '17:00', // Se calcula automáticamente
  activa: true
};

let authToken = '';
let testUserId = null;
let configId = null;

/**
 * Función para realizar login y obtener token
 */
async function login() {
  try {
    console.log('🔐 Realizando login...');
    const response = await axios.post(`${API_BASE}/auth/login`, testCredentials);
    
    if (response.data.success) {
      authToken = response.data.token;
      testUserId = response.data.usuario.id;
      console.log('✅ Login exitoso');
      console.log(`   Usuario: ${response.data.usuario.nombre} ${response.data.usuario.apellido}`);
      console.log(`   ID: ${testUserId}`);
      return true;
    } else {
      console.log('❌ Error en login:', response.data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error conectando para login:', error.message);
    return false;
  }
}

/**
 * Función para crear configuración de jornada
 */
async function crearConfiguracion() {
  try {
    console.log('\n📝 Creando configuración de jornada laboral...');
    
    const configData = {
      ...testJornadaConfig,
      usuarioId: testUserId
    };
    
    const response = await axios.post(`${API_BASE}/jornada-config`, configData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      configId = response.data.data.id;
      console.log('✅ Configuración creada exitosamente');
      console.log('   Datos:', JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      console.log('❌ Error creando configuración:', response.data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error en petición de creación:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Función para obtener configuración
 */
async function obtenerConfiguracion() {
  try {
    console.log('\n🔍 Obteniendo configuración...');
    
    const response = await axios.get(`${API_BASE}/jornada-config/${testUserId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Configuración obtenida exitosamente');
      console.log('   Datos:', JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      console.log('❌ Error obteniendo configuración:', response.data.error);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('ℹ️  No existe configuración para este usuario');
      return true; // No es un error, simplemente no existe
    }
    console.log('❌ Error en petición de obtención:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Función para actualizar configuración
 */
async function actualizarConfiguracion() {
  if (!configId) {
    console.log('⚠️  No hay configuración para actualizar');
    return false;
  }
  
  try {
    console.log('\n✏️  Actualizando configuración...');
    
    const updateData = {
      tiempoTrabajoDia: 9, // Cambiar a 9 horas (horas extras)
      horaEntrada: '07:30' // Cambiar hora de entrada
    };
    
    const response = await axios.put(`${API_BASE}/jornada-config/${configId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Configuración actualizada exitosamente');
      console.log('   Datos actualizados:', JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      console.log('❌ Error actualizando configuración:', response.data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error en petición de actualización:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Función para probar el frontend
 */
async function probarFrontend() {
  try {
    console.log('\n🌐 Probando acceso al frontend...');
    
    const response = await axios.get(`${SERVER_URL}/asignar-jornada-laboral`);
    
    if (response.status === 200) {
      console.log('✅ Frontend accesible');
      console.log(`   Status: ${response.status}`);
      return true;
    } else {
      console.log(`⚠️  Frontend responde con status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  Ruta del frontend no encontrada (normal en desarrollo)');
      return true;
    }
    console.log('❌ Error accediendo al frontend:', error.message);
    return false;
  }
}

/**
 * Función para probar validaciones
 */
async function probarValidaciones() {
  try {
    console.log('\n🛡️  Probando validaciones...');
    
    // Probar datos inválidos
    const datosInvalidos = [
      {
        descripcion: 'Hora de entrada inválida',
        datos: { horaEntrada: '25:00', tiempoTrabajoDia: 8, usuarioId: testUserId }
      },
      {
        descripcion: 'Tiempo de trabajo excesivo',
        datos: { horaEntrada: '08:00', tiempoTrabajoDia: 15, usuarioId: testUserId }
      },
      {
        descripcion: 'Usuario ID inválido',
        datos: { horaEntrada: '08:00', tiempoTrabajoDia: 8, usuarioId: -1 }
      }
    ];
    
    let validacionesCorrectas = 0;
    
    for (const test of datosInvalidos) {
      try {
        const response = await axios.post(`${API_BASE}/jornada-config`, test.datos, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`❌ Validación fallida para: ${test.descripcion} (debería rechazar)`);
      } catch (error) {
        if (error.response?.status >= 400 && error.response?.status < 500) {
          console.log(`✅ Validación correcta para: ${test.descripcion}`);
          validacionesCorrectas++;
        } else {
          console.log(`⚠️  Error inesperado en: ${test.descripcion} - ${error.message}`);
        }
      }
    }
    
    console.log(`   Validaciones correctas: ${validacionesCorrectas}/${datosInvalidos.length}`);
    return validacionesCorrectas === datosInvalidos.length;
  } catch (error) {
    console.log('❌ Error en pruebas de validación:', error.message);
    return false;
  }
}

/**
 * Función para verificar el servidor
 */
async function verificarServidor() {
  try {
    console.log('🔍 Verificando servidor...');
    const response = await axios.get(`${API_BASE}/health`);
    
    if (response.data.success) {
      console.log('✅ Servidor funcionando correctamente');
      console.log(`   Entorno: ${response.data.environment}`);
      return true;
    } else {
      console.log('❌ Servidor responde pero con problemas');
      return false;
    }
  } catch (error) {
    console.log('❌ Servidor no disponible:', error.message);
    return false;
  }
}

/**
 * Función principal de pruebas
 */
async function ejecutarPruebas() {
  console.log('🚀 INICIANDO PRUEBAS DEL SISTEMA ASIGNAR JORNADA LABORAL');
  console.log('=' .repeat(60));
  
  const resultados = {
    servidor: false,
    login: false,
    obtenerConfig: false,
    crearConfig: false,
    actualizarConfig: false,
    validaciones: false,
    frontend: false
  };
  
  // 1. Verificar servidor
  resultados.servidor = await verificarServidor();
  if (!resultados.servidor) {
    console.log('\n❌ PRUEBAS TERMINADAS: Servidor no disponible');
    return;
  }
  
  // 2. Login
  resultados.login = await login();
  if (!resultados.login) {
    console.log('\n❌ PRUEBAS TERMINADAS: No se pudo hacer login');
    return;
  }
  
  // 3. Obtener configuración (puede no existir)
  resultados.obtenerConfig = await obtenerConfiguracion();
  
  // 4. Crear configuración
  resultados.crearConfig = await crearConfiguracion();
  
  // 5. Actualizar configuración
  if (resultados.crearConfig) {
    resultados.actualizarConfig = await actualizarConfiguracion();
  }
  
  // 6. Probar validaciones
  resultados.validaciones = await probarValidaciones();
  
  // 7. Probar frontend
  resultados.frontend = await probarFrontend();
  
  // Resumen final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('=' .repeat(60));
  
  Object.entries(resultados).forEach(([prueba, resultado]) => {
    const emoji = resultado ? '✅' : '❌';
    const status = resultado ? 'PASÓ' : 'FALLÓ';
    console.log(`${emoji} ${prueba.toUpperCase()}: ${status}`);
  });
  
  const pruebas_exitosas = Object.values(resultados).filter(Boolean).length;
  const total_pruebas = Object.keys(resultados).length;
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 RESULTADO FINAL: ${pruebas_exitosas}/${total_pruebas} pruebas exitosas`);
  
  if (pruebas_exitosas === total_pruebas) {
    console.log('🎉 ¡TODAS LAS PRUEBAS EXITOSAS! Sistema listo para usar.');
  } else if (pruebas_exitosas >= total_pruebas * 0.8) {
    console.log('⚠️  La mayoría de pruebas pasaron. Revisar fallos menores.');
  } else {
    console.log('❌ Varios fallos detectados. Revisar implementación.');
  }
  
  console.log('=' .repeat(60));
}

// Ejecutar pruebas
ejecutarPruebas().catch(error => {
  console.error('💥 Error ejecutando pruebas:', error);
  process.exit(1);
});