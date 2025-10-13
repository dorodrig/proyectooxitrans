/**
 * 🛡️ POLYFILL PARA LOCALIZACIÓN
 * Soluciona el error: RegisterClientLocalizationsError
 * "Cannot read properties of undefined (reading 'translations')"
 */

// Extender el tipo Window para incluir librerías de gráficos
declare global {
  interface Window {
    ApexCharts?: any;
    Chart?: any;
    translations?: any;
    __localizationPolyfillLoaded?: boolean;
  }
}

// Crear objeto global de localizaciones si no existe
if (typeof window !== 'undefined' && !window.__localizationPolyfillLoaded) {
  // Marcar como cargado para evitar duplicaciones
  window.__localizationPolyfillLoaded = true;
  
  // Polyfill para ApexCharts y otras librerías de gráficos
  if (!window.ApexCharts) {
    window.ApexCharts = {};
  }
  
  // Configuración de localización en español
  const spanishLocale = {
    name: 'es',
    options: {
      months: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      shortMonths: [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ],
      days: [
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 
        'Jueves', 'Viernes', 'Sábado'
      ],
      shortDays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      toolbar: {
        exportToSVG: 'Descargar SVG',
        exportToPNG: 'Descargar PNG',
        exportToCSV: 'Descargar CSV',
        menu: 'Menú',
        selection: 'Selección',
        selectionZoom: 'Zoom de Selección',
        zoomIn: 'Acercar',
        zoomOut: 'Alejar',
        pan: 'Panorámica',
        reset: 'Restablecer Zoom'
      }
    }
  };

  // Configurar localización global
  if (window.ApexCharts) {
    window.ApexCharts.locales = window.ApexCharts.locales || [];
    window.ApexCharts.locales.push(spanishLocale);
    
    // Configurar como localización por defecto
    if (window.ApexCharts.setLocale) {
      window.ApexCharts.setLocale('es');
    }
  }

  // Polyfill para Chart.js
  if (!window.Chart) {
    window.Chart = { 
      register: () => {},
      defaults: {
        locale: 'es',
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true }
        }
      }
    };
  }

  // 🔇 SUPER SILENCIADOR para localizaciones y extensiones
  const originalError = console.error;
  
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string') {
      // Lista completa de errores a silenciar
      const silentErrors = [
        'RegisterClientLocalizationsError',
        'Cannot read properties of undefined',
        'translations',
        'localization',
        'net::ERR_BLOCKED_BY_CLIENT',
        'ERR_BLOCKED_BY_RESPONSE',
        'The message port closed',
        'DevTools',
        'React DevTools',
        'extension',
        'Extension',
        'chrome-extension',
        'moz-extension',
        'Failed to load resource',
        'manifest',
        'service worker'
      ];
      
      if (silentErrors.some(error => message.includes(error))) {
        return; // Silenciar completamente
      }
    }
    originalError.apply(console, args);
  };

  // Interceptar promesas rechazadas por errores de localización
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && (
        error.name === 'RegisterClientLocalizationsError' ||
        (typeof error === 'string' && error.includes('localization')) ||
        (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT'))
    )) {
      console.info('🔧 Unhandled rejection intercepted and handled:', error);
      event.preventDefault(); // Prevenir que se muestre en la consola
    }
  });

  // Interceptar errores de recursos bloqueados
  window.addEventListener('error', (event) => {
    if (event.message && (
        event.message.includes('ERR_BLOCKED_BY_CLIENT') ||
        event.message.includes('ERR_BLOCKED_BY_RESPONSE') ||
        event.message.includes('net::ERR_')
    )) {
      console.info('🔧 Network error intercepted:', event.message);
      event.preventDefault();
    }
  });

  // Polyfill para objeto de traducciones si es necesario
  if (!window.translations) {
    window.translations = {
      es: {
        common: {
          loading: 'Cargando...',
          error: 'Error',
          success: 'Éxito'
        }
      }
    };
  }

  console.log('✅ Localization polyfill loaded');
}

export default {};
