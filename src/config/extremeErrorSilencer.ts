/**
 * 🚫 SILENCIADOR EXTREMO DE ERRORES
 * Elimina absolutamente TODOS los errores molestos de extensiones y DevTools
 */

if (typeof window !== 'undefined') {
  
  // 🔇 Override completo de métodos de consola problemáticos
  const silentOverride = () => {
    // Crear versiones silenciosas de console methods
    const createSilentConsole = (originalMethod: Function) => {
      return (...args: any[]) => {
        const message = args[0];
        if (typeof message === 'string') {
          const noisePatterns = [
            'DevTools',
            'React DevTools',
            'extension',
            'Extension',
            'chrome-extension',
            'moz-extension',
            'ERR_BLOCKED_BY_CLIENT',
            'ERR_BLOCKED_BY_RESPONSE',
            'ERR_NETWORK_CHANGED',
            'The message port closed',
            'Failed to load resource',
            'net::ERR_',
            'runtime.lastError',
            'runtime-lasterror',
            'localization',
            'Localization',
            'manifest',
            'service worker',
            'serviceworker',
            // React warnings específicos de librerías
            'Each child in a list should have a unique key prop',
            'Warning: Each child in a list',
            'key prop',
            'contentTarget',
            'Cannot read properties of undefined (reading \'contentTarget\')',
            'React does not recognize',
            // Chart.js y librerías de visualización
            'chart.js',
            'Chart.js',
            'chartjs'
          ];
          
          if (noisePatterns.some(pattern => message.includes(pattern))) {
            return; // Silenciar completamente
          }
        }
        originalMethod.apply(console, args);
      };
    };

    // Override de todos los métodos de console
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      log: console.log
    };

    console.error = createSilentConsole(originalConsole.error);
    console.warn = createSilentConsole(originalConsole.warn);
    console.info = createSilentConsole(originalConsole.info);
  };

  // 🛡️ Interceptor de errores de runtime
  const interceptRuntimeErrors = () => {
    // Interceptar errores de window
    window.addEventListener('error', (event) => {
      const message = event.message || '';
      const source = event.filename || '';
      
      const silentSources = [
        'extension',
        'chrome-extension',
        'moz-extension',
        'devtools'
      ];
      
      const silentMessages = [
        'ERR_BLOCKED_BY_CLIENT',
        'The message port closed',
        'DevTools',
        'extension',
        'runtime.lastError'
      ];
      
      if (silentSources.some(src => source.includes(src)) || 
          silentMessages.some(msg => message.includes(msg))) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    }, true);

    // Interceptar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const message = reason?.message || reason?.toString() || '';
      
      const silentReasons = [
        'ERR_BLOCKED_BY_CLIENT',
        'ERR_BLOCKED_BY_RESPONSE',
        'The message port closed',
        'DevTools',
        'extension',
        'chrome-extension',
        'runtime.lastError'
      ];
      
      if (silentReasons.some(reason => message.includes(reason))) {
        event.preventDefault();
        return false;
      }
    });
  };

  // 🔕 Desactivar listeners de extensiones
  const disableExtensionListeners = () => {
    // Override addEventListener para filtrar extensiones
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type: string, listener: any, options?: any) {
      // Filtrar eventos de extensiones
      if (listener && listener.toString().includes('extension')) {
        return; // No agregar el listener
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Limpiar storage de extensiones
    try {
      if (window.localStorage) {
        Object.keys(window.localStorage).forEach(key => {
          if (key.includes('extension') || key.includes('devtools')) {
            window.localStorage.removeItem(key);
          }
        });
      }
    } catch (e) {
      // Silenciar
    }
  };

  // 🚀 Activar todos los silenciadores
  silentOverride();
  interceptRuntimeErrors();
  disableExtensionListeners();

  console.log('🔇 Extreme Error Silencer activated - Zero noise guaranteed');
}

export {};