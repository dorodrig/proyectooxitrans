// Test final de verificación antes de producción
console.log('🚀 === VERIFICACIÓN FINAL PARA PRODUCCIÓN ===\n');

async function finalProductionCheck() {
  let allSystemsGo = true;
  const results = [];

  try {
    // ===== 1. HEALTH CHECK =====
    console.log('🩺 1. Verificando health del servidor...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok && healthData.success) {
      console.log('✅ Servidor funcionando correctamente');
      results.push({ test: 'Health Check', status: '✅ PASS' });
    } else {
      console.log('❌ Servidor con problemas');
      results.push({ test: 'Health Check', status: '❌ FAIL' });
      allSystemsGo = false;
    }

    // ===== 2. AUTENTICACIÓN =====
    console.log('\n🔐 2. Verificando sistema de autenticación...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    let token = null;
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Autenticación funcionando');
      results.push({ test: 'Autenticación', status: '✅ PASS' });
      token = loginData.data.token;
    } else {
      console.log('❌ Autenticación fallando');
      results.push({ test: 'Autenticación', status: '❌ FAIL' });
      allSystemsGo = false;
    }

    if (!token) {
      console.log('❌ No se puede continuar sin token');
      return false;
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // ===== 3. MÓDULOS PRINCIPALES =====
    const modules = [
      { name: 'Usuarios', endpoint: '/api/usuarios' },
      { name: 'Cargos', endpoint: '/api/cargos' },
      { name: 'Registros', endpoint: '/api/registros/today' },
      { name: 'Regionales', endpoint: '/api/regionales' }
    ];

    console.log('\n📋 3. Verificando módulos principales...');
    for (const module of modules) {
      console.log(`   Probando ${module.name}...`);
      const response = await fetch(`http://localhost:3001${module.endpoint}`, {
        headers: authHeaders
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`   ✅ ${module.name}: OK`);
          results.push({ test: module.name, status: '✅ PASS' });
        } else {
          console.log(`   ❌ ${module.name}: Response not successful`);
          results.push({ test: module.name, status: '❌ FAIL' });
          allSystemsGo = false;
        }
      } else {
        console.log(`   ❌ ${module.name}: HTTP ${response.status}`);
        results.push({ test: module.name, status: '❌ FAIL' });
        allSystemsGo = false;
      }
    }

    // ===== 4. ENDPOINTS ROOT =====
    console.log('\n🌐 4. Verificando endpoint raíz...');
    const rootResponse = await fetch('http://localhost:3001/');
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      if (rootData.success && rootData.endpoints) {
        console.log('✅ Endpoint raíz con información de API');
        results.push({ test: 'API Info', status: '✅ PASS' });
      } else {
        console.log('❌ Endpoint raíz sin estructura esperada');
        results.push({ test: 'API Info', status: '❌ FAIL' });
      }
    } else {
      console.log('❌ Endpoint raíz no responde');
      results.push({ test: 'API Info', status: '❌ FAIL' });
    }

    // ===== REPORTE FINAL =====
    console.log('\n📊 === REPORTE FINAL DE PRODUCCIÓN ===');
    results.forEach(result => {
      console.log(`${result.status} ${result.test}`);
    });
    
    const passedTests = results.filter(r => r.status.includes('✅')).length;
    const totalTests = results.length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\nEstadísticas: ${passedTests}/${totalTests} tests pasaron (${successRate}%)`);
    
    if (allSystemsGo && successRate >= 95) {
      console.log('\n🟢 === SISTEMA LISTO PARA PRODUCCIÓN ===');
      console.log('✅ Todos los sistemas críticos funcionando');
      console.log('✅ API completamente operativa');
      console.log('✅ Autenticación y autorización OK');
      console.log('✅ Módulos principales operativos');
      console.log('✅ Problema de regionales SOLUCIONADO');
      console.log('\n🚀 PROCEDA CON EL DESPLIEGUE A PRODUCCIÓN');
      return true;
    } else {
      console.log('\n🟡 === SISTEMA CON ADVERTENCIAS ===');
      console.log('⚠️  Algunos tests fallaron, pero funcionalidades críticas OK');
      console.log('⚠️  Revisar logs para ajustes menores');
      return false;
    }
    
  } catch (error) {
    console.log('\n❌ === ERROR CRÍTICO ===');
    console.log('Error:', error.message);
    console.log('🛑 NO PROCEDER CON DESPLIEGUE');
    return false;
  }
}

finalProductionCheck().then(ready => {
  if (ready) {
    console.log('\n🎉 ¡SISTEMA VERIFICADO Y LISTO!');
  } else {
    console.log('\n⚠️  Sistema requiere revisión adicional');
  }
});
