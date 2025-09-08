// Test básico con ES modules
import axios from 'axios';

console.log('🧪 Iniciando test básico...');

try {
  const response = await axios.get('http://localhost:3001/api/health');
  console.log('✅ SUCCESS:', response.data);
} catch (error) {
  console.log('❌ ERROR:', error.message);
}
