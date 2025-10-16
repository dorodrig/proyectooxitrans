#!/usr/bin/env node

console.log('🔍 === DEBUG DE PRODUCCIÓN ===\n');

// Simular el comportamiento del frontend en producción
const testProductionAPI = async () => {
  console.log('1. Probando API desde GitHub Pages...');
  
  try {
    // Simular llamada desde dorodrig.github.io
    const response = await fetch('https://oxitrans-backend.onrender.com/api/regionales', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://dorodrig.github.io'
      }
    });
    
    console.log('✅ Status:', response.status, response.statusText);
    console.log('✅ Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('📝 401 es esperado - requiere autenticación');
      console.log('✅ El endpoint funciona correctamente');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

const testCORS = async () => {
  console.log('\n2. Verificando configuración CORS...');
  
  try {
    const response = await fetch('https://oxitrans-backend.onrender.com/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://dorodrig.github.io',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ CORS OPTIONS response:', response.status);
    console.log('✅ CORS Headers:', Object.fromEntries(response.headers.entries()));
    
  } catch (error) {
    console.log('❌ CORS Error:', error.message);
  }
};

await testProductionAPI();
await testCORS();

console.log('\n🏁 === FIN DEBUG ===');
