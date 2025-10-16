// Test rápido para verificar endpoint global
console.log('🧪 Testing endpoint global...');

try {
  const response = await fetch('http://localhost:3001/api/jornada-config/global', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Sin token para ver el error de autenticación (que confirmaría que llega al endpoint)
    }
  });
  
  console.log(`📡 Status: ${response.status} ${response.statusText}`);
  const data = await response.text();
  console.log('📄 Response:', data.substring(0, 300));
  
  if (response.status === 401 || response.status === 403) {
    console.log('✅ El endpoint /global está funcionando (requiere autenticación)');
  } else if (response.status === 404) {
    console.log('❌ El endpoint /global NO está registrado');
  } else {
    console.log('🤔 Respuesta inesperada');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}