// Test de Zone Horaria - Colombia
// Ejecutar en la consola del navegador para verificar timestamps

console.log('🕐 TEST DE ZONA HORARIA - COLOMBIA');
console.log('=====================================');

// Hora actual del sistema
const ahoraLocal = new Date();
console.log('📅 Hora local del navegador:', ahoraLocal.toString());
console.log('🌍 UTC del navegador:', ahoraLocal.toISOString());

// Función original (problemática)
const timestampOriginal = new Date().toISOString();
console.log('❌ Timestamp original (UTC):', timestampOriginal);

// Función nueva (corregida) - Simular la función del código
const obtenerTimestampColombia = () => {
  const ahora = new Date();
  const colombiaTime = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
  return colombiaTime.toISOString();
};

const timestampColombia = obtenerTimestampColombia();
console.log('✅ Timestamp Colombia (UTC-5):', timestampColombia);

// Función de formateo nueva
const formatearHora = (fecha) => {
  if (!fecha) return '--:--';
  
  try {
    const fechaObj = new Date(fecha);
    
    if (isNaN(fechaObj.getTime())) {
      return '--:--';
    }
    
    const horaFormateada = fechaObj.toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    return horaFormateada;
  } catch (error) {
    return '--:--';
  }
};

console.log('');
console.log('🎯 COMPARACIÓN DE RESULTADOS:');
console.log('============================');
console.log('🕐 Hora que debería mostrar (actual):', ahoraLocal.toLocaleTimeString('es-CO', {
  timeZone: 'America/Bogota',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}));

console.log('❌ Con timestamp original:', formatearHora(timestampOriginal));
console.log('✅ Con timestamp Colombia:', formatearHora(timestampColombia));

console.log('');
console.log('📊 DIFERENCIA:');
const diferenciaMs = new Date(timestampOriginal).getTime() - new Date(timestampColombia).getTime();
const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
console.log(`⏱️ Diferencia: ${diferenciaHoras} horas`);

console.log('');
console.log('🎯 CONCLUSIÓN:');
if (Math.abs(diferenciaHoras - 5) < 0.1) {
  console.log('✅ La corrección está funcionando correctamente (diferencia de ~5 horas)');
} else {
  console.log('❌ Hay un problema con la corrección');
}

// Test adicional: ¿Cómo se ve en la base de datos?
console.log('');
console.log('💾 LO QUE SE GUARDARÁ EN LA BASE DE DATOS:');
console.log('========================================');
console.log('Timestamp enviado:', timestampColombia);
console.log('Representación en BD:', new Date(timestampColombia).toISOString());
console.log('Lo que mostrará el frontend:', formatearHora(timestampColombia));