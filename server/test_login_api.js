const axios = require('axios');

async function testLoginAndUsersApi() {
  try {
    console.log('🔐 Iniciando proceso de login...');
    
    // Hacer login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@oxitrans.com',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso!');
    console.log('Token obtenido:', loginResponse.data.token ? 'SÍ' : 'NO');
    
    const token = loginResponse.data.token;
    
    // Ahora probar el endpoint de usuarios
    console.log('\n👥 Probando endpoint de usuarios...');
    const usuariosResponse = await axios.get('http://localhost:3001/api/usuarios?page=1&limit=50', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API de usuarios funciona correctamente!');
    console.log('Total usuarios:', usuariosResponse.data.data.total);
    console.log('Usuarios en página:', usuariosResponse.data.data.usuarios.length);
    console.log('Estructura de respuesta:', {
      success: usuariosResponse.data.success,
      dataKeys: Object.keys(usuariosResponse.data.data)
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

testLoginAndUsersApi();
