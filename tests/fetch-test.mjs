// Test con fetch nativo de Node.js
console.log('🧪 Iniciando test con fetch nativo...');

async function testEndpoints() {
  try {
    // Test 1: Health Check
    console.log('📡 Probando health check...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Login
    console.log('📡 Probando login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documento: '12345678',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.data?.user?.nombre);
    
    const token = loginData.data?.token;
    
    if (token) {
      // Test 3: Usuarios
      console.log('📡 Probando usuarios...');
      const usersResponse = await fetch('http://localhost:3001/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const usersData = await usersResponse.json();
      console.log('✅ Usuarios:', usersData.data?.length, 'usuarios encontrados');
    }
    
    console.log('🎉 Todos los tests completados');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testEndpoints();
