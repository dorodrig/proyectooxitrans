#!/usr/bin/env node

console.log('🔍 === TEST CRÍTICO: ENDPOINT NOVEDADES ===\n');

const testNovedadesEndpoint = async () => {
  const baseUrl = 'https://oxitrans-backend.onrender.com/api';
  
  console.log('1. Verificando que el endpoint /novedades existe...');
  
  try {
    // Test sin autenticación (debería dar 401, no 404)
    const response = await fetch(`${baseUrl}/novedades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 401) {
      console.log('   ✅ PERFECTO: Endpoint existe y requiere autenticación');
      console.log('   ✅ ERROR "Ruta no encontrada" SOLUCIONADO');
    } else if (response.status === 404) {
      console.log('   ❌ ERROR: El endpoint aún no existe');
      console.log('   ⏰ Render puede tomar 2-3 minutos en actualizarse');
    } else {
      console.log(`   ⚠️  Status inesperado: ${response.status}`);
    }
    
    // Leer la respuesta para ver el error
    const text = await response.text();
    console.log(`   📋 Respuesta: ${text.substring(0, 100)}...`);
    
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }
};

const testMainEndpoint = async () => {
  console.log('\n2. Verificando endpoints disponibles...');
  
  try {
    const response = await fetch('https://oxitrans-backend.onrender.com/', {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   📋 Endpoints disponibles:');
      if (data.endpoints) {
        Object.entries(data.endpoints).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`);
        });
        
        if (data.endpoints.novedades) {
          console.log('   ✅ Endpoint /api/novedades registrado correctamente');
        } else {
          console.log('   ❌ Endpoint /api/novedades NO registrado');
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
};

await testNovedadesEndpoint();
await testMainEndpoint();

console.log('\n🏁 === RESUMEN ===');
console.log('Si ves status 401 en /novedades, la corrección funcionó');
console.log('Si ves status 404, espera 2-3 minutos para que Render se actualice');
console.log('¡El error "Ruta no encontrada" debería estar solucionado!');
