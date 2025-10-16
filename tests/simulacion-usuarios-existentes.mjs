// ================================================
// TEST DE SIMULACIÓN CON USUARIOS EXISTENTES
// Simula empleados existentes durante 15 días con jornadas completas
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// ================================================
// USUARIOS EXISTENTES EN LA BASE DE DATOS
// (según schema.sql - login con DOCUMENTO y PASSWORD)
// ================================================

const usuariosExistentes = [
  {
    documento: '12345678',
    password: 'admin123',
    nombre: 'Administrador Sistema',
    email: 'admin@oxitrans.com',
    rol: 'admin',
    ubicacion: {
      lat: 4.60971,
      lng: -74.08175,
      nombre: 'Oficinas Administrativas'
    }
  },
  {
    documento: '87654321',
    password: 'admin123',
    nombre: 'Juan Carlos Pérez',
    email: 'juan.perez@oxitrans.com',
    rol: 'empleado',
    ubicacion: {
      lat: 4.61532,
      lng: -74.07821,
      nombre: 'Centro de Operaciones'
    }
  },
  {
    documento: '11223344',
    password: 'admin123', 
    nombre: 'María Elena González',
    email: 'maria.gonzalez@oxitrans.com',
    rol: 'supervisor',
    ubicacion: {
      lat: 4.59825,
      lng: -74.08901,
      nombre: 'Área de Logística'
    }
  },
  {
    documento: '55667788',
    password: 'admin123',
    nombre: 'Carlos Alberto Silva', 
    email: 'carlos.silva@oxitrans.com',
    rol: 'empleado',
    ubicacion: {
      lat: 4.62156,
      lng: -74.07345,
      nombre: 'Taller de Mantenimiento'
    }
  }
];

// ================================================
// CONFIGURACIÓN DE JORNADAS SIMULADAS
// ================================================

const configuracionJornadas = {
  horaEntrada: { min: 7, max: 8 }, // Entre 7:00 AM y 8:00 AM
  duracionDescansoManana: { min: 10, max: 20 }, // 10-20 minutos
  horaAlmuerzo: { min: 12, max: 13 }, // Entre 12:00 PM y 1:00 PM
  duracionAlmuerzo: { min: 45, max: 60 }, // 45-60 minutos
  duracionDescansoTarde: { min: 10, max: 20 }, // 10-20 minutos
  horaSalida: { min: 17, max: 18 }, // Entre 5:00 PM y 6:00 PM
  probabilidadLlegadaTarde: 0.10, // 10% de probabilidad de llegar tarde
  probabilidadAusencia: 0.03, // 3% de probabilidad de ausencia
  variacionMinutos: 10 // Variación máxima en minutos para horarios
};

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

function generarUbicacionConVariacion(ubicacionBase, variacionMetros = 25) {
  // Generar variación pequeña en GPS (simular error de GPS realista)
  const variacionLat = (Math.random() - 0.5) * (variacionMetros / 111000); // ~111km por grado
  const variacionLng = (Math.random() - 0.5) * (variacionMetros / 111000);
  
  return {
    latitud: ubicacionBase.lat + variacionLat,
    longitud: ubicacionBase.lng + variacionLng
  };
}

function obtenerFechasSemanaLaboral(fechaInicio, diasRequeridos = 10) {
  const fechas = [];
  const fecha = new Date(fechaInicio);
  let diasAgregados = 0;
  
  while (diasAgregados < diasRequeridos) {
    // Solo días laborales (lunes a viernes)
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      fechas.push(new Date(fecha));
      diasAgregados++;
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  
  return fechas;
}

async function login(credentials) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: credentials.documento,
        password: credentials.password
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error de login: ${data.error || data.message || 'Desconocido'}`);
    }

    return data.token;
  } catch (error) {
    console.error(`❌ Error en login para ${credentials.documento}:`, error.message);
    return null;
  }
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

// ================================================
// SIMULACIÓN PRINCIPAL
// ================================================

async function simularJornadaCompleta(empleado, fecha, intentoNumero = 1) {
  console.log(`\n👤 Simulando jornada de ${empleado.nombre} - ${fecha.toLocaleDateString('es-CO')}`);
  
  // Verificar si el empleado va a trabajar hoy (97% de probabilidad)
  if (Math.random() < configuracionJornadas.probabilidadAusencia) {
    console.log(`   🏠 ${empleado.nombre}: Ausente hoy`);
    return { success: true, ausente: true };
  }

  // Login del empleado
  const token = await login({
    documento: empleado.documento,
    password: empleado.password
  });

  if (!token) {
    console.log(`   ⚠️  No se pudo autenticar ${empleado.nombre} (intento ${intentoNumero})`);
    
    // Si es el primer intento, esperar y reintentar
    if (intentoNumero === 1) {
      console.log(`   ⏳ Esperando 2 segundos antes de reintentar...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await simularJornadaCompleta(empleado, fecha, 2);
    }
    
    return { success: false, error: 'Autenticación fallida' };
  }

  const ubicacion = generarUbicacionConVariacion(empleado.ubicacion);
  
  try {
    // 1. LLEGADA (con posible retraso)
    const llegadaTarde = Math.random() < configuracionJornadas.probabilidadLlegadaTarde;
    if (llegadaTarde) {
      console.log(`   ⏰ ${empleado.nombre}: Llegada con retraso`);
    }

    await registrarEventoJornada(token, 'llegada', ubicacion, empleado);
    await new Promise(resolve => setTimeout(resolve, 300)); // Pausa realista

    // 2. DESCANSO MAÑANA (después de 2-3 horas)
    await registrarEventoJornada(token, 'descanso_manana', 
      generarUbicacionConVariacion(empleado.ubicacion), empleado);
    await new Promise(resolve => setTimeout(resolve, 200));

    // 3. FIN DESCANSO MAÑANA
    await registrarEventoJornada(token, 'fin_descanso_manana', 
      generarUbicacionConVariacion(empleado.ubicacion), empleado);
    await new Promise(resolve => setTimeout(resolve, 300));

    // 4. ALMUERZO
    await registrarEventoJornada(token, 'almuerzo', 
      generarUbicacionConVariacion(empleado.ubicacion), empleado);
    await new Promise(resolve => setTimeout(resolve, 200));

    // 5. FIN ALMUERZO
    await registrarEventoJornada(token, 'fin_almuerzo', 
      generarUbicacionConVariacion(empleado.ubicacion), empleado);
    await new Promise(resolve => setTimeout(resolve, 300));

    // 6. DESCANSO TARDE
    await registrarEventoJornada(token, 'descanso_tarde', 
      generarUbicacionConVariacion(empleado.ubicacion), empleado);
    await new Promise(resolve => setTimeout(resolve, 200));

    // 7. FIN DESCANSO TARDE
    await registrarEventoJornada(token, 'fin_descanso_tarde', 
      generarUbicacionConVariacion(empleado.ubicacion), empleado);
    await new Promise(resolve => setTimeout(resolve, 300));

    // 8. SALIDA
    await registrarEventoJornada(token, 'salida', 
      generarUbicacionConVariacion(empleado.ubicacion), empleado);

    console.log(`   ✨ Jornada completa simulada para ${empleado.nombre}`);
    return { success: true, eventosRegistrados: 8 };

  } catch (error) {
    console.log(`   💥 Error durante jornada de ${empleado.nombre}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function ejecutarSimulacionRealista() {
  console.log('🚀 INICIANDO SIMULACIÓN REALISTA - USUARIOS EXISTENTES');
  console.log('='.repeat(70));
  console.log(`👥 Empleados: ${usuariosExistentes.length}`);
  console.log(`📅 Período: 10 días laborales`);
  console.log(`⏱️  Eventos por empleado: 8 (llegada → descansos → salida)`);
  console.log(`🎯 Total eventos esperados: ${usuariosExistentes.length * 10 * 8}`);
  console.log('='.repeat(70));

  // Obtener fechas laborales (empezar desde hoy hacia atrás para tener datos recientes)
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - 12); // Empezar hace 12 días
  const fechasLaborales = obtenerFechasSemanaLaboral(fechaInicio, 10);
  
  console.log(`📆 Fechas laborales a simular:`);
  fechasLaborales.forEach((fecha, i) => {
    console.log(`   ${i + 1}. ${fecha.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`);
  });

  let totalEventosExitosos = 0;
  let totalEmpleadosExitosos = 0;
  let totalJornadasProcesadas = 0;

  // Simular cada día
  for (let diaIndex = 0; diaIndex < fechasLaborales.length; diaIndex++) {
    const fecha = fechasLaborales[diaIndex];
    
    console.log(`\n📅 DÍA ${diaIndex + 1}: ${fecha.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`);
    console.log('─'.repeat(50));

    let eventosDia = 0;
    let empleadosExitososDia = 0;

    // Simular todos los empleados para este día
    for (let empleado of usuariosExistentes) {
      // Solo empleados y supervisores (no admin para jornadas laborales)
      if (empleado.rol === 'empleado' || empleado.rol === 'supervisor') {
        try {
          const resultado = await simularJornadaCompleta(empleado, fecha);
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
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`   📊 Día ${diaIndex + 1}: ${empleadosExitososDia} empleados, ${eventosDia} eventos`);
    
    // Pausa más larga entre días
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Resumen final
  console.log('\n🎉 SIMULACIÓN COMPLETADA');
  console.log('='.repeat(70));
  console.log(`✅ Empleados disponibles: ${usuariosExistentes.filter(u => u.rol !== 'admin').length}`);
  console.log(`✅ Días simulados: ${fechasLaborales.length}`);
  console.log(`✅ Jornadas procesadas: ${totalJornadasProcesadas}`);
  console.log(`✅ Empleados exitosos: ${totalEmpleadosExitosos}`);
  console.log(`✅ Total eventos registrados: ${totalEventosExitosos}`);
  console.log(`📊 Promedio eventos por jornada: ${(totalEventosExitosos / Math.max(1, totalJornadasProcesadas)).toFixed(1)}`);
  console.log('\n💾 Verifica la base de datos para confirmar los registros insertados');
  console.log('🔍 Puedes usar el dashboard para visualizar las jornadas simuladas');
  console.log('🌐 Dashboard: http://localhost:3000');
}

// ================================================
// EJECUCIÓN CON DELAY INICIAL
// ================================================

console.log('⚠️  ADVERTENCIA: Este test insertará datos reales en la base de datos');
console.log('📋 Asegúrate de que el servidor esté ejecutándose en http://localhost:3001');
console.log('⏳ Iniciando en 3 segundos para evitar rate limiting...\n');

setTimeout(() => {
  ejecutarSimulacionRealista().catch(error => {
    console.error('💥 Error fatal en la simulación:', error);
  });
}, 3000);