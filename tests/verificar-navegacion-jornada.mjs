// ================================================
// Test rápido para verificar navegación a AsignarJornadaLaboral
// ================================================

import axios from 'axios';

const SERVER_URL = 'http://localhost:5173'; // URL del frontend

/**
 * Función para verificar que la ruta del frontend responde
 */
async function probarNavegacion() {
  try {
    console.log('🔍 Verificando navegación a AsignarJornadaLaboral...');
    
    // Probar el endpoint del frontend
    const response = await axios.get(`${SERVER_URL}/asignar-jornada-laboral`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Navegación al componente exitosa');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      return true;
    } else {
      console.log(`⚠️  Respuesta inesperada: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Ruta no encontrada - Verificar que el frontend esté ejecutándose');
    } else {
      console.log('❌ Error accediendo a la ruta:', error.message);
    }
    return false;
  }
}

/**
 * Función para verificar que el backend responde
 */
async function probarBackend() {
  try {
    console.log('🔍 Verificando backend API...');
    
    const response = await axios.get('http://localhost:3001/api/health');
    
    if (response.data.success) {
      console.log('✅ Backend funcionando correctamente');
      console.log(`   Entorno: ${response.data.environment}`);
      return true;
    } else {
      console.log('❌ Backend responde pero con problemas');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend no disponible:', error.message);
    return false;
  }
}

/**
 * Función principal de verificación
 */
async function verificarSistema() {
  console.log('🚀 VERIFICANDO SISTEMA ASIGNAR JORNADA LABORAL');
  console.log('=' .repeat(50));
  
  const resultados = {
    backend: false,
    navegacion: false
  };
  
  // 1. Verificar backend
  resultados.backend = await probarBackend();
  
  // 2. Verificar navegación frontend
  resultados.navegacion = await probarNavegacion();
  
  // Resumen final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('=' .repeat(50));
  
  Object.entries(resultados).forEach(([componente, resultado]) => {
    const emoji = resultado ? '✅' : '❌';
    const status = resultado ? 'FUNCIONANDO' : 'CON PROBLEMAS';
    console.log(`${emoji} ${componente.toUpperCase()}: ${status}`);
  });
  
  const funcionando = Object.values(resultados).filter(Boolean).length;
  const total = Object.keys(resultados).length;
  
  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 RESULTADO: ${funcionando}/${total} componentes funcionando`);
  
  if (funcionando === total) {
    console.log('🎉 ¡Sistema completamente funcional!');
    console.log('');
    console.log('📋 INSTRUCCIONES PARA USAR:');
    console.log('1. 📂 Abrir http://localhost:5173 en el navegador');
    console.log('2. 🔐 Hacer login con credenciales de administrador');
    console.log('3. 🎛️  Ir a "Control Maestro"');
    console.log('4. ⏰ Hacer clic en "Asignar Jornada Laboral"');
    console.log('5. ✏️  Configurar horarios según necesidades');
  } else {
    console.log('⚠️  Revisar componentes que no están funcionando');
  }
  
  console.log('=' .repeat(50));
}

// Ejecutar verificación
verificarSistema().catch(error => {
  console.error('💥 Error en verificación:', error);
  process.exit(1);
});