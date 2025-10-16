// Test completo CRUD de todos los endpoints
console.log('🧪 === TEST COMPLETO CRUD DE ENDPOINTS ===\n');

async function testCRUDEndpoints() {
  const results = {
    health: false,
    login: false,
    createUser: false,
    updateUser: false,
    deleteUser: false,
    createCargo: false,
    updateCargo: false,
    deleteCargo: false,
    createRegistro: false,
    statisticsEndpoints: false
  };

  let token = null;
  let createdUserId = null;
  let createdCargoId = null;
  let createdRegistroId = null;

  try {
    // ===== AUTENTICACIÓN =====
    console.log('🔐 === AUTENTICACIÓN ===');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login exitoso');
      results.login = true;
      token = loginData.data.token;
    } else {
      console.log('❌ Login falló');
      return results;
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // ===== TEST USUARIOS CRUD =====
    console.log('\n👥 === USUARIOS CRUD ===');
    
    // CREATE Usuario
    console.log('📝 Creando usuario...');
    const createUserResponse = await fetch('http://localhost:3001/api/usuarios', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        nombre: 'Test',
        apellido: 'Usuario',
        email: 'test@oxitrans.com',
        documento: '99999999',
        tipoDocumento: 'CC',
        rol: 'empleado',
        fechaIngreso: '2025-09-08',
        departamento: 'Testing',
        cargo: 'Tester',
        password: 'test123'
      })
    });

    if (createUserResponse.ok) {
      const userData = await createUserResponse.json();
      if (userData.success) {
        console.log('✅ Usuario creado exitosamente');
        results.createUser = true;
        createdUserId = userData.data.id;
      }
    } else {
      console.log('❌ Error creando usuario:', await createUserResponse.text());
    }

    // UPDATE Usuario
    if (createdUserId) {
      console.log('📝 Actualizando usuario...');
      const updateUserResponse = await fetch(`http://localhost:3001/api/usuarios/${createdUserId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          nombre: 'Test Updated',
          apellido: 'Usuario Updated',
          departamento: 'Testing Updated'
        })
      });

      if (updateUserResponse.ok) {
        const userData = await updateUserResponse.json();
        if (userData.success) {
          console.log('✅ Usuario actualizado exitosamente');
          results.updateUser = true;
        }
      } else {
        console.log('❌ Error actualizando usuario');
      }
    }

    // ===== TEST CARGOS CRUD =====
    console.log('\n💼 === CARGOS CRUD ===');
    
    // CREATE Cargo
    console.log('📝 Creando cargo...');
    const createCargoResponse = await fetch('http://localhost:3001/api/cargos', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        nombre: 'Cargo Test',
        descripcion: 'Cargo para testing',
        departamento: 'Testing',
        nivel: 'junior',
        salario: 1500000
      })
    });

    if (createCargoResponse.ok) {
      const cargoData = await createCargoResponse.json();
      if (cargoData.success) {
        console.log('✅ Cargo creado exitosamente');
        results.createCargo = true;
        createdCargoId = cargoData.data.id;
      }
    } else {
      console.log('❌ Error creando cargo:', await createCargoResponse.text());
    }

    // UPDATE Cargo
    if (createdCargoId) {
      console.log('📝 Actualizando cargo...');
      const updateCargoResponse = await fetch(`http://localhost:3001/api/cargos/${createdCargoId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          nombre: 'Cargo Test Updated',
          descripcion: 'Cargo actualizado para testing',
          salario: 1800000
        })
      });

      if (updateCargoResponse.ok) {
        const cargoData = await updateCargoResponse.json();
        if (cargoData.success) {
          console.log('✅ Cargo actualizado exitosamente');
          results.updateCargo = true;
        }
      } else {
        console.log('❌ Error actualizando cargo');
      }
    }

    // ===== TEST REGISTROS CRUD =====
    console.log('\n📋 === REGISTROS CRUD ===');
    
    // CREATE Registro
    console.log('📝 Creando registro...');
    const createRegistroResponse = await fetch('http://localhost:3001/api/registros', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        usuarioId: 1, // Usar el admin
        tipo: 'entrada',
        ubicacion: 'Oficina Principal',
        coordenadas: {
          latitud: 4.6097,
          longitud: -74.0817
        },
        notas: 'Registro de prueba'
      })
    });

    if (createRegistroResponse.ok) {
      const registroData = await createRegistroResponse.json();
      if (registroData.success) {
        console.log('✅ Registro creado exitosamente');
        results.createRegistro = true;
        createdRegistroId = registroData.data.id;
      }
    } else {
      console.log('❌ Error creando registro:', await createRegistroResponse.text());
    }

    // ===== TEST ENDPOINTS DE ESTADÍSTICAS =====
    console.log('\n📊 === ESTADÍSTICAS ===');
    
    const statsEndpoints = [
      '/api/usuarios/stats',
      '/api/registros/stats/usuario/1',
      '/api/registros/stats/departamento/Administración'
    ];

    let statsSuccess = 0;
    for (const endpoint of statsEndpoints) {
      console.log(`📊 Probando ${endpoint}...`);
      const statsResponse = await fetch(`http://localhost:3001${endpoint}`, {
        headers: authHeaders
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          console.log(`✅ ${endpoint}: OK`);
          statsSuccess++;
        }
      } else {
        console.log(`❌ ${endpoint}: FAILED`);
      }
    }

    if (statsSuccess === statsEndpoints.length) {
      results.statisticsEndpoints = true;
    }

    // ===== LIMPIEZA (DELETE) =====
    console.log('\n🧹 === LIMPIEZA ===');
    
    // DELETE Registro
    if (createdRegistroId) {
      console.log('🗑️ Eliminando registro...');
      const deleteRegistroResponse = await fetch(`http://localhost:3001/api/registros/${createdRegistroId}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (deleteRegistroResponse.ok) {
        console.log('✅ Registro eliminado');
      }
    }

    // DELETE Cargo
    if (createdCargoId) {
      console.log('🗑️ Eliminando cargo...');
      const deleteCargoResponse = await fetch(`http://localhost:3001/api/cargos/${createdCargoId}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (deleteCargoResponse.ok) {
        const cargoData = await deleteCargoResponse.json();
        if (cargoData.success) {
          console.log('✅ Cargo eliminado');
          results.deleteCargo = true;
        }
      }
    }

    // DELETE Usuario
    if (createdUserId) {
      console.log('🗑️ Eliminando usuario...');
      const deleteUserResponse = await fetch(`http://localhost:3001/api/usuarios/${createdUserId}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (deleteUserResponse.ok) {
        const userData = await deleteUserResponse.json();
        if (userData.success) {
          console.log('✅ Usuario eliminado');
          results.deleteUser = true;
        }
      }
    }

    // ===== RESUMEN FINAL =====
    console.log('\n🎯 === RESUMEN FINAL CRUD ===');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    
    console.log(`Login:               ${results.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Crear Usuario:       ${results.createUser ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Actualizar Usuario:  ${results.updateUser ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Eliminar Usuario:    ${results.deleteUser ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Crear Cargo:         ${results.createCargo ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Actualizar Cargo:    ${results.updateCargo ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Eliminar Cargo:      ${results.deleteCargo ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Crear Registro:      ${results.createRegistro ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Estadísticas:        ${results.statisticsEndpoints ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log(`\nResultado: ${passedTests}/${totalTests} tests pasaron`);
    console.log(`Porcentaje: ${Math.round((passedTests/totalTests)*100)}%`);
    
    if (passedTests >= totalTests * 0.8) {
      console.log('\n🎉 ¡LA API ESTÁ FUNCIONANDO CORRECTAMENTE!');
      console.log('✅ Lista para producción');
    } else {
      console.log('\n⚠️  La API necesita algunas correcciones antes de producción');
    }
    
  } catch (error) {
    console.log('❌ Error fatal:', error.message);
  }
}

testCRUDEndpoints();
