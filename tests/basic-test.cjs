// Test básico con CommonJS
const axios = require('axios');

console.log('🧪 Iniciando test básico...');

axios.get('http://localhost:3001/api/health')
  .then(response => {
    console.log('✅ SUCCESS:', response.data);
    
    // Ahora probar login
    return axios.post('http://localhost:3001/api/auth/login', {
      documento: '12345678',
      password: 'password123'
    });
  })
  .then(response => {
    console.log('✅ LOGIN SUCCESS:', response.data.data.user.nombre);
    return response.data.data.token;
  })
  .then(token => {
    // Probar usuarios con token
    return axios.get('http://localhost:3001/api/usuarios', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  })
  .then(response => {
    console.log('✅ USUARIOS SUCCESS:', response.data.data.length, 'usuarios encontrados');
  })
  .catch(error => {
    console.log('❌ ERROR:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  });
