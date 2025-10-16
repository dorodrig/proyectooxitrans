// Test rápido para verificar API jornada-config
async function testJornadaConfigAPI() {
  try {
    console.log('🧪 Probando API jornada-config...');
    
    // Obtener token del localStorage
    const authData = localStorage.getItem('auth-storage');
    let token = '';
    
    if (authData) {
      const { state } = JSON.parse(authData);
      token = state.token;
      console.log('🔑 Token encontrado:', token ? '✅' : '❌');
    }
    
    // Test GET /api/jornada-config/1
    console.log('📡 GET /api/jornada-config/1');
    const response = await fetch('/api/jornada-config/1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Data:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
  }
}

// Ejecutar test
testJornadaConfigAPI();