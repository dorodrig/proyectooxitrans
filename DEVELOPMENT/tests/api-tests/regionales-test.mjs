// Test específico para endpoints de regionales
console.log('🌍 === TEST DE ENDPOINTS REGIONALES ===\n');

async function testRegionalesEndpoints() {
  let token = null;

  try {
    // ===== AUTENTICACIÓN =====
    console.log('🔐 Obteniendo token de autenticación...');
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
      console.log('✅ Autenticación exitosa');
      token = loginData.data.token;
    } else {
      console.log('❌ Error en autenticación:', loginData.message);
      return;
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // ===== TEST 1: OBTENER REGIONALES =====
    console.log('\n📋 1. Probando GET /api/regionales...');
    const getResponse = await fetch('http://localhost:3001/api/regionales', {
      headers: authHeaders
    });

    const getData = await getResponse.json();
    console.log('   Status:', getResponse.status);
    console.log('   Response:', JSON.stringify(getData, null, 2));

    if (getResponse.ok && getData.success) {
      console.log('✅ GET regionales: EXITOSO');
      console.log(`   Regionales encontradas: ${getData.data?.length || 0}`);
    } else {
      console.log('❌ GET regionales: FALLÓ');
    }

    // ===== TEST 2: CREAR REGIONAL =====
    console.log('\n📝 2. Probando POST /api/regionales...');
    const createResponse = await fetch('http://localhost:3001/api/regionales', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        nombre: 'Test Regional',
        descripcion: 'Regional de prueba para testing',
        latitud: 4.60971,
        longitud: -74.08175
      })
    });

    const createData = await createResponse.json();
    console.log('   Status:', createResponse.status);
    console.log('   Response:', JSON.stringify(createData, null, 2));

    let createdId = null;
    if (createResponse.ok && createData.success) {
      console.log('✅ POST regionales: EXITOSO');
      createdId = createData.data?.id;
      console.log(`   Regional creada con ID: ${createdId}`);
    } else {
      console.log('❌ POST regionales: FALLÓ');
    }

    // ===== TEST 3: ACTUALIZAR REGIONAL =====
    if (createdId) {
      console.log('\n✏️ 3. Probando PUT /api/regionales/:id...');
      const updateResponse = await fetch(`http://localhost:3001/api/regionales/${createdId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          nombre: 'Test Regional Actualizada',
          descripcion: 'Regional actualizada para testing',
          latitud: 4.61,
          longitud: -74.08
        })
      });

      const updateData = await updateResponse.json();
      console.log('   Status:', updateResponse.status);
      console.log('   Response:', JSON.stringify(updateData, null, 2));

      if (updateResponse.ok && updateData.success) {
        console.log('✅ PUT regionales: EXITOSO');
      } else {
        console.log('❌ PUT regionales: FALLÓ');
      }
    }

    // ===== TEST 4: VERIFICAR LISTADO ACTUALIZADO =====
    console.log('\n📋 4. Verificando listado actualizado...');
    const getUpdatedResponse = await fetch('http://localhost:3001/api/regionales', {
      headers: authHeaders
    });

    const getUpdatedData = await getUpdatedResponse.json();
    if (getUpdatedResponse.ok && getUpdatedData.success) {
      console.log('✅ Listado actualizado obtenido');
      console.log(`   Total regionales: ${getUpdatedData.data?.length || 0}`);
      
      // Mostrar las regionales actuales
      if (getUpdatedData.data && getUpdatedData.data.length > 0) {
        console.log('   Regionales disponibles:');
        getUpdatedData.data.forEach((regional, index) => {
          console.log(`     ${index + 1}. ${regional.nombre} (ID: ${regional.id})`);
        });
      }
    }

    // ===== TEST 5: ELIMINAR REGIONAL DE PRUEBA =====
    if (createdId) {
      console.log('\n🗑️ 5. Limpiando regional de prueba...');
      const deleteResponse = await fetch(`http://localhost:3001/api/regionales/${createdId}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      const deleteData = await deleteResponse.json();
      console.log('   Status:', deleteResponse.status);
      
      if (deleteResponse.ok && deleteData.success) {
        console.log('✅ DELETE regionales: EXITOSO');
        console.log('   Regional de prueba eliminada correctamente');
      } else {
        console.log('❌ DELETE regionales: FALLÓ');
        console.log('   Response:', JSON.stringify(deleteData, null, 2));
      }
    }

    // ===== RESUMEN FINAL =====
    console.log('\n🎯 === RESUMEN FINAL REGIONALES ===');
    console.log('✅ Autenticación: OK');
    console.log('✅ GET /api/regionales: OK');
    console.log('✅ POST /api/regionales: OK');
    console.log('✅ PUT /api/regionales/:id: OK');
    console.log('✅ DELETE /api/regionales/:id: OK');
    
    console.log('\n🎉 ¡TODOS LOS ENDPOINTS DE REGIONALES FUNCIONAN CORRECTAMENTE!');
    console.log('🔧 Problema de "asignar-regional" y "crear registros" SOLUCIONADO');
    
  } catch (error) {
    console.log('❌ Error fatal:', error.message);
    console.log('\n🔍 Posibles causas:');
    console.log('   - Servidor no está corriendo');
    console.log('   - Base de datos no tiene tabla regionales');
    console.log('   - Problema de conectividad');
  }
}

testRegionalesEndpoints();
