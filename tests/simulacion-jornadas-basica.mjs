// ================================================
// TEST: SIMULACIÓN DE JORNADAS LABORALES V2  
// Usa las contraseñas temporales generadas y maneja rate limiting
// ================================================

const BASE_URL = 'http://localhost:3001/api';

// Usuarios con sus contraseñas temporales generadas
const empleados = [
  { documento: '12345001', nombre: 'Carlos Andrés', apellido: 'Rodríguez García', regional_id: 72, regional_nombre: 'Duitama', password: 'gsv2hfke' },
  { documento: '12345002', nombre: 'María Fernanda', apellido: 'López Martínez', regional_id: 66, regional_nombre: 'Bucaramanga', password: 'nz6lgcm9' },
  { documento: '12345003', nombre: 'Juan Pablo', apellido: 'Martínez Silva', regional_id: 67, regional_nombre: 'Barranquilla', password: 'uyxtg64n' },
  { documento: '12345004', nombre: 'Ana Sofía', apellido: 'García Herrera', regional_id: 68, regional_nombre: 'Drummond', password: '9utz3xzj' },
  { documento: '12345005', nombre: 'Diego Alejandro', apellido: 'Ruiz Castro', regional_id: 66, regional_nombre: 'Bucaramanga', password: 'da34hh1p' },
  { documento: '12345006', nombre: 'Claudia Patricia', apellido: 'Herrera Morales', regional_id: 77, regional_nombre: 'Cartagena', password: '82id8qmd' },
  { documento: '12345007', nombre: 'Roberto Carlos', apellido: 'Sánchez Jiménez', regional_id: 71, regional_nombre: 'Neiva', password: 'msi8fe4f' },
  { documento: '12345008', nombre: 'Luisa Fernanda', apellido: 'Castro Vargas', regional_id: 72, regional_nombre: 'Duitama', password: 'c4g3q517' },
  { documento: '12345009', nombre: 'Andrés Felipe', apellido: 'Moreno Quintero', regional_id: 66, regional_nombre: 'Bucaramanga', password: 'q74da7ky' },
  { documento: '12345010', nombre: 'Sandra Milena', apellido: 'Jiménez Torres', regional_id: 71, regional_nombre: 'Neiva', password: 'mbmemd5c' }
];

// Coordenadas GPS reales por regional (Colombia)
const coordenadasRegionales = {
  62: { lat: 4.7110, lng: -74.0721, nombre: 'Bogotá' },          
  66: { lat: 7.1193, lng: -73.1227, nombre: 'Bucaramanga' },    
  67: { lat: 10.9639, lng: -74.7964, nombre: 'Barranquilla' },  
  68: { lat: 9.2442, lng: -73.2528, nombre: 'Drummond' },       
  71: { lat: 2.9273, lng: -75.2819, nombre: 'Neiva' },          
  72: { lat: 5.8245, lng: -73.0198, nombre: 'Duitama' },        
  77: { lat: 10.3932, lng: -75.4832, nombre: 'Cartagena' }      
};

// Horarios base de trabajo (más realistas)
const horariosBase = {
  entrada: { hora: 7, minuto: 0 },          
  descanso_manana_inicio: { hora: 9, minuto: 30 },   
  descanso_manana_fin: { hora: 9, minuto: 45 },      
  almuerzo_inicio: { hora: 12, minuto: 0 },           
  almuerzo_fin: { hora: 13, minuto: 0 },              
  descanso_tarde_inicio: { hora: 15, minuto: 30 },    
  descanso_tarde_fin: { hora: 15, minuto: 45 },       
  salida: { hora: 17, minuto: 0 }                     
};

// ================================================
// FUNCIONES DE UTILIDAD  
// ================================================

function generarVariacionTiempo(baseHora, baseMinuto, variacionMinutos = 10) {
  const variacion = Math.floor(Math.random() * (variacionMinutos * 2 + 1)) - variacionMinutos;
  let totalMinutos = baseHora * 60 + baseMinuto + variacion;
  
  if (totalMinutos < 0) totalMinutos = 0;
  if (totalMinutos >= 24 * 60) totalMinutos = 24 * 60 - 1;
  
  const hora = Math.floor(totalMinutos / 60);
  const minuto = totalMinutos % 60;
  
  return { hora, minuto };
}

function crearTimestamp(fecha, hora, minuto) {
  const timestamp = new Date(fecha);
  timestamp.setHours(hora, minuto, 0, 0);
  return timestamp.toISOString();
}

function generarUbicacion(regionalId, variacionMetros = 50) {
  const coordBase = coordenadasRegionales[regionalId];
  if (!coordBase) return { latitude: 4.7110, longitude: -74.0721 }; 
  
  const variacionLat = (Math.random() - 0.5) * (variacionMetros / 111000); 
  const variacionLng = (Math.random() - 0.5) * (variacionMetros / 111000);
  
  return {
    latitude: coordBase.lat + variacionLat,
    longitude: coordBase.lng + variacionLng
  };
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
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function registrarEvento(token, tipoEvento, timestamp, ubicacion) {
  try {
    const response = await fetch(`${BASE_URL}/jornadas/registrar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tipo: tipoEvento,
        timestamp: timestamp,
        ubicacion: {
          ...ubicacion,
          accuracy: Math.random() * 10 + 5 // Entre 5 y 15 metros
        }
      })
    });

    return response.ok;
    
  } catch (error) {
    return false;
  }
}

// ================================================
// FUNCIÓN DE SIMULACIÓN SIMPLIFICADA
// ================================================

async function simularJornadaBasica(empleado, fecha, diaNumero) {
  console.log(`📅 DÍA ${diaNumero} | 👤 ${empleado.nombre} (${empleado.regional_nombre})`);
  
  const token = await loginUsuario(empleado.documento, empleado.password);
  if (!token) {
    console.log(`   ❌ Login fallido`);
    return { exito: false, eventos: 0 };
  }

  const ubicacion = generarUbicacion(empleado.regional_id);
  let eventosExitosos = 0;

  // Solo eventos principales para evitar rate limiting
  const eventosBasicos = [
    { tipo: 'entrada', base: horariosBase.entrada, variacion: 15 },
    { tipo: 'almuerzo_inicio', base: horariosBase.almuerzo_inicio, variacion: 10 },
    { tipo: 'almuerzo_fin', base: horariosBase.almuerzo_fin, variacion: 8 },
    { tipo: 'salida', base: horariosBase.salida, variacion: 20 }
  ];

  for (const evento of eventosBasicos) {
    const tiempoVariado = generarVariacionTiempo(evento.base.hora, evento.base.minuto, evento.variacion);
    const timestamp = crearTimestamp(fecha, tiempoVariado.hora, tiempoVariado.minuto);
    
    const exito = await registrarEvento(token, evento.tipo, timestamp, ubicacion);
    
    if (exito) {
      eventosExitosos++;
    }
    
    // Pausa más larga para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  const horarios = eventosBasicos.map((e, i) => {
    const tiempo = generarVariacionTiempo(e.base.hora, e.base.minuto, e.variacion);
    return `${tiempo.hora.toString().padStart(2, '0')}:${tiempo.minuto.toString().padStart(2, '0')}`;
  });

  console.log(`   ✅ ${eventosExitosos}/4 eventos | ${horarios[0]} → ${horarios[3]}`);
  
  return { exito: eventosExitosos >= 3, eventos: eventosExitosos };
}

async function ejecutarSimulacionBasica() {
  console.log('🏢 SIMULACIÓN BÁSICA DE JORNADAS LABORALES');
  console.log('='.repeat(70));
  console.log(`👥 Empleados: ${empleados.length}`);
  console.log(`📅 Días de simulación: 5 (prueba)`);
  console.log(`⚡ Eventos por jornada: 4 (entrada, almuerzo_inicio, almuerzo_fin, salida)`);
  console.log('='.repeat(70));

  // Solo 5 días para evitar rate limiting excesivo
  const fechas = [];
  const hoy = new Date();
  for (let i = 4; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    // Solo días laborables
    if (fecha.getDay() >= 1 && fecha.getDay() <= 5) {
      fechas.push(fecha.toISOString().split('T')[0]);
    }
  }

  // Limitar a 5 fechas
  fechas.splice(5);

  console.log(`📅 Período: ${fechas[0]} a ${fechas[fechas.length - 1]}`);
  console.log('⏳ Iniciando simulación con pausas anti rate-limiting...\n');

  await new Promise(resolve => setTimeout(resolve, 2000));

  let jornadasExitosas = 0;
  let totalEventos = 0;

  for (let diaIndex = 0; diaIndex < fechas.length; diaIndex++) {
    const fecha = fechas[diaIndex];
    const diaNumero = diaIndex + 1;
    
    console.log(`\n🗓️  DÍA ${diaNumero}/${fechas.length} - ${fecha}`);
    console.log('─'.repeat(50));

    for (let empIndex = 0; empIndex < empleados.length; empIndex++) {
      const empleado = empleados[empIndex];
      
      try {
        const resultado = await simularJornadaCompleta(empleado, fecha, diaNumero);
        
        if (resultado.exito) {
          jornadasExitosas++;
        }
        
        totalEventos += resultado.eventos;
        
      } catch (error) {
        console.log(`   ❌ Error con ${empleado.nombre}: ${error.message}`);
      }
      
      // Pausa larga entre empleados
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Pausa larga entre días
    if (diaIndex < fechas.length - 1) {
      console.log('\n⏳ Pausa entre días para evitar rate limiting...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n🎉 SIMULACIÓN COMPLETADA');
  console.log('='.repeat(70));
  console.log(`✅ Jornadas exitosas: ${jornadasExitosas}`);
  console.log(`⚡ Total eventos: ${totalEventos}`);
  console.log(`📊 Total jornadas: ${fechas.length * empleados.length}`);
  console.log(`📈 Tasa de éxito: ${((jornadasExitosas / (fechas.length * empleados.length)) * 100).toFixed(1)}%`);

  console.log('\n💾 Verifica la base de datos para confirmar los registros');
  console.log('📊 Usa el dashboard para analizar las jornadas simuladas');
}

// Usar función básica en lugar de completa para evitar problemas
async function simularJornadaCompleta(empleado, fecha, diaNumero) {
  return await simularJornadaBasica(empleado, fecha, diaNumero);
}

console.log('⚠️  SIMULACIÓN DE PRUEBA CON CONTRASEÑAS TEMPORALES');
console.log('📋 5 días, 4 eventos por jornada, pausas anti rate-limiting');
console.log('🔑 Usando contraseñas temporales generadas previamente');
console.log('⏳ Iniciando en 3 segundos...\n');

setTimeout(() => {
  ejecutarSimulacionBasica().catch(error => {
    console.error('💥 Error fatal:', error);
  });
}, 3000);