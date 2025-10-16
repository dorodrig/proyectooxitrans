import fetch from 'node-fetch';

async function testColaboradoresEndpoint() {
  try {
    console.log('🔍 Probando endpoint de búsqueda de colaboradores...');
    
    const response = await fetch('http://localhost:3001/api/colaboradores/buscar/12345678?page=1&limit=10');
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error en respuesta:');
      console.log(errorText);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testColaboradoresEndpoint();