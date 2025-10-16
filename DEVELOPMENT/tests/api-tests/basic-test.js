// Test muy básico
const axios = require('axios');

console.log('Iniciando test...');

axios.get('http://localhost:3001/api/health')
  .then(response => {
    console.log('SUCCESS:', response.data);
  })
  .catch(error => {
    console.log('ERROR:', error.message);
  });
