// Test simple para verificar conectividad del backend
const BASE_URL = 'http://localhost:3001';

console.log('🔍 Verificando conectividad del backend...');

// Test básico de conectividad
try {
  console.log(`📡 Intentando conectar a: ${BASE_URL}`);
  const response = await fetch(BASE_URL);
  console.log(`✅ Respuesta del servidor: ${response.status} ${response.statusText}`);
  
  const text = await response.text();
  console.log('📄 Contenido:', text.substring(0, 200) + '...');
} catch (error) {
  console.error('❌ Error de conectividad:', error.message);
}

// Test del endpoint de health (si existe)
try {
  console.log('\n🏥 Verificando endpoint de salud...');
  const healthResponse = await fetch(`${BASE_URL}/health`);
  console.log(`📋 Health status: ${healthResponse.status}`);
  
  if (healthResponse.ok) {
    const healthData = await healthResponse.json();
    console.log('💚 Health data:', healthData);
  }
} catch (error) {
  console.log('ℹ️  Endpoint /health no disponible');
}

// Test del endpoint de API
try {
  console.log('\n🔗 Verificando endpoint de API...');
  const apiResponse = await fetch(`${BASE_URL}/api`);
  console.log(`📋 API status: ${apiResponse.status}`);
  
  if (apiResponse.ok) {
    const apiData = await apiResponse.text();
    console.log('🔧 API response:', apiData.substring(0, 200));
  }
} catch (error) {
  console.log('⚠️  Endpoint /api no responde:', error.message);
}