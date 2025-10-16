// ================================================
// TEST DE SIMULACIÓN REALISTA DE EMPLEADOS
// Simula 10 empleados durante 15 días con jornadas completas
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// ================================================
// DATOS DE EMPLEADOS SIMULADOS
// ================================================

const empleadosSimulados = [
  {
    nombre: 'Carlos Andrés Rodríguez',
    email: 'carlos.rodriguez@oxitrans.com',
    cedula: '12345678',
    telefono: '3001234567',
    password: 'empleado123',
    regional_id: 1,
    tipo_usuario: 'empleado',
    perfil: 'conductor_senior',
    ubicacion: {
      lat: 4.60971,
      lng: -74.08175,
      nombre: 'Sede Principal Bogotá'
    }
  },
  {
    nombre: 'María Fernanda López',
    email: 'maria.lopez@oxitrans.com',
    cedula: '23456789',
    telefono: '3012345678',
    password: 'empleado123',
    regional_id: 1,
    tipo_usuario: 'empleado',
    perfil: 'operador_logistico',
    ubicacion: {
      lat: 4.61532,
      lng: -74.07821,
      nombre: 'Centro de Distribución Norte'
    }
  },
  {
    nombre: 'Juan Pablo Martínez',
    email: 'juan.martinez@oxitrans.com',
    cedula: '34567890',
    telefono: '3023456789',
    password: 'empleado123',
    regional_id: 2,
    tipo_usuario: 'empleado',
    perfil: 'conductor_junior',
    ubicacion: {
      lat: 6.25184,
      lng: -75.56359,
      nombre: 'Terminal Medellín'
    }
  },
  {
    nombre: 'Ana Sofía García',
    email: 'ana.garcia@oxitrans.com',
    cedula: '45678901',
    telefono: '3034567890',
    password: 'empleado123',
    regional_id: 1,
    tipo_usuario: 'empleado',
    perfil: 'supervisor_turno',
    ubicacion: {
      lat: 4.59825,
      lng: -74.08901,
      nombre: 'Oficinas Administrativas'
    }
  },
  {
    nombre: 'Diego Alejandro Ruiz',
    email: 'diego.ruiz@oxitrans.com',
    cedula: '56789012',
    telefono: '3045678901',
    password: 'empleado123',
    regional_id: 3,
    tipo_usuario: 'empleado',
    perfil: 'conductor_senior',
    ubicacion: {
      lat: 10.39972,
      lng: -75.51444,
      nombre: 'Puerto Cartagena'
    }
  },
  {
    nombre: 'Claudia Patricia Herrera',
    email: 'claudia.herrera@oxitrans.com',
    cedula: '67890123',
    telefono: '3056789012',
    password: 'empleado123',
    regional_id: 1,
    tipo_usuario: 'empleado',
    perfil: 'operador_logistico',
    ubicacion: {
      lat: 4.62156,
      lng: -74.07345,
      nombre: 'Bodega Sur'
    }
  },
  {
    nombre: 'Roberto Carlos Sánchez',
    email: 'roberto.sanchez@oxitrans.com',
    cedula: '78901234',
    telefono: '3067890123',
    password: 'empleado123',
    regional_id: 4,
    tipo_usuario: 'empleado',
    perfil: 'conductor_senior',
    ubicacion: {
      lat: 3.43722,
      lng: -76.5225,
      nombre: 'Terminal Cali'
    }
  },
  {
    nombre: 'Luisa Fernanda Castro',
    email: 'luisa.castro@oxitrans.com',
    cedula: '89012345',
    telefono: '3078901234',
    password: 'empleado123',
    regional_id: 2,
    tipo_usuario: 'empleado',
    perfil: 'supervisor_turno',
    ubicacion: {
      lat: 6.24478,
      lng: -75.57050,
      nombre: 'Centro Medellín'
    }
  },
  {
    nombre: 'Andrés Felipe Moreno',
    email: 'andres.moreno@oxitrans.com',
    cedula: '90123456',
    telefono: '3089012345',
    password: 'empleado123',
    regional_id: 5,
    tipo_usuario: 'empleado',
    perfil: 'conductor_junior',
    ubicacion: {
      lat: 7.12539,
      lng: -73.1198,
      nombre: 'Terminal Bucaramanga'
    }
  },
  {
    nombre: 'Sandra Milena Jiménez',
    email: 'sandra.jimenez@oxitrans.com',
    cedula: '01234567',
    telefono: '3090123456',
    password: 'empleado123',
    regional_id: 1,
    tipo_usuario: 'empleado',
    perfil: 'operador_logistico',
    ubicacion: {
      lat: 4.58943,
      lng: -74.09234,
      nombre: 'Centro Logístico Principal'
    }
  }
];

// ================================================
// CONFIGURACIÓN DE JORNADAS SIMULADAS
// ================================================

const configuracionJornadas = {
  horaEntrada: { min: 6, max: 8 }, // Entre 6:00 AM y 8:00 AM
  duracionDescansoManana: { min: 10, max: 20 }, // 10-20 minutos
  horaAlmuerzo: { min: 12, max: 13 }, // Entre 12:00 PM y 1:00 PM
  duracionAlmuerzo: { min: 45, max: 60 }, // 45-60 minutos
  duracionDescansoTarde: { min: 10, max: 20 }, // 10-20 minutos
  horaSalida: { min: 17, max: 18 }, // Entre 5:00 PM y 6:00 PM
  probabilidadLlegadaTarde: 0.15, // 15% de probabilidad de llegar tarde
  probabilidadAusencia: 0.05, // 5% de probabilidad de ausencia
  variacionMinutos: 15 // Variación máxima en minutos para horarios
};

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

function generarFechaAleatoria(fecha, hora, minutos = 0, variacion = 0) {
  const fechaBase = new Date(fecha);
  fechaBase.setHours(hora, minutos + Math.random() * variacion - variacion/2);
  return fechaBase;
}

function generarUbicacionConVariacion(ubicacionBase, variacionMetros = 30) {
  // Generar variación pequeña en GPS (simular error de GPS realista)
  const variacionLat = (Math.random() - 0.5) * (variacionMetros / 111000); // ~111km por grado
  const variacionLng = (Math.random() - 0.5) * (variacionMetros / 111000);
  
  return {
    latitud: ubicacionBase.lat + variacionLat,
    longitud: ubicacionBase.lng + variacionLng
  };
}

function obtenerFechasSemanaLaboral(fechaInicio, dias = 15) {
  const fechas = [];
  const fecha = new Date(fechaInicio);
  
  for (let i = 0; i < dias; i++) {
    // Solo días laborales (lunes a viernes)
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      fechas.push(new Date(fecha));
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  
  return fechas.slice(0, 15); // Máximo 15 días laborales
}

async function login(credentials) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error de login: ${data.error || 'Desconocido'}`);
    }

    return data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

async function registrarEvento(token, tipoEvento, ubicacion, empleado) {
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
      console.log(`   ✅ ${empleado.nombre}: ${tipoEvento} registrado`);
      return data;
    } else {
      console.log(`   ❌ ${empleado.nombre}: Error en ${tipoEvento} - ${data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ ${empleado.nombre}: Error de conexión en ${tipoEvento}`);
    return null;
  }
}

// ================================================
// SIMULACIÓN PRINCIPAL
// ================================================

async function simularJornadaCompleta(empleado, fecha) {
  console.log(`\n👤 Simulando jornada de ${empleado.nombre} - ${fecha.toLocaleDateString()}`);
  
  // Login del empleado
  const token = await login({
    email: empleado.email,
    password: empleado.password
  });

  if (!token) {
    console.log(`   ⚠️  No se pudo autenticar ${empleado.nombre}`);
    return;
  }

  const ubicacion = generarUbicacionConVariacion(empleado.ubicacion);
  
  // Verificar si el empleado va a trabajar hoy (95% de probabilidad)
  if (Math.random() < configuracionJornadas.probabilidadAusencia) {
    console.log(`   🏠 ${empleado.nombre}: Ausente hoy`);
    return;
  }

  // 1. LLEGADA (con posible retraso)
  const llegadaTarde = Math.random() < configuracionJornadas.probabilidadLlegadaTarde;
  const horaLlegada = llegadaTarde 
    ? configuracionJornadas.horaEntrada.max + Math.random() * 2 // Hasta 2 horas tarde
    : configuracionJornadas.horaEntrada.min + Math.random() * 2; // Hora normal

  const fechaLlegada = generarFechaAleatoria(fecha, Math.floor(horaLlegada), (horaLlegada % 1) * 60);
  
  // Simular delay para hacer más realista
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await registrarEvento(token, 'llegada', ubicacion, empleado);

  // 2. DESCANSO MAÑANA (2-3 horas después de llegar)
  const tiempoHastaDescansoManana = 2 + Math.random(); // 2-3 horas
  const fechaDescansoManana = new Date(fechaLlegada);
  fechaDescansoManana.setHours(fechaDescansoManana.getHours() + tiempoHastaDescansoManana);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  await registrarEvento(token, 'descanso_manana', 
    generarUbicacionConVariacion(empleado.ubicacion), empleado);

  // 3. FIN DESCANSO MAÑANA
  const duracionDescansoManana = configuracionJornadas.duracionDescansoManana.min + 
    Math.random() * (configuracionJornadas.duracionDescansoManana.max - configuracionJornadas.duracionDescansoManana.min);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  await registrarEvento(token, 'fin_descanso_manana', 
    generarUbicacionConVariacion(empleado.ubicacion), empleado);

  // 4. ALMUERZO
  const horaAlmuerzo = configuracionJornadas.horaAlmuerzo.min + 
    Math.random() * (configuracionJornadas.horaAlmuerzo.max - configuracionJornadas.horaAlmuerzo.min);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  await registrarEvento(token, 'almuerzo', 
    generarUbicacionConVariacion(empleado.ubicacion), empleado);

  // 5. FIN ALMUERZO
  const duracionAlmuerzo = configuracionJornadas.duracionAlmuerzo.min + 
    Math.random() * (configuracionJornadas.duracionAlmuerzo.max - configuracionJornadas.duracionAlmuerzo.min);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  await registrarEvento(token, 'fin_almuerzo', 
    generarUbicacionConVariacion(empleado.ubicacion), empleado);

  // 6. DESCANSO TARDE
  const tiempoHastaDescansoTarde = 2 + Math.random(); // 2-3 horas después del almuerzo
  
  await new Promise(resolve => setTimeout(resolve, 100));
  await registrarEvento(token, 'descanso_tarde', 
    generarUbicacionConVariacion(empleado.ubicacion), empleado);

  // 7. FIN DESCANSO TARDE
  const duracionDescansoTarde = configuracionJornadas.duracionDescansoTarde.min + 
    Math.random() * (configuracionJornadas.duracionDescansoTarde.max - configuracionJornadas.duracionDescansoTarde.min);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  await registrarEvento(token, 'fin_descanso_tarde', 
    generarUbicacionConVariacion(empleado.ubicacion), empleado);

  // 8. SALIDA
  const horaSalida = configuracionJornadas.horaSalida.min + 
    Math.random() * (configuracionJornadas.horaSalida.max - configuracionJornadas.horaSalida.min);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  await registrarEvento(token, 'salida', 
    generarUbicacionConVariacion(empleado.ubicacion), empleado);

  console.log(`   ✨ Jornada completa simulada para ${empleado.nombre}`);
}

async function ejecutarSimulacionCompleta() {
  console.log('🚀 INICIANDO SIMULACIÓN REALISTA DE EMPLEADOS');
  console.log('='.repeat(70));
  console.log(`📊 Empleados: ${empleadosSimulados.length}`);
  console.log(`📅 Período: 15 días laborales`);
  console.log(`⏱️  Eventos por empleado: 8 (llegada → descansos → salida)`);
  console.log('='.repeat(70));

  // Obtener fechas laborales
  const fechaInicio = new Date('2024-10-07'); // Fecha de inicio
  const fechasLaborales = obtenerFechasSemanaLaboral(fechaInicio, 21); // 21 días calendario para obtener 15 laborales
  
  console.log(`📆 Fechas laborales simuladas: ${fechasLaborales.length}`);
  fechasLaborales.forEach((fecha, i) => {
    console.log(`   ${i + 1}. ${fecha.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`);
  });

  let totalRegistros = 0;
  let empleadosExitosos = 0;

  // Simular cada día
  for (let diaIndex = 0; diaIndex < fechasLaborales.length; diaIndex++) {
    const fecha = fechasLaborales[diaIndex];
    
    console.log(`\n📅 DÍA ${diaIndex + 1}: ${fecha.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`);
    console.log('─'.repeat(50));

    // Simular todos los empleados para este día
    for (let empleado of empleadosSimulados) {
      try {
        await simularJornadaCompleta(empleado, fecha);
        totalRegistros += 8; // 8 eventos por jornada completa
        empleadosExitosos++;
      } catch (error) {
        console.log(`   ❌ Error simulando ${empleado.nombre}: ${error.message}`);
      }
      
      // Pausa pequeña entre empleados para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n   📈 Día ${diaIndex + 1} completado`);
    
    // Pausa más larga entre días
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Resumen final
  console.log('\n🎉 SIMULACIÓN COMPLETADA');
  console.log('='.repeat(70));
  console.log(`✅ Total empleados: ${empleadosSimulados.length}`);
  console.log(`✅ Total días simulados: ${fechasLaborales.length}`);
  console.log(`✅ Total registros esperados: ${empleadosSimulados.length * fechasLaborales.length * 8}`);
  console.log(`✅ Empleados procesados exitosamente: ${empleadosExitosos}`);
  console.log(`✅ Total registros procesados: ${totalRegistros}`);
  console.log('\n💾 Verifica la base de datos para confirmar los registros insertados');
  console.log('🔍 Puedes usar el dashboard para visualizar las jornadas simuladas');
}

// ================================================
// EJECUCIÓN
// ================================================

console.log('⚠️  ADVERTENCIA: Este test insertará datos reales en la base de datos');
console.log('📋 Asegúrate de que el servidor esté ejecutándose en http://localhost:3001');
console.log('🔄 Iniciando en 3 segundos...\n');

setTimeout(() => {
  ejecutarSimulacionCompleta().catch(error => {
    console.error('💥 Error fatal en la simulación:', error);
  });
}, 3000);