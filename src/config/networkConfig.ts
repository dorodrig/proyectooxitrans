/**
 * 🌐 CONFIGURACIÓN DE RED OPTIMIZADA
 * Mejora la conectividad y manejo de errores de red
 */

// Configuración de timeouts y reintentos
const NETWORK_CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
};

// Función para reintentar requests fallidos
async function retryFetch(url: string, options: RequestInit, retries = NETWORK_CONFIG.retries): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    if (retries > 0 && !error.name?.includes('AbortError')) {
      console.info(`🔄 Retrying request to ${url}, attempts left: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, NETWORK_CONFIG.retryDelay));
      return retryFetch(url, options, retries - 1);
    }
    throw error;
  }
}

// Mejorar el manejo de conexiones
if (typeof window !== 'undefined') {
  // Detectar estado de conexión
  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      console.info('🌐 Network connection restored');
    } else {
      console.warn('🚫 Network connection lost');
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Configurar headers por defecto para evitar CORS
  const setupDefaultHeaders = () => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: localhost:* 127.0.0.1:*; connect-src 'self' https: http: localhost:* 127.0.0.1:* ws: wss:;";
    document.head.appendChild(meta);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDefaultHeaders);
  } else {
    setupDefaultHeaders();
  }

  console.log('✅ Network configuration loaded');
}

export { retryFetch, NETWORK_CONFIG };