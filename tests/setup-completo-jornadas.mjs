// ================================================
// TEST COMPLETO: SETUP + SIMULACIÓN DE JORNADAS
// 1. Crea regionales/sedes con coordenadas GPS
// 2. Crea usuarios de prueba asignados a sedes
// 3. Ejecuta simulación de 15 días de jornadas laborales
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// ================================================
// DATOS DE REGIONALES/SEDES CON COORDENADAS
// ================================================

const regionalesData = [
  {
    nombre: 'Regional Duitama',
    descripcion: 'Avenida las américas 27 -31 - Tel: +57 310 3009122',
    latitud: 5.8245, // Coordenadas aproximadas de Duitama
    longitud: -73.0515
  },
  {
    nombre: 'Regional Bucaramanga',
    descripcion: 'Calle 72 #36 w-84 vía a provincia de soto 2, al lado de dispapeles - Tel: +57 310 3009122',
    latitud: 7.1254, // Coordenadas aproximadas de Bucaramanga
    longitud: -73.1198
  },
  {
    nombre: 'Regional Barranquilla',
    descripcion: 'Vía 40 #75-31 La concepción - Tel: +57 310 3009122',
    latitud: 10.9639, // Coordenadas aproximadas de Barranquilla
    longitud: -74.7964
  },
  {
    nombre: 'Drummond Mina',
    descripcion: 'Vía a chiriguana - Tel: +57 310 3009122',
    latitud: 9.3611, // Coordenadas aproximadas de Chiriguaná
    longitud: -73.6070
  },
  {
    nombre: 'Regional Bogotá',
    descripcion: 'Avenida carrera 68 # 11-32 - Tel: +57 310 3009122',
    latitud: 4.6097, // Coordenadas aproximadas de Bogotá
    longitud: -74.0817
  },
  {
    nombre: 'Regional Cartagena',
    descripcion: 'Vía mamonal km 4 - Tel: +57 310 3009122',
    latitud: 10.3932, // Coordenadas aproximadas de Cartagena
    longitud: -75.4794
  },
  {
    nombre: 'Regional Neiva',
    descripcion: 'Cra 7 No. 19-99 Sur. Zona Industrial - Tel: +57 310 3009122',
    latitud: 2.9273, // Coordenadas aproximadas de Neiva
    longitud: -75.2819
  }
];

// ================================================
// DATOS DE USUARIOS DE PRUEBA
// ================================================

const usuariosData = [
  {
    nombre: 'Carlos Andrés',
    apellido: 'Rodríguez García',
    documento: '12345001',
    tipoDocumento: 'CC',
    email: 'carlos.rodriguez@oxitrans.com',
    telefono: '3001234567',
    password: 'empleado123',
    rol: 'empleado',
    cargo: 'Conductor Senior',
    departamento: 'Operaciones',
    fechaIngreso: '2024-01-15',
    estado: 'activo',
    regional_index: 0 // Duitama
  },
  {
    nombre: 'María Fernanda',
    apellido: 'López Martínez',
    documento: '12345002',
    tipoDocumento: 'CC',
    email: 'maria.lopez@oxitrans.com',
    telefono: '3012345678',
    password: 'empleado123',
    rol: 'empleado',
    cargo: 'Operadora Logística',
    departamento: 'Logística',
    fechaIngreso: '2024-02-01',
    estado: 'activo',
    regional_index: 1 // Bucaramanga
  },
  {
    nombre: 'Juan Pablo',
    apellido: 'Martínez Silva',
    documento: '12345003',
    tipoDocumento: 'CC',
    email: 'juan.martinez@oxitrans.com',
    telefono: '3023456789',
    password: 'empleado123',
    rol: 'empleado',
    cargo: 'Conductor Junior',
    departamento: 'Operaciones',
    fechaIngreso: '2024-02-15',
    estado: 'activo',
    regional_index: 2 // Barranquilla
  },
  {
    nombre: 'Ana Sofía',
    apellido: 'García Herrera',
    documento: '12345004',
    tipoDocumento: 'CC',
    email: 'ana.garcia@oxitrans.com',
    telefono: '3034567890',
    password: 'empleado123',
    rol: 'supervisor',
    cargo: 'Supervisora de Turno',
    departamento: 'Supervisión',
    fechaIngreso: '2023-12-01',
    estado: 'activo',
    regional_index: 3 // Drummond
  },
  {
    nombre: 'Diego Alejandro',
    apellido: 'Ruiz Castro',
    documento: '12345005',
    tipoDocumento: 'CC',
    email: 'diego.ruiz@oxitrans.com',
    telefono: '3045678901',
    password: 'empleado123',
    rol: 'empleado',
    cargo: 'Conductor Senior',
    departamento: 'Operaciones',
    fechaIngreso: '2024-03-01',
    estado: 'activo',
    regional_index: 4 // Bogotá
  },
  {
    nombre: 'Claudia Patricia',
    apellido: 'Herrera Morales',
    documento: '12345006',
    tipoDocumento: 'CC',
    email: 'claudia.herrera@oxitrans.com',
    telefono: '3056789012',
    password: 'empleado123',
    rol: 'empleado',
    cargo: 'Operadora Logística',
    departamento: 'Logística',
    fechaIngreso: '2024-03-15',
    estado: 'activo',
    regional_index: 5 // Cartagena
  },
  {
    nombre: 'Roberto Carlos',
    apellido: 'Sánchez Jiménez',
    documento: '12345007',
    tipoDocumento: 'CC',
    email: 'roberto.sanchez@oxitrans.com',
    telefono: '3067890123',
    password: 'empleado123',
    rol: 'empleado',
    cargo: 'Conductor Senior',
    departamento: 'Operaciones',
    fechaIngreso: '2024-04-01',
    estado: 'activo',
    regional_index: 6 // Neiva
  },
  {
    nombre: 'Luisa Fernanda',
    apellido: 'Castro Vargas',
    documento: '12345008',
    tipoDocumento: 'CC',
    email: 'luisa.castro@oxitrans.com',
    telefono: '3078901234',
    password: 'empleado123',
    rol: 'supervisor',
    cargo: 'Supervisora Regional',
    departamento: 'Supervisión',
    fechaIngreso: '2023-11-15',
    estado: 'activo',
    regional_index: 0 // Duitama
  },
  {
    nombre: 'Andrés Felipe',
    apellido: 'Moreno Quintero',
    documento: '12345009',
    tipoDocumento: 'CC',
    email: 'andres.moreno@oxitrans.com',
    telefono: '3089012345',
    password: 'empleado123',
    rol: 'empleado',
    cargo: 'Técnico de Mantenimiento',
    departamento: 'Mantenimiento',
    fechaIngreso: '2024-04-15',
    estado: 'activo',
    regional_index: 1 // Bucaramanga
  },
  {
    nombre: 'Sandra Milena',
    apellido: 'Jiménez Torres',
    documento: '12345010',
    tipoDocumento: 'CC',
    email: 'sandra.jimenez@oxitrans.com',
    telefono: '3090123456',
    password: 'empleado123',
    rol: 'empleado',
    cargo: 'Operadora Logística',
    departamento: 'Logística',
    fechaIngreso: '2024-05-01',
    estado: 'activo',
    regional_index: 4 // Bogotá
  }
];

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

async function loginAdmin() {
  try {
    console.log('🔐 Intentando login como administrador...');
    
    // Intentar con credenciales por defecto del schema
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login de administrador exitoso');
      return data.data?.token || data.token;
    } else {
      console.log(`❌ Error login admin: ${data.message || data.error}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión en login admin:', error.message);
    return null;
  }
}

async function crearRegional(adminToken, regionalData) {
  try {
    const response = await fetch(`${BASE_URL}/regionales`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(regionalData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Regional creada: ${regionalData.nombre}`);
      return data.regional || data;
    } else {
      console.log(`❌ Error creando regional ${regionalData.nombre}: ${data.message || data.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error de conexión creando regional ${regionalData.nombre}: ${error.message}`);
    return null;
  }
}

async function crearUsuario(adminToken, userData, regionalId) {
  try {
    // Crear objeto solo con los campos requeridos por las validaciones
    const usuarioCompleto = {
      nombre: userData.nombre,
      apellido: userData.apellido,
      documento: userData.documento,
      tipoDocumento: userData.tipoDocumento,
      email: userData.email,
      telefono: userData.telefono,
      rol: userData.rol,
      cargo: userData.cargo,
      departamento: userData.departamento,
      fechaIngreso: userData.fechaIngreso,
      regional_id: regionalId
    };

    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuarioCompleto)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Usuario creado: ${userData.nombre} ${userData.apellido} (${userData.documento})`);
      return data.usuario || data;
    } else {
      console.log(`❌ Error creando usuario ${userData.nombre}: ${data.message || data.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error de conexión creando usuario ${userData.nombre}: ${error.message}`);
    return null;
  }
}

function generarUbicacionConVariacion(ubicacionBase, variacionMetros = 25) {
  const variacionLat = (Math.random() - 0.5) * (variacionMetros / 111000);
  const variacionLng = (Math.random() - 0.5) * (variacionMetros / 111000);
  
  return {
    latitud: ubicacionBase.latitud + variacionLat,
    longitud: ubicacionBase.longitud + variacionLng
  };
}

async function registrarEventoJornada(token, tipoEvento, ubicacion, empleado) {
  try {
    const response = await fetch(`${BASE_URL}/jornada/${tipoEvento}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ubicacion)
    });

    const data = await response.json();
    
    if (response.ok) {
      const hora = new Date().toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      console.log(`   ✅ ${empleado.nombre}: ${tipoEvento.replace('_', ' ')} (${hora})`);
      return data;
    } else {
      console.log(`   ❌ ${empleado.nombre}: Error en ${tipoEvento} - ${data.message || data.error}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ ${empleado.nombre}: Error de conexión en ${tipoEvento} - ${error.message}`);
    return null;
  }
}

async function loginUsuario(documento, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento, password })
    });

    const data = await response.json();
    if (response.ok) {
      return data.data?.token || data.token;
    } else {
      console.error(`❌ Error login ${documento}: ${data.message || data.error}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error conexión login ${documento}:`, error.message);
    return null;
  }
}

function obtenerFechasSemanaLaboral(fechaInicio, diasRequeridos = 15) {
  const fechas = [];
  const fecha = new Date(fechaInicio);
  let diasAgregados = 0;
  
  while (diasAgregados < diasRequeridos) {
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) { // Lunes a viernes
      fechas.push(new Date(fecha));
      diasAgregados++;
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  
  return fechas;
}

// ================================================
// SIMULACIÓN DE JORNADA COMPLETA
// ================================================

async function simularJornadaCompleta(empleado, fecha, regional) {
  console.log(`\n👤 Simulando jornada de ${empleado.nombre} - ${fecha.toLocaleDateString('es-CO')}`);
  
  // Probabilidad de ausencia (5%)
  if (Math.random() < 0.05) {
    console.log(`   🏠 ${empleado.nombre}: Ausente hoy`);
    return { success: true, ausente: true };
  }

  const token = await loginUsuario(empleado.documento, empleado.password);
  if (!token) {
    console.log(`   ⚠️  No se pudo autenticar ${empleado.nombre}`);
    return { success: false, error: 'Autenticación fallida' };
  }

  try {
    const ubicacionBase = {
      latitud: regional.latitud,
      longitud: regional.longitud
    };

    // 1. LLEGADA
    await registrarEventoJornada(token, 'llegada', 
      generarUbicacionConVariacion(ubicacionBase), empleado);
    await new Promise(resolve => setTimeout(resolve, 200));

    // 2. DESCANSO MAÑANA
    await registrarEventoJornada(token, 'descanso_manana', 
      generarUbicacionConVariacion(ubicacionBase), empleado);
    await new Promise(resolve => setTimeout(resolve, 150));

    // 3. FIN DESCANSO MAÑANA
    await registrarEventoJornada(token, 'fin_descanso_manana', 
      generarUbicacionConVariacion(ubicacionBase), empleado);
    await new Promise(resolve => setTimeout(resolve, 200));

    // 4. ALMUERZO
    await registrarEventoJornada(token, 'almuerzo', 
      generarUbicacionConVariacion(ubicacionBase), empleado);
    await new Promise(resolve => setTimeout(resolve, 150));

    // 5. FIN ALMUERZO
    await registrarEventoJornada(token, 'fin_almuerzo', 
      generarUbicacionConVariacion(ubicacionBase), empleado);
    await new Promise(resolve => setTimeout(resolve, 200));

    // 6. DESCANSO TARDE
    await registrarEventoJornada(token, 'descanso_tarde', 
      generarUbicacionConVariacion(ubicacionBase), empleado);
    await new Promise(resolve => setTimeout(resolve, 150));

    // 7. FIN DESCANSO TARDE
    await registrarEventoJornada(token, 'fin_descanso_tarde', 
      generarUbicacionConVariacion(ubicacionBase), empleado);
    await new Promise(resolve => setTimeout(resolve, 200));

    // 8. SALIDA
    await registrarEventoJornada(token, 'salida', 
      generarUbicacionConVariacion(ubicacionBase), empleado);

    console.log(`   ✨ Jornada completa simulada para ${empleado.nombre}`);
    return { success: true, eventosRegistrados: 8 };

  } catch (error) {
    console.log(`   💥 Error durante jornada de ${empleado.nombre}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ================================================
// FUNCIÓN PRINCIPAL
// ================================================

async function ejecutarSetupCompleto() {
  console.log('🚀 INICIANDO SETUP COMPLETO + SIMULACIÓN DE JORNADAS');
  console.log('='.repeat(80));
  console.log('FASE 1: Creando regionales y usuarios');
  console.log('FASE 2: Simulando 15 días de jornadas laborales');
  console.log('='.repeat(80));

  // ============================================
  // FASE 1: SETUP DE DATOS
  // ============================================
  
  const adminToken = await loginAdmin();
  if (!adminToken) {
    console.error('💥 No se pudo obtener token de administrador. Abortando...');
    return;
  }

  console.log('\n📍 CREANDO REGIONALES...');
  console.log('─'.repeat(50));
  
  const regionalesCreadas = [];
  for (let i = 0; i < regionalesData.length; i++) {
    const regional = await crearRegional(adminToken, regionalesData[i]);
    if (regional) {
      regionalesCreadas.push({
        ...regionalesData[i],
        id: regional.id
      });
    }
    await new Promise(resolve => setTimeout(resolve, 300)); // Pausa entre creaciones
  }

  console.log(`\n✅ Regionales creadas: ${regionalesCreadas.length}/${regionalesData.length}`);

  console.log('\n👥 CREANDO USUARIOS...');
  console.log('─'.repeat(50));

  const usuariosCreados = [];
  for (let i = 0; i < usuariosData.length; i++) {
    const userData = usuariosData[i];
    const regional = regionalesCreadas[userData.regional_index];
    
    if (regional) {
      const usuario = await crearUsuario(adminToken, userData, regional.id);
      if (usuario) {
        usuariosCreados.push({
          ...userData,
          id: usuario.id,
          regional: regional
        });
      }
    } else {
      console.log(`❌ No se encontró regional para ${userData.nombre}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 400)); // Pausa entre creaciones
  }

  console.log(`\n✅ Usuarios creados: ${usuariosCreados.length}/${usuariosData.length}`);

  // ============================================
  // FASE 2: SIMULACIÓN DE JORNADAS
  // ============================================

  console.log('\n\n🕐 INICIANDO SIMULACIÓN DE JORNADAS LABORALES');
  console.log('='.repeat(80));
  console.log(`👥 Empleados: ${usuariosCreados.length}`);
  console.log(`📅 Período: 15 días laborales`);
  console.log(`⏱️  Eventos por empleado: 8 (llegada → descansos → salida)`);
  console.log(`🎯 Total eventos esperados: ${usuariosCreados.length * 15 * 8}`);

  // Obtener fechas laborales (últimas 3 semanas para tener datos recientes)
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - 21);
  const fechasLaborales = obtenerFechasSemanaLaboral(fechaInicio, 15);
  
  console.log(`\n📆 Fechas laborales a simular:`);
  fechasLaborales.slice(0, 5).forEach((fecha, i) => {
    console.log(`   ${i + 1}. ${fecha.toLocaleDateString('es-CO', { 
      weekday: 'long', month: 'long', day: 'numeric' 
    })}`);
  });
  if (fechasLaborales.length > 5) {
    console.log(`   ... y ${fechasLaborales.length - 5} días más`);
  }

  let totalEventosExitosos = 0;
  let totalEmpleadosExitosos = 0;
  let totalJornadasProcesadas = 0;

  // Simular cada día
  for (let diaIndex = 0; diaIndex < fechasLaborales.length; diaIndex++) {
    const fecha = fechasLaborales[diaIndex];
    
    console.log(`\n📅 DÍA ${diaIndex + 1}: ${fecha.toLocaleDateString('es-CO', { 
      weekday: 'long', month: 'long', day: 'numeric' 
    })}`);
    console.log('─'.repeat(60));

    let eventosDia = 0;
    let empleadosExitososDia = 0;

    // Simular todos los empleados para este día
    for (let empleado of usuariosCreados) {
      try {
        const resultado = await simularJornadaCompleta(empleado, fecha, empleado.regional);
        totalJornadasProcesadas++;
        
        if (resultado.success) {
          if (!resultado.ausente) {
            eventosDia += resultado.eventosRegistrados || 8;
            totalEventosExitosos += resultado.eventosRegistrados || 8;
          }
          empleadosExitososDia++;
          totalEmpleadosExitosos++;
        }
      } catch (error) {
        console.log(`   ❌ Error simulando ${empleado.nombre}: ${error.message}`);
      }
      
      // Pausa entre empleados para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`   📊 Día ${diaIndex + 1}: ${empleadosExitososDia} empleados activos, ${eventosDia} eventos registrados`);
    
    // Pausa más larga entre días
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // ============================================
  // RESUMEN FINAL
  // ============================================

  console.log('\n🎉 SIMULACIÓN COMPLETADA');
  console.log('='.repeat(80));
  console.log('📊 RESULTADOS DEL SETUP:');
  console.log(`   ✅ Regionales creadas: ${regionalesCreadas.length}`);
  console.log(`   ✅ Usuarios creados: ${usuariosCreados.length}`);
  console.log('\n📊 RESULTADOS DE LA SIMULACIÓN:');
  console.log(`   ✅ Días simulados: ${fechasLaborales.length}`);
  console.log(`   ✅ Jornadas procesadas: ${totalJornadasProcesadas}`);
  console.log(`   ✅ Empleados exitosos: ${totalEmpleadosExitosos}`);
  console.log(`   ✅ Total eventos registrados: ${totalEventosExitosos}`);
  console.log(`   📊 Promedio eventos por jornada: ${(totalEventosExitosos / Math.max(1, totalJornadasProcesadas)).toFixed(1)}`);
  console.log('\n💾 Verifica la base de datos para confirmar los registros insertados');
  console.log('🔍 Puedes usar el dashboard para visualizar las jornadas simuladas');
  console.log('🌐 Dashboard: http://localhost:3000');
  
  console.log('\n📍 REGIONALES CREADAS:');
  regionalesCreadas.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.nombre} - ${r.direccion}`);
  });

  console.log('\n👥 USUARIOS POR REGIONAL:');
  regionalesCreadas.forEach(regional => {
    const empleadosRegional = usuariosCreados.filter(u => u.regional.id === regional.id);
    console.log(`   📍 ${regional.nombre}: ${empleadosRegional.length} empleados`);
    empleadosRegional.forEach(emp => {
      console.log(`      - ${emp.nombre} ${emp.apellido} (${emp.documento}) - ${emp.cargo}`);
    });
  });
}

// ================================================
// EJECUCIÓN
// ================================================

console.log('⚠️  ADVERTENCIA: Este test creará datos reales en la base de datos');
console.log('📋 Asegúrate de que el servidor esté ejecutándose en http://localhost:3001');
console.log('⏳ Iniciando en 5 segundos...\n');

setTimeout(() => {
  ejecutarSetupCompleto().catch(error => {
    console.error('💥 Error fatal en la simulación:', error);
  });
}, 5000);