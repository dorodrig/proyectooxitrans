// Test simple de conectividad
console.log('🔄 Probando conectividad...');

try {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      documento: '12345678',
      password: 'admin123'
    })
  });

  console.log('Status:', response.status);
  console.log('Response OK:', response.ok);
  
  const data = await response.json();
  console.log('Data:', data);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}