// Usar fetch nativo de Node.js (disponible en v18+)

// Configuración del test
const BASE_URL = 'http://localhost:3001';

// Datos de prueba
const testUser = {
  email: 'david.rodriguez@oxitrans.com',
  password: 'password123'
};

// Coordenadas de prueba (alejadas de Conecta para probar la validación)
const testCoordinates = {
  latitude: 4.6097100,  // Coordenadas diferentes para ver la distancia
  longitude: -74.0817500
};

async function testLocationValidation() {
  try {
    console.log('🧪 Iniciando test de validación de ubicación...\n');
    
    // 1. Hacer login para obtener token
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Login falló: ${loginResponse.status} - ${errorText}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');
    console.log('📝 Usuario:', loginData.user.nombre, loginData.user.apellido);
    console.log('🏢 Regional ID:', loginData.user.regional_id);
    console.log('🎫 Token obtenido:', token.substring(0, 20) + '...\n');
    
    // 2. Probar validación de ubicación
    console.log('2️⃣ Probando validación de ubicación...');
    console.log('📍 Coordenadas de prueba:', testCoordinates);
    
    const validationResponse = await fetch(`${BASE_URL}/api/jornada/validar-ubicacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testCoordinates)
    });
    
    if (!validationResponse.ok) {
      const errorText = await validationResponse.text();
      throw new Error(`Validación falló: ${validationResponse.status} - ${errorText}`);
    }
    
    const validationData = await validationResponse.json();
    console.log('✅ Respuesta de validación recibida');
    console.log('📊 Resultado completo:', JSON.stringify(validationData, null, 2));
    
    // 3. Analizar resultado
    console.log('\n3️⃣ Análisis del resultado:');
    if (validationData.success && validationData.data) {
      const { valida, distancia, tolerancia, ubicacion, tipoValidacion } = validationData.data;
      
      console.log(`🎯 Tipo de validación: ${tipoValidacion}`);
      console.log(`📏 Distancia: ${Math.round(distancia)} metros`);
      console.log(`⚖️ Tolerancia: ${tolerancia} metros`);
      console.log(`✅ Válida: ${valida ? 'SÍ' : 'NO'}`);
      
      if (ubicacion) {
        console.log(`🏢 Ubicación de referencia: ${ubicacion.nombre}`);
        console.log(`📍 Coordenadas de referencia: ${ubicacion.latitud}, ${ubicacion.longitud}`);
      }
      
      // Mostrar diagnóstico
      if (tipoValidacion === 'regional') {
        console.log('\n🔍 DIAGNÓSTICO:');
        console.log('✅ El sistema está usando validación por regional');
        console.log(`✅ Encontró la regional: ${ubicacion?.nombre || 'N/A'}`);
        console.log(`✅ Distancia calculada: ${Math.round(distancia)}m`);
        
        if (valida) {
          console.log('✅ La ubicación está DENTRO de la tolerancia');
        } else {
          console.log('⚠️  La ubicación está FUERA de la tolerancia');
          console.log(`   Necesitas estar a menos de ${tolerancia}m de ${ubicacion?.nombre || 'la ubicación'}`);
        }
      } else if (tipoValidacion === 'sin_restriccion') {
        console.log('\n🔍 DIAGNÓSTICO:');
        console.log('⚠️  No hay restricciones de ubicación configuradas');
        console.log('   El usuario puede registrar desde cualquier lugar');
      }
      
    } else {
      console.log('❌ Error en la validación:', validationData.message);
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    
    // Si es un error de conexión, dar consejos
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log('\n💡 POSIBLES SOLUCIONES:');
      console.log('1. Asegúrate de que el servidor backend esté ejecutándose en http://localhost:5000');
      console.log('2. Ejecuta: npm run dev');
      console.log('3. Verifica que no haya errores en el servidor');
    }
  }
}

// Ejecutar el test
testLocationValidation();