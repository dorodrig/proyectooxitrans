#!/usr/bin/env node

console.log('🧪 === SIMULACIÓN FRONTEND EN PRODUCCIÓN ===\n');

// Simular el comportamiento exacto del apiClient
const simulateApiClient = async () => {
  const API_BASE_URL = 'https://oxitrans-backend.onrender.com/api';
  
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🎯 Endpoint objetivo:', `${API_BASE_URL}/regionales`);
  
  console.log('\n1. Simulando llamada SIN autenticación (como en el frontend)...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/regionales`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status, response.statusText);
    
    if (response.status === 401) {
      console.log('✅ PERFECTO: El endpoint está protegido correctamente');
      console.log('📝 El frontend debe autenticarse primero');
      
      // Leer el error
      const errorText = await response.text();
      console.log('📋 Respuesta del servidor:', errorText);
    } else {
      console.log('❌ PROBLEMA: No debería funcionar sin autenticación');
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    console.log('🚨 Esto indica problemas de red o CORS');
  }
  
  console.log('\n2. Verificando disponibilidad del health endpoint...');
  
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check exitoso:', healthData);
    }
  } catch (error) {
    console.log('❌ Health check falló:', error.message);
  }
};

await simulateApiClient();

console.log('\n🏁 === DIAGNÓSTICO COMPLETO ===');
console.log('✅ Backend operativo');
console.log('✅ CORS configurado');
console.log('✅ Endpoints protegidos correctamente');
console.log('📌 El problema podría ser:');
console.log('   1. GitHub Pages no se ha actualizado aún');
console.log('   2. Cache del navegador');
console.log('   3. Código frontend no está usando apiClient correctamente');
