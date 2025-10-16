// ================================================
// TEST: SIMULACIÓN COMPLETA DE JORNADAS LABORALES
// Simula 15 días de trabajo para 10 empleados con comportamiento realista
// Incluye: entrada, descansos, almuerzo, salida con variaciones naturales
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// Usuarios con sus regionales asignadas (basado en resultados anteriores)
const empleados = [
  { documento: '12345001', nombre: 'Carlos Andrés', apellido: 'Rodríguez García', regional_id: 72, regional_nombre: 'Duitama' },
  { documento: '12345002', nombre: 'María Fernanda', apellido: 'López Martínez', regional_id: 66, regional_nombre: 'Bucaramanga' },
  { documento: '12345003', nombre: 'Juan Pablo', apellido: 'Martínez Silva', regional_id: 67, regional_nombre: 'Barranquilla' },
  { documento: '12345004', nombre: 'Ana Sofía', apellido: 'García Herrera', regional_id: 68, regional_nombre: 'Drummond' },
  { documento: '12345005', nombre: 'Diego Alejandro', apellido: 'Ruiz Castro', regional_id: 66, regional_nombre: 'Bucaramanga' },
  { documento: '12345006', nombre: 'Claudia Patricia', apellido: 'Herrera Morales', regional_id: 77, regional_nombre: 'Cartagena' },
  { documento: '12345007', nombre: 'Roberto Carlos', apellido: 'Sánchez Jiménez', regional_id: 71, regional_nombre: 'Neiva' },
  { documento: '12345008', nombre: 'Luisa Fernanda', apellido: 'Castro Vargas', regional_id: 72, regional_nombre: 'Duitama' },
  { documento: '12345009', nombre: 'Andrés Felipe', apellido: 'Moreno Quintero', regional_id: 66, regional_nombre: 'Bucaramanga' },
  { documento: '12345010', nombre: 'Sandra Milena', apellido: 'Jiménez Torres', regional_id: 71, regional_nombre: 'Neiva' }
];

// Coordenadas GPS reales por regional (Colombia)
const coordenadasRegionales = {
  62: { lat: 4.7110, lng: -74.0721, nombre: 'Bogotá' },          // Bogotá
  66: { lat: 7.1193, lng: -73.1227, nombre: 'Bucaramanga' },    // Bucaramanga  
  67: { lat: 10.9639, lng: -74.7964, nombre: 'Barranquilla' },  // Barranquilla
  68: { lat: 9.2442, lng: -73.2528, nombre: 'Drummond' },       // Drummond (La Jagua)
  71: { lat: 2.9273, lng: -75.2819, nombre: 'Neiva' },          // Neiva
  72: { lat: 5.8245, lng: -73.0198, nombre: 'Duitama' },        // Duitama
  77: { lat: 10.3932, lng: -75.4832, nombre: 'Cartagena' }      // Cartagena
};

// Horarios base de trabajo (hora Colombia UTC-5)
const horariosBase = {
  entrada: { hora: 7, minuto: 0 },          // 7:00 AM
  descanso_manana_inicio: { hora: 9, minuto: 30 },   // 9:30 AM
  descanso_manana_fin: { hora: 9, minuto: 45 },      // 9:45 AM
  almuerzo_inicio: { hora: 12, minuto: 0 },           // 12:00 PM
  almuerzo_fin: { hora: 13, minuto: 0 },              // 1:00 PM  
  descanso_tarde_inicio: { hora: 15, minuto: 30 },    // 3:30 PM
  descanso_tarde_fin: { hora: 15, minuto: 45 },       // 3:45 PM
  salida: { hora: 17, minuto: 0 }                     // 5:00 PM
};

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

function generarVariacionTiempo(baseHora, baseMinuto, variacionMinutos = 15) {
  // Agregar variación aleatoria para simular comportamiento humano real
  const variacion = Math.floor(Math.random() * (variacionMinutos * 2 + 1)) - variacionMinutos;
  
  let totalMinutos = baseHora * 60 + baseMinuto + variacion;
  
  // Ajustar si se sale del rango del día
  if (totalMinutos < 0) totalMinutos = 0;
  if (totalMinutos >= 24 * 60) totalMinutos = 24 * 60 - 1;
  
  const hora = Math.floor(totalMinutos / 60);
  const minuto = totalMinutos % 60;
  
  return { hora, minuto };
}

function crearTimestamp(fecha, hora, minuto) {
  // Crear timestamp en zona horaria de Colombia (UTC-5)
  const timestamp = new Date(fecha);
  timestamp.setHours(hora, minuto, 0, 0);
  return timestamp.toISOString();
}

function generarUbicacion(regionalId, variacionMetros = 100) {
  const coordBase = coordenadasRegionales[regionalId];
  if (!coordBase) return { latitude: 4.7110, longitude: -74.0721 }; // Default Bogotá
  
  // Agregar pequeña variación para simular movimiento dentro de la sede
  const variacionLat = (Math.random() - 0.5) * (variacionMetros / 111000); // 1 grado ≈ 111km
  const variacionLng = (Math.random() - 0.5) * (variacionMetros / 111000);
  
  return {
    latitude: coordBase.lat + variacionLat,
    longitude: coordBase.lng + variacionLng
  };
}

async function loginUsuario(documento, password = 'defaultPass123') {
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
      console.log(`❌ Login fallido para ${documento}: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error login ${documento}: ${error.message}`);
    return null;
  }
}

async function registrarEvento(token, tipoEvento, timestamp, ubicacion) {
  try {
    const response = await fetch(`${BASE_URL}/registros/tiempo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tipo: tipoEvento,
        timestamp: timestamp,
        ubicacion: ubicacion
      })
    });

    const data = await response.json();
    return response.ok;
    
  } catch (error) {
    return false;
  }
}

// ================================================
// FUNCIÓN PRINCIPAL DE SIMULACIÓN
// ================================================

async function simularJornadaCompleta(empleado, fecha, diaNumero) {
  console.log(`📅 DÍA ${diaNumero} - ${fecha} | 👤 ${empleado.nombre} ${empleado.apellido} (${empleado.regional_nombre})`);
  
  // Login del empleado (simulamos que todos usan password default)
  const token = await loginUsuario(empleado.documento);
  if (!token) {
    console.log(`   ❌ No se pudo hacer login, saltando día`);
    return { exito: false, eventos: 0 };
  }

  const ubicacion = generarUbicacion(empleado.regional_id);
  let eventosExitosos = 0;
  const tiemposRegistrados = [];

  // Secuencia completa de eventos del día
  const eventosDelDia = [
    { tipo: 'entrada', base: horariosBase.entrada, variacion: 20 },
    { tipo: 'descanso_manana_inicio', base: horariosBase.descanso_manana_inicio, variacion: 10 },
    { tipo: 'descanso_manana_fin', base: horariosBase.descanso_manana_fin, variacion: 5 },
    { tipo: 'almuerzo_inicio', base: horariosBase.almuerzo_inicio, variacion: 15 },
    { tipo: 'almuerzo_fin', base: horariosBase.almuerzo_fin, variacion: 10 },
    { tipo: 'descanso_tarde_inicio', base: horariosBase.descanso_tarde_inicio, variacion: 10 },
    { tipo: 'descanso_tarde_fin', base: horariosBase.descanso_tarde_fin, variacion: 5 },
    { tipo: 'salida', base: horariosBase.salida, variacion: 25 }
  ];

  // Ejecutar cada evento
  for (const evento of eventosDelDia) {
    const tiempoVariado = generarVariacionTiempo(evento.base.hora, evento.base.minuto, evento.variacion);
    const timestamp = crearTimestamp(fecha, tiempoVariado.hora, tiempoVariado.minuto);
    
    const exito = await registrarEvento(token, evento.tipo, timestamp, ubicacion);
    
    if (exito) {
      eventosExitosos++;
      tiemposRegistrados.push(`${evento.tipo}: ${tiempoVariado.hora.toString().padStart(2, '0')}:${tiempoVariado.minuto.toString().padStart(2, '0')}`);
    }
    
    // Pausa pequeña entre eventos para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`   ✅ ${eventosExitosos}/8 eventos registrados | ${tiemposRegistrados.slice(0, 3).join(' | ')}...`);
  
  return { exito: eventosExitosos >= 6, eventos: eventosExitosos }; // Consideramos exitoso si al menos 6/8 eventos se registraron
}

async function ejecutarSimulacionCompleta() {
  console.log('🏢 SIMULACIÓN DE JORNADAS LABORALES - 15 DÍAS');
  console.log('='.repeat(80));
  console.log(`👥 Empleados: ${empleados.length}`);
  console.log(`📅 Días de simulación: 15`);
  console.log(`📊 Total jornadas a simular: ${empleados.length * 15}`);
  console.log(`⚡ Eventos por jornada: 8 (entrada → descansos → almuerzo → salida)`);
  console.log('='.repeat(80));

  // Generar fechas para los últimos 15 días (excluyendo fines de semana)
  const fechas = [];
  const hoy = new Date();
  let fechaActual = new Date(hoy);
  fechaActual.setDate(hoy.getDate() - 20); // Empezar hace 20 días para tener margen

  while (fechas.length < 15) {
    const diaSemana = fechaActual.getDay();
    // Solo días laborables (lunes=1 a viernes=5)
    if (diaSemana >= 1 && diaSemana <= 5) {
      fechas.push(new Date(fechaActual).toISOString().split('T')[0]);
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  console.log(`📅 Período de simulación: ${fechas[0]} a ${fechas[fechas.length - 1]}`);
  console.log('⏳ Iniciando simulación en 3 segundos...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Estadísticas
  let jornadasExitosas = 0;
  let jornadasFallidas = 0;
  let totalEventos = 0;
  const estadisticasPorEmpleado = {};

  // Procesar cada día
  for (let diaIndex = 0; diaIndex < fechas.length; diaIndex++) {
    const fecha = fechas[diaIndex];
    const diaNumero = diaIndex + 1;
    
    console.log(`\n🗓️  DÍA ${diaNumero}/15 - ${fecha}`);
    console.log('─'.repeat(60));

    // Simular jornada para cada empleado
    for (const empleado of empleados) {
      try {
        const resultado = await simularJornadaCompleta(empleado, fecha, diaNumero);
        
        if (resultado.exito) {
          jornadasExitosas++;
        } else {
          jornadasFallidas++;
        }
        
        totalEventos += resultado.eventos;
        
        // Estadísticas por empleado
        if (!estadisticasPorEmpleado[empleado.documento]) {
          estadisticasPorEmpleado[empleado.documento] = {
            nombre: `${empleado.nombre} ${empleado.apellido}`,
            regional: empleado.regional_nombre,
            jornadas: 0,
            eventos: 0
          };
        }
        estadisticasPorEmpleado[empleado.documento].jornadas++;
        estadisticasPorEmpleado[empleado.documento].eventos += resultado.eventos;
        
      } catch (error) {
        console.log(`   ❌ Error simulando ${empleado.nombre}: ${error.message}`);
        jornadasFallidas++;
      }
      
      // Pausa entre empleados
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Pausa entre días
    if (diaIndex < fechas.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // ============================================
  // RESUMEN FINAL
  // ============================================

  console.log('\n🎉 SIMULACIÓN DE JORNADAS COMPLETADA');
  console.log('='.repeat(80));
  console.log(`✅ Jornadas exitosas: ${jornadasExitosas}`);
  console.log(`❌ Jornadas fallidas: ${jornadasFallidas}`);
  console.log(`📊 Total jornadas procesadas: ${jornadasExitosas + jornadasFallidas}`);
  console.log(`⚡ Total eventos registrados: ${totalEventos}`);
  console.log(`📈 Tasa de éxito jornadas: ${((jornadasExitosas / (jornadasExitosas + jornadasFallidas)) * 100).toFixed(1)}%`);

  console.log('\n👥 ESTADÍSTICAS POR EMPLEADO:');
  console.log('─'.repeat(80));
  Object.values(estadisticasPorEmpleado).forEach(empleado => {
    const promedioEventos = (empleado.eventos / empleado.jornadas).toFixed(1);
    console.log(`📊 ${empleado.nombre} (${empleado.regional})`);
    console.log(`   • Jornadas: ${empleado.jornadas} | Eventos: ${empleado.eventos} | Promedio: ${promedioEventos}/8`);
  });

  console.log('\n📈 RESUMEN POR REGIONAL:');
  console.log('─'.repeat(80));
  const estadisticasPorRegional = {};
  Object.values(estadisticasPorEmpleado).forEach(empleado => {
    if (!estadisticasPorRegional[empleado.regional]) {
      estadisticasPorRegional[empleado.regional] = { empleados: 0, jornadas: 0, eventos: 0 };
    }
    estadisticasPorRegional[empleado.regional].empleados++;
    estadisticasPorRegional[empleado.regional].jornadas += empleado.jornadas;
    estadisticasPorRegional[empleado.regional].eventos += empleado.eventos;
  });

  Object.entries(estadisticasPorRegional).forEach(([regional, stats]) => {
    const promedioEventos = (stats.eventos / stats.jornadas).toFixed(1);
    console.log(`🏢 ${regional}: ${stats.empleados} empleados | ${stats.jornadas} jornadas | ${promedioEventos}/8 eventos promedio`);
  });

  console.log('\n🎯 SIMULACIÓN COMPLETADA EXITOSAMENTE');
  console.log('💾 Verifica la base de datos para ver todos los registros generados');
  console.log('📊 Puedes usar el dashboard para analizar los datos de jornadas');
}

// ================================================
// EJECUCIÓN
// ================================================

console.log('⚠️  ADVERTENCIA: Esta simulación creará registros reales de jornadas en la base de datos');
console.log('📋 Asegúrate de que el servidor esté ejecutándose en http://localhost:3001');
console.log('👤 Los usuarios deben existir y tener regionales asignadas');
console.log('📅 Se simularán 15 días laborables (lunes a viernes) con horarios realistas');
console.log('⏳ La simulación puede tomar varios minutos...\n');

setTimeout(() => {
  ejecutarSimulacionCompleta().catch(error => {
    console.error('💥 Error fatal en la simulación:', error);
  });
}, 2000);