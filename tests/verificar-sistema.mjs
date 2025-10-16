// ================================================
// TEST DE ESPERA Y RETRY - SETUP COMPLETO
// Maneja rate limiting y reintenta automáticamente
// ================================================

const BASE_URL = 'http://localhost:3001/api';

async function esperarYReintentar(mensaje, segundos = 30) {
  console.log(`⏳ ${mensaje}`);
  console.log(`⌛ Esperando ${segundos} segundos para evitar rate limiting...`);
  
  for (let i = segundos; i > 0; i--) {
    process.stdout.write(`\r⏰ Tiempo restante: ${i} segundos `);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\n✅ Continuando...\n');
}

async function loginConReintento(documento = '12345678', password = 'admin123', maxIntentos = 3) {
  console.log(`🔐 Intentando login con documento: ${documento}`);
  
  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Login exitoso en intento ${intento}`);
        return data.token;
      } else {
        console.log(`❌ Intento ${intento}/${maxIntentos}: ${data.message || data.error}`);
        
        if (data.message?.includes('Demasiadas solicitudes') || data.message?.includes('rate limit')) {
          if (intento < maxIntentos) {
            await esperarYReintentar(`Rate limiting detectado. Reintentando...`, 45);
          }
        } else if (data.message?.includes('Credenciales inválidas')) {
          console.log('❌ Credenciales incorrectas. Verifica que exista el usuario administrador.');
          return null;
        }
      }
    } catch (error) {
      console.log(`❌ Error de conexión en intento ${intento}: ${error.message}`);
    }
    
    if (intento < maxIntentos) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return null;
}

async function verificarConexion() {
  try {
    console.log('🔍 Verificando conexión al servidor...');
    const response = await fetch(BASE_URL.replace('/api', ''));
    
    if (response.ok) {
      console.log('✅ Servidor disponible');
      return true;
    } else {
      console.log(`❌ Servidor responde con error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    return false;
  }
}

async function verificarBaseDatos(token) {
  try {
    console.log('🗄️  Verificando acceso a base de datos...');
    
    // Intentar listar usuarios existentes
    const response = await fetch(`${BASE_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const usuarios = data.usuarios || data || [];
      console.log(`✅ Base de datos accesible. Usuarios existentes: ${Array.isArray(usuarios) ? usuarios.length : 0}`);
      return true;
    } else {
      console.log(`❌ Error accediendo a base de datos: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error verificando base de datos: ${error.message}`);
    return false;
  }
}

async function mostrarEstadoSistema() {
  console.log('📊 VERIFICACIÓN DEL SISTEMA');
  console.log('='.repeat(50));
  
  const conexionOk = await verificarConexion();
  if (!conexionOk) {
    console.log('💥 El servidor no está disponible. Verifica que esté ejecutándose en http://localhost:3001');
    return false;
  }
  
  await esperarYReintentar('Preparando intento de login...', 10);
  
  const token = await loginConReintento();
  if (!token) {
    console.log('\n💡 POSIBLES SOLUCIONES:');
    console.log('   1. Verifica que la base de datos esté inicializada');
    console.log('   2. Ejecuta el seeder de la base de datos si es necesario');
    console.log('   3. Verifica que el usuario admin existe con documento "12345678"');
    console.log('   4. Espera más tiempo para que se resetee el rate limiting');
    return false;
  }
  
  const dbOk = await verificarBaseDatos(token);
  if (!dbOk) {
    console.log('💥 No se puede acceder a la base de datos correctamente');
    return false;
  }
  
  console.log('\n🎉 Sistema verificado correctamente');
  console.log('✅ Servidor funcionando');
  console.log('✅ Autenticación exitosa');
  console.log('✅ Base de datos accesible');
  
  console.log('\n🚀 READY TO PROCEED');
  console.log('   Ahora puedes ejecutar el setup completo de regionales y usuarios');
  console.log('   Una vez que veas este mensaje, ejecuta:');
  console.log('   📝 node tests/setup-completo-jornadas.mjs');
  
  return true;
}

// ================================================
// EJECUCIÓN
// ================================================

console.log('🔧 DIAGNÓSTICO Y PREPARACIÓN DEL SISTEMA');
console.log('='.repeat(60));
console.log('Este script verifica que todo esté listo para el setup completo');
console.log('⏳ Iniciando verificación en 3 segundos...\n');

setTimeout(async () => {
  try {
    const sistemaListo = await mostrarEstadoSistema();
    
    if (sistemaListo) {
      console.log('\n💚 SISTEMA LISTO PARA SETUP COMPLETO');
    } else {
      console.log('\n🔴 SISTEMA NO LISTO - Revisa los errores arriba');
    }
  } catch (error) {
    console.error('💥 Error en verificación del sistema:', error);
  }
}, 3000);