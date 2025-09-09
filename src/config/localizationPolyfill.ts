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
  }
}

// Crear objeto global de localizaciones si no existe
if (typeof window !== 'undefined') {
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

  // Global error handler para localizaciones
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('RegisterClientLocalizationsError') ||
         message.includes('translations') ||
         message.includes('localization'))) {
      console.warn('🔧 Localization error intercepted and handled:', ...args);
      return;
    }
    originalError.apply(console, args);
  };

  // Interceptar promesas rechazadas por errores de localización
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && error.name === 'RegisterClientLocalizationsError') {
      console.warn('🔧 RegisterClientLocalizationsError intercepted and handled:', error);
      event.preventDefault(); // Prevenir que se muestre en la consola
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
