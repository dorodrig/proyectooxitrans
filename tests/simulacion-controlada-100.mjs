// ================================================
// TEST: SIMULACIÓN SIMPLE - 1 DÍA x 5 USUARIOS
// Jornada completa del 7 de octubre 2025 (ayer)
// ================================================

const API_BASE = 'http://localhost:3001/api';

// Solo 5 usuarios seleccionados para garantizar éxito (contraseñas actualizadas)
const empleados = [
  { documento: '12345001', nombre: 'Carlos Andrés', apellido: 'Rodríguez García', regional_id: 72, regional_nombre: 'Duitama', password: '8uhoq2dl' },
  { documento: '12345002', nombre: 'María Fernanda', apellido: 'López Martínez', regional_id: 66, regional_nombre: 'Bucaramanga', password: 'iskrxsh7' },
  { documento: '12345003', nombre: 'Juan Pablo', apellido: 'Martínez Silva', regional_id: 67, regional_nombre: 'Barranquilla', password: 'h9x6fv7a' },
  { documento: '12345004', nombre: 'Ana Sofía', apellido: 'García Herrera', regional_id: 68, regional_nombre: 'Drummond', password: '8hpgf64x' },
  { documento: '12345005', nombre: 'Diego Alejandro', apellido: 'Ruiz Castro', regional_id: 66, regional_nombre: 'Bucaramanga', password: 'sjce4eym' }
];

// Coordenadas GPS por regional
const coordenadasRegionales = {
  66: { lat: 7.1193, lng: -73.1227, nombre: 'Bucaramanga' },    
  67: { lat: 10.9639, lng: -74.7964, nombre: 'Barranquilla' },  
  68: { lat: 9.2442, lng: -73.2528, nombre: 'Drummond' },       
  72: { lat: 5.8245, lng: -73.0198, nombre: 'Duitama' }
};

// Horarios base realistas para jornada laboral completa
const horariosBase = {
  entrada: { hora: 7, minuto: 30 },        // 7:30 AM - Entrada normal
  almuerzo_inicio: { hora: 12, minuto: 0 }, // 12:00 PM - Inicio almuerzo  
  almuerzo_fin: { hora: 13, minuto: 0 },   // 1:00 PM - Fin almuerzo (1 hora)
  salida: { hora: 17, minuto: 30 }         // 5:30 PM - Salida (8 horas + 1 almuerzo)
};

// ================================================
// FUNCIONES OPTIMIZADAS Y CORREGIDAS
// ================================================

async function verificarConectividad() {
  try {
    console.log('🔍 Verificando conectividad con el backend...');
    console.log(`🌐 URL del backend: ${API_BASE}`);
    
    const response = await fetch(`${API_BASE}/auth/test`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok || response.status === 404) {
      console.log('✅ Backend conectado correctamente');
      return true;
    } else {
      console.log(`❌ Backend no responde (Status: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error de conectividad: ${error.message}`);
    console.log('💡 Asegúrate de que el servidor esté corriendo en el puerto 3001');
    return false;
  }
}

function generarVariacionTiempo(baseHora, baseMinuto, variacionMinutos = 5) {
  // Variación realista: algunos llegan temprano, otros tarde
  const variacion = Math.floor(Math.random() * (variacionMinutos * 2 + 1)) - variacionMinutos;
  let totalMinutos = baseHora * 60 + baseMinuto + variacion;
  
  // Validar límites razonables
  if (totalMinutos < 6 * 60) totalMinutos = 6 * 60; // No antes de 6:00 AM
  if (totalMinutos >= 22 * 60) totalMinutos = 22 * 60 - 1; // No después de 10:00 PM
  
  const hora = Math.floor(totalMinutos / 60);
  const minuto = totalMinutos % 60;
  
  console.log(`       ⏰ Hora ajustada: ${baseHora}:${baseMinuto.toString().padStart(2, '0')} → ${hora}:${minuto.toString().padStart(2, '0')} (variación: ${variacion > 0 ? '+' : ''}${variacion} min)`);
  
  return { hora, minuto };
}

function crearTimestamp(fechaBase, hora, minuto) {
  // Crear timestamp correcto para Colombia (UTC-5)
  // Formato: YYYY-MM-DD HH:MM:SS en zona horaria local de Colombia
  const fechaCompleta = `${fechaBase} ${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`;
  console.log(`       📅 Timestamp creado: ${fechaCompleta} (Colombia UTC-5)`);
  
  // Crear fecha en UTC ajustando por zona horaria de Colombia (+5 horas para convertir a UTC)
  const fecha = new Date(fechaBase + 'T' + hora.toString().padStart(2, '0') + ':' + minuto.toString().padStart(2, '0') + ':00.000');
  fecha.setHours(fecha.getHours() + 5); // Ajustar para UTC (Colombia es UTC-5)
  
  return fecha.toISOString();
}

function generarUbicacion(regionalId) {
  const coordBase = coordenadasRegionales[regionalId];
  if (!coordBase) return { latitude: 4.7110, longitude: -74.0721, accuracy: 8.5 };
  
  // Variación mínima para simular movimiento dentro de la sede
  const variacionLat = (Math.random() - 0.5) * 0.001;
  const variacionLng = (Math.random() - 0.5) * 0.001;
  
  return {
    latitude: coordBase.lat + variacionLat,
    longitude: coordBase.lng + variacionLng,
    accuracy: Math.random() * 5 + 5 // Entre 5 y 10 metros
  };
}

async function loginUsuario(documento, password) {
  try {
    console.log(`   🔑 Intentando login: ${documento}`);
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Login failed (${response.status}): ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`   ✅ Login response:`, data);
    
    // Según el backend, la estructura es { success: true, data: { token: "...", usuario: {...} } }
    if (data.success && data.data && data.data.token) {
      return data.data.token;
    } else if (data.token) {
      return data.token;
    }
    
    console.log(`   ⚠️ No se encontró token en respuesta:`, data);
    return null;
  } catch (error) {
    console.log(`   💥 Error de conexión:`, error.message);
    return null;
  }
}

async function registrarEventoConReintentos(token, tipoEvento, timestamp, ubicacion, maxReintentos = 3) {
  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      console.log(`     🔄 Intento ${intento}/${maxReintentos} para ${tipoEvento}`);
      
      const response = await fetch(`${API_BASE}/jornadas/registrar`, {
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

      if (response.ok) {
        const result = await response.json();
        console.log(`     ✅ ${tipoEvento} registrado exitosamente`);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`     ❌ Error ${response.status}: ${errorText}`);
        
        // Si es error 400, probablemente es validación de negocio, no reintentamos
        if (response.status === 400) {
          console.log(`     🚫 Error de validación, no se reintenta`);
          return false;
        }
      }
      
      // Si falla, esperamos antes de reintentar
      if (intento < maxReintentos) {
        console.log(`     ⏳ Esperando ${2000 * intento}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * intento));
      }
    } catch (error) {
      console.log(`     💥 Error de red: ${error.message}`);
      if (intento < maxReintentos) {
        console.log(`     ⏳ Esperando ${2000 * intento}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * intento));
      }
    }
  }
  
  console.log(`     ❌ Falló después de ${maxReintentos} intentos`);
  return false;
}

async function simularJornadaCompleta(empleado, fechaBase, diaNumero) {
  // Login con reintentos
  let token = null;
  for (let intento = 1; intento <= 3; intento++) {
    token = await loginUsuario(empleado.documento, empleado.password);
    if (token) break;
    
    console.log(`   🔄 Reintento login ${intento}/3...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  if (!token) {
    console.log(`   ❌ Login falló después de 3 intentos`);
    return { exito: false, eventos: 0 };
  }

  console.log(`   ✅ Login exitoso`);
  
  const ubicacion = generarUbicacion(empleado.regional_id);
  let eventosExitosos = 0;
  const horariosRegistrados = [];

  // Secuencia de jornada laboral REALISTA para el 7 de octubre 2025
  const eventos = [
    { tipo: 'entrada', base: horariosBase.entrada, variacion: 10, descripcion: 'Entrada Laboral' },
    { tipo: 'almuerzo_inicio', base: horariosBase.almuerzo_inicio, variacion: 15, descripcion: 'Inicio Almuerzo' },
    { tipo: 'almuerzo_fin', base: horariosBase.almuerzo_fin, variacion: 10, descripcion: 'Fin Almuerzo' },
    { tipo: 'salida', base: horariosBase.salida, variacion: 20, descripcion: 'Salida Laboral' }
  ];

  // Variables para mantener secuencia lógica de horarios
  let ultimoHorario = { hora: 0, minuto: 0 };
  
  for (let i = 0; i < eventos.length; i++) {
    const evento = eventos[i];
    let tiempoVariado = generarVariacionTiempo(evento.base.hora, evento.base.minuto, evento.variacion);
    
    // VALIDAR SECUENCIA LÓGICA: cada evento debe ser después del anterior
    const tiempoActualMinutos = tiempoVariado.hora * 60 + tiempoVariado.minuto;
    const ultimoTiempoMinutos = ultimoHorario.hora * 60 + ultimoHorario.minuto;
    
    if (i > 0 && tiempoActualMinutos <= ultimoTiempoMinutos) {
      // Si el tiempo es anterior o igual, ajustar para que sea al menos 30 minutos después
      const nuevoTiempoMinutos = ultimoTiempoMinutos + 30;
      tiempoVariado.hora = Math.floor(nuevoTiempoMinutos / 60);
      tiempoVariado.minuto = nuevoTiempoMinutos % 60;
      console.log(`       🔧 Ajuste secuencial: ${evento.descripcion} movido a ${tiempoVariado.hora}:${tiempoVariado.minuto.toString().padStart(2, '0')}`);
    }
    
    const timestamp = crearTimestamp(fechaBase, tiempoVariado.hora, tiempoVariado.minuto);
    
    const horaFormateada = `${tiempoVariado.hora.toString().padStart(2, '0')}:${tiempoVariado.minuto.toString().padStart(2, '0')}`;
    console.log(`   ⏰ Registrando ${evento.descripcion} (${evento.tipo}) a las ${horaFormateada}`);
    console.log(`   📍 GPS: ${ubicacion.latitude.toFixed(6)}, ${ubicacion.longitude.toFixed(6)} (±${ubicacion.accuracy.toFixed(1)}m)`);
    
    const exito = await registrarEventoConReintentos(token, evento.tipo, timestamp, ubicacion);
    
    if (exito) {
      eventosExitosos++;
      horariosRegistrados.push(horaFormateada);
      ultimoHorario = tiempoVariado; // Actualizar último horario exitoso
      console.log(`   ✅ ${evento.descripcion} registrado exitosamente`);
    } else {
      console.log(`   ❌ ${evento.descripcion} falló después de reintentos`);
      // Si falla, no actualizamos ultimoHorario para mantener secuencia
    }
    
    // Pausa entre eventos para evitar rate limiting
    if (i < eventos.length - 1) {
      console.log(`   ⏳ Pausa de 4 segundos para estabilidad...`);
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }

  const exitoTotal = eventosExitosos === 4 ? '✅ JORNADA COMPLETA' : `⚠️ JORNADA INCOMPLETA (${eventosExitosos}/4)`;
  const duracionJornada = horariosRegistrados.length >= 2 ? 
    `${horariosRegistrados[0]} a ${horariosRegistrados[horariosRegistrados.length - 1]}` : 
    horariosRegistrados.join(' → ');
  
  console.log(`   🎯 RESULTADO: ${exitoTotal}`);
  console.log(`   ⏰ Horarios registrados: ${duracionJornada}`);
  console.log(`   📊 Eventos exitosos: ${eventosExitosos}/4 (${((eventosExitosos/4)*100).toFixed(1)}%)`);
  console.log('   ' + '═'.repeat(65));
  
  return { exito: eventosExitosos === 4, eventos: eventosExitosos };
}

async function ejecutarSimulacionSimple() {
  console.log('🎯 SIMULACIÓN SIMPLE - UN DÍA COMPLETO');
  console.log('='.repeat(70));
  console.log(`👥 Empleados seleccionados: ${empleados.length}`);
  console.log(`📅 Fecha objetivo: 7 de octubre 2025 (ayer)`);
  console.log(`⚡ Eventos por jornada: 4 (entrada → almuerzo_inicio → almuerzo_fin → salida)`);
  console.log(`📊 Total eventos objetivo: ${empleados.length * 4} eventos`);
  console.log(`🔄 Sistema de reintentos: 3 intentos por operación`);
  console.log(`⏰ Pausas optimizadas para máxima efectividad`);
  console.log(`🌐 Backend URL: ${API_BASE}`);
  console.log('='.repeat(70));
  
  // Verificar conectividad antes de empezar
  const conectado = await verificarConectividad();
  if (!conectado) {
    console.log('\n❌ SIMULACIÓN CANCELADA: No se puede conectar al backend');
    console.log('💡 Verifica que el servidor esté corriendo: npm run dev');
    return;
  }

  // Fecha fija: 7 de octubre 2025 (ayer)
  const fechaObjetivo = '2025-10-07';

  console.log(`📅 Simulando jornada laboral para: ${fechaObjetivo}`);
  console.log('⏳ Iniciando en 3 segundos...\n');

  // Test rápido de login antes de empezar la simulación masiva
  console.log('🧪 Ejecutando test de conectividad...');
  const testLogin = await loginUsuario(empleados[0].documento, empleados[0].password);
  if (!testLogin) {
    console.log('❌ Test de login falló. Verifica las credenciales y el estado del backend.');
    console.log('💡 Empleado de prueba:', empleados[0].nombre, '- Documento:', empleados[0].documento);
    return;
  } else {
    console.log('✅ Conectividad confirmada. Procediendo con la simulación...\n');
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Estadísticas
  let jornadasCompletas = 0;
  let totalEventos = 0;
  const resultadosPorEmpleado = {};
  
  console.log(`\n📆 JORNADA LABORAL - ${fechaObjetivo} (lunes)`);
  console.log('╔' + '═'.repeat(68) + '╗');

  // Procesar cada empleado secuencialmente
  for (let empIndex = 0; empIndex < empleados.length; empIndex++) {
    const empleado = empleados[empIndex];
    
    try {
      console.log(`\n👤 EMPLEADO ${empIndex + 1}/${empleados.length}: ${empleado.nombre} ${empleado.apellido} (${empleado.regional_nombre})`);
      const resultado = await simularJornadaCompleta(empleado, fechaObjetivo, 1);
      
      if (resultado.exito) {
        jornadasCompletas++;
      }
      
      totalEventos += resultado.eventos;
      
      // Estadísticas por empleado
      resultadosPorEmpleado[empleado.documento] = {
        nombre: `${empleado.nombre} ${empleado.apellido}`,
        regional: empleado.regional_nombre,
        jornadasCompletas: resultado.exito ? 1 : 0,
        totalEventos: resultado.eventos
      };
      
    } catch (error) {
      console.log(`   💥 Error fatal con ${empleado.nombre}: ${error.message}`);
      resultadosPorEmpleado[empleado.documento] = {
        nombre: `${empleado.nombre} ${empleado.apellido}`,
        regional: empleado.regional_nombre,
        jornadasCompletas: 0,
        totalEventos: 0
      };
    }
    
    // Pausa entre empleados para evitar rate limiting
    if (empIndex < empleados.length - 1) {
      console.log(`   ⏳ Pausa de 6 segundos entre empleados...`);
      await new Promise(resolve => setTimeout(resolve, 6000));
    }
  }
  
  console.log('╚' + '═'.repeat(68) + '╝');

  // ============================================
  // RESUMEN FINAL SIMPLE
  // ============================================

  const totalJornadasPosibles = empleados.length;
  const totalEventosPosibles = totalJornadasPosibles * 4;
  const tasaExitoJornadas = ((jornadasCompletas / totalJornadasPosibles) * 100).toFixed(1);
  const tasaExitoEventos = ((totalEventos / totalEventosPosibles) * 100).toFixed(1);

  console.log('\n🎉 SIMULACIÓN CONTROLADA COMPLETADA');
  console.log('='.repeat(70));
  console.log(`✅ Jornadas completas (4/4 eventos): ${jornadasCompletas}/${totalJornadasPosibles}`);
  console.log(`⚡ Total eventos registrados: ${totalEventos}/${totalEventosPosibles}`);
  console.log(`📈 Tasa éxito jornadas: ${tasaExitoJornadas}%`);
  console.log(`📊 Tasa éxito eventos: ${tasaExitoEventos}%`);

  console.log('\n👥 RESULTADOS POR EMPLEADO:');
  console.log('─'.repeat(70));
  Object.values(resultadosPorEmpleado).forEach(empleado => {
    const estadoJornada = empleado.jornadasCompletas === 1 ? '✅ COMPLETA' : '❌ INCOMPLETA';
    console.log(`📊 ${empleado.nombre} (${empleado.regional})`);
    console.log(`   • Estado: ${estadoJornada}`);
    console.log(`   • Eventos registrados: ${empleado.totalEventos}/4`);
    console.log(`   • Porcentaje completitud: ${((empleado.totalEventos / 4) * 100).toFixed(1)}%`);
  });

  console.log('\n🎯 OBJETIVO ALCANZADO:');
  if (tasaExitoEventos >= 95) {
    console.log('🏆 EXCELENTE: Más del 95% de eventos registrados exitosamente');
    console.log('🎉 ¡Simulación completada con máxima calidad!');
  } else if (tasaExitoEventos >= 80) {
    console.log('✅ BUENO: Más del 80% de eventos registrados');
    console.log('👍 Simulación exitosa con calidad aceptable');
  } else {
    console.log('⚠️ MEJORABLE: Menos del 80% de eventos registrados');
    console.log('🔧 Considera revisar conectividad y credenciales');
  }

  console.log('\n💾 VERIFICACIÓN Y PRÓXIMOS PASOS:');
  console.log('📋 1. Revisa la base de datos: SELECT * FROM jornadas_laborales ORDER BY created_at DESC LIMIT 50');
  console.log('📊 2. Abre el dashboard web para ver las métricas actualizadas');
  console.log('📈 3. Verifica las horas trabajadas en el módulo de reportes');
  console.log('� 4. Revisa los logs del servidor para detectar posibles errores');
  console.log(`🌐 5. Dashboard URL: http://localhost:3000 (si está corriendo el frontend)`);
  
  console.log('\n📊 DATOS TÉCNICOS:');
  console.log(`🔗 API utilizada: ${API_BASE}`);
  console.log(`📅 Fecha simulada: ${fechaObjetivo} (7 de octubre 2025)`);
  console.log(`👤 Empleados procesados: ${empleados.map(e => e.documento).join(', ')}`);
  
  console.log('\n✨ SIMULACIÓN SIMPLE FINALIZADA ✨');
}

console.log('🎯 SIMULACIÓN SIMPLE - UN DÍA PERFECTO');
console.log('📋 5 empleados × 1 día × 4 eventos = 20 registros objetivo');
console.log('� Fecha objetivo: 7 de octubre 2025 (ayer)');
console.log('🔄 Sistema optimizado para máxima efectividad');
console.log('⚡ Esta simulación es rápida y confiable');
console.log('⏳ Tiempo estimado: 2-3 minutos\n');

setTimeout(() => {
  ejecutarSimulacionSimple().catch(error => {
    console.error('💥 Error fatal en simulación simple:', error);
  });
}, 2000);