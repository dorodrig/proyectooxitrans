// Test completo de todos los endpoints
console.log('🧪 === TEST COMPLETO DE ENDPOINTS ===\n');

async function testAllEndpoints() {
  const results = {
    health: false,
    login: false,
    users: false,
    cargos: false,
    registros: false
  };

  try {
    // ===== TEST 1: HEALTH CHECK =====
    console.log('📡 1. Probando Health Check...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok && healthData.success) {
      console.log('✅ Health Check: OK');
      results.health = true;
    } else {
      console.log('❌ Health Check: FAILED');
      console.log('   Response:', healthData);
    }

    // ===== TEST 2: LOGIN =====
    console.log('\n📡 2. Probando Login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Response:', JSON.stringify(loginData, null, 2));
    
    let token = null;
    if (loginResponse.ok && loginData.success && loginData.data?.token) {
      console.log('✅ Login: OK');
      console.log('   Usuario:', loginData.data.user?.nombre, loginData.data.user?.apellido);
      results.login = true;
      token = loginData.data.token;
    } else {
      console.log('❌ Login: FAILED');
    }

    // ===== TEST 3: USUARIOS (requiere token) =====
    if (token) {
      console.log('\n📡 3. Probando Obtener Usuarios...');
      const usersResponse = await fetch('http://localhost:3001/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const usersData = await usersResponse.json();
      console.log('   Status:', usersResponse.status);
      
      if (usersResponse.ok && usersData.success) {
        console.log('✅ Usuarios: OK');
        console.log('   Cantidad:', usersData.data?.length || 0, 'usuarios');
        results.users = true;
      } else {
        console.log('❌ Usuarios: FAILED');
        console.log('   Response:', usersData);
      }

      // ===== TEST 4: CARGOS =====
      console.log('\n📡 4. Probando Obtener Cargos...');
      const cargosResponse = await fetch('http://localhost:3001/api/cargos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const cargosData = await cargosResponse.json();
      console.log('   Status:', cargosResponse.status);
      
      if (cargosResponse.ok && cargosData.success) {
        console.log('✅ Cargos: OK');
        console.log('   Cantidad:', cargosData.data?.length || 0, 'cargos');
        results.cargos = true;
      } else {
        console.log('❌ Cargos: FAILED');
        console.log('   Response:', cargosData);
      }

      // ===== TEST 5: REGISTROS =====
      console.log('\n📡 5. Probando Obtener Registros de Hoy...');
      const registrosResponse = await fetch('http://localhost:3001/api/registros/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const registrosData = await registrosResponse.json();
      console.log('   Status:', registrosResponse.status);
      
      if (registrosResponse.ok && registrosData.success) {
        console.log('✅ Registros: OK');
        console.log('   Cantidad:', registrosData.data?.length || 0, 'registros de hoy');
        results.registros = true;
      } else {
        console.log('❌ Registros: FAILED');
        console.log('   Response:', registrosData);
      }
    } else {
      console.log('\n⚠️  Tests con autenticación omitidos (no hay token)');
    }

    // ===== RESUMEN FINAL =====
    console.log('\n🎯 === RESUMEN FINAL ===');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    
    console.log(`Health Check:     ${results.health ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Login:           ${results.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Usuarios:        ${results.users ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Cargos:          ${results.cargos ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Registros:       ${results.registros ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log(`\nResultado: ${passedTests}/${totalTests} tests pasaron`);
    console.log(`Porcentaje: ${Math.round((passedTests/totalTests)*100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ¡TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE!');
    } else {
      console.log('\n⚠️  Algunos endpoints necesitan revisión');
    }
    
  } catch (error) {
    console.log('❌ Error fatal:', error.message);
  }
}

testAllEndpoints();
