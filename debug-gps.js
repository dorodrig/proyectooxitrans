// 🛠️ Script de Debug para GPS - Jornada Laboral
// Ejecutar en la consola del navegador para diagnosticar problemas

console.log('🔧 INICIANDO DEBUG GPS');
console.log('====================');

// 1. Verificar estado actual
console.log('📊 ESTADO ACTUAL:');
console.log('- Usuario autenticado:', window.localStorage.getItem('auth-storage') ? 'SÍ' : 'NO');
console.log('- Geolocalización disponible:', navigator.geolocation ? 'SÍ' : 'NO');
console.log('- Hora actual:', new Date().toLocaleString('es-CO', {timeZone: 'America/Bogota'}));

// 2. Test de función de timestamp Colombia
const testTimestamp = () => {
  const ahora = new Date();
  const colombiaTime = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
  
  console.log('');
  console.log('🕐 TEST TIMESTAMP:');
  console.log('- Hora local:', ahora.toLocaleTimeString('es-CO', {timeZone: 'America/Bogota', hour12: false}));
  console.log('- Timestamp Colombia:', colombiaTime.toISOString());
  console.log('- Formateo:', new Date(colombiaTime.toISOString()).toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));
};

testTimestamp();

// 3. Monitorear llamadas GPS
let gpsCallCount = 0;
const originalConsoleLog = console.log;

console.log = function(...args) {
  if (args[0] && args[0].includes('GPS')) {
    gpsCallCount++;
    originalConsoleLog(`🔢 [GPS CALL #${gpsCallCount}]`, ...args);
  } else {
    originalConsoleLog(...args);
  }
};

// 4. Test de geolocalización rápido
const testGPS = () => {
  console.log('');
  console.log('🛰️ TEST GPS RÁPIDO:');
  
  if (!navigator.geolocation) {
    console.log('❌ Geolocalización no disponible');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('✅ GPS funcionando');
      console.log('- Precisión:', Math.round(position.coords.accuracy) + 'm');
      console.log('- Coordenadas:', position.coords.latitude.toFixed(6), position.coords.longitude.toFixed(6));
    },
    (error) => {
      console.log('❌ Error GPS:', error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

// 5. Verificar elementos del DOM
const checkDOM = () => {
  console.log('');
  console.log('🎯 ELEMENTOS DOM:');
  const gpsButton = document.querySelector('[class*="btn-accion"]:has([class*="MapPin"])');
  const validarButton = document.querySelector('[class*="btn-accion"][class*="secundario"]');
  
  console.log('- Botón GPS encontrado:', gpsButton ? 'SÍ' : 'NO');
  console.log('- Botón validar encontrado:', validarButton ? 'SÍ' : 'NO');
  
  if (gpsButton) {
    console.log('- Botón GPS deshabilitado:', gpsButton.disabled);
    console.log('- Texto botón GPS:', gpsButton.textContent?.trim());
  }
};

// 6. Función para limpiar estado (en caso de emergency)
window.resetGPS = () => {
  console.log('🔄 RESETEANDO GPS...');
  gpsCallCount = 0;
  location.reload();
};

// Ejecutar tests
setTimeout(() => {
  testGPS();
  checkDOM();
}, 1000);

console.log('');
console.log('💡 COMANDOS DISPONIBLES:');
console.log('- testTimestamp() - Probar timestamps');
console.log('- testGPS() - Probar GPS rápido');
console.log('- checkDOM() - Verificar elementos');
console.log('- resetGPS() - Reiniciar página (emergency)');
console.log('');
console.log('⏱️ Monitoreando llamadas GPS automáticamente...');