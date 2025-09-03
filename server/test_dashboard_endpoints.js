const axios = require('axios');

async function testDashboardEndpoints() {
  try {
    console.log('🔐 Haciendo login para obtener token...');
    
    // Hacer login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      documento: '12345678',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso!');
    console.log('Token recibido:', !!token);
    
    // Headers con autorización
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📊 Probando endpoint /api/usuarios/stats...');
    const statsResponse = await axios.get('http://localhost:3001/api/usuarios/stats', { headers });
    console.log('✅ Stats Response:', statsResponse.data);
    
    console.log('\n📈 Probando endpoint /api/usuarios/por-rol...');
    const porRolResponse = await axios.get('http://localhost:3001/api/usuarios/por-rol', { headers });
    console.log('✅ Por Rol Response:', porRolResponse.data);
    
    console.log('\n🎉 ¡Todos los endpoints funcionan correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('URL:', error.config?.url);
    }
  }
}

testDashboardEndpoints();
