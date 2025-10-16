
import { Capacitor } from '@capacitor/core';

// ⚡ CACHE BUSTER - PUERTO CORREGIDO A 3001 ⚡
console.log('🔥 [apiClient] MÓDULO RECARGADO - PUERTO 3001 CONFIRMADO - ' + new Date().toISOString());

function getApiBaseUrl() {
  const BACKEND_PORT = '3001'; // Puerto del backend en la misma máquina
  
  // Debug en desarrollo para verificar configuración
  if (import.meta.env.DEV) {
    console.log('[apiClient] 🔧 Configuración EC2 Single Server:', {
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      BACKEND_PORT: BACKEND_PORT,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      isNative: Capacitor.isNativePlatform()
    });
  }

  // Si está en móvil, usar la IP/dominio del servidor EC2
  if (Capacitor.isNativePlatform()) {
    // En producción móvil, usar el dominio/IP del servidor EC2
    const serverHost = import.meta.env.VITE_SERVER_HOST || 'localhost';
    return `http://${serverHost}:${BACKEND_PORT}/api`;
  }

  // Desarrollo local - usar localhost
  if (import.meta.env.MODE === 'development') {
    console.log(`[apiClient] 🎯 Desarrollo local - puerto ${BACKEND_PORT}`);
    return `http://localhost:${BACKEND_PORT}/api`;
  }
  
  // Producción - usar variable de entorno o mismo servidor
  if (import.meta.env.VITE_API_URL) {
    console.log(`[apiClient] 🚀 Usando VITE_API_URL: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }

  // EC2 Single Server - Backend en la misma máquina
  console.log(`[apiClient] �️  EC2 Single Server - puerto ${BACKEND_PORT}`);
  return `/api`; // Usar ruta relativa - nginx proxy
}

const API_BASE_URL = getApiBaseUrl();

// Debug para verificar configuración - LOGGING INTENSIVO
console.log('🔧 [apiClient] ================================================');
console.log('🔧 [apiClient] API_BASE_URL FINAL CONFIGURADA:', API_BASE_URL);
console.log('🔧 [apiClient] VERIFICACIÓN DE PUERTO:', API_BASE_URL.includes('3001') ? '✅ PUERTO 3001 CORRECTO' : '❌ PUERTO INCORRECTO');
console.log('🔧 [apiClient] TIMESTAMP:', new Date().toISOString());
console.log('🔧 [apiClient] ================================================');

// Validación adicional para el navegador
if (typeof window !== 'undefined') {
  // Mostrar notificación visual en el navegador si es necesario
  if (!API_BASE_URL.includes('3001')) {
    console.error('🚨 [apiClient] CONFIGURACIÓN INCORRECTA - Se requiere Ctrl+F5 para limpiar cache');
    alert('⚠️ CONFIGURACIÓN INCORRECTA\n\nPor favor presione Ctrl+F5 para limpiar el cache del navegador y recargar la página.');
  } else {
    console.log('✅ [apiClient] Configuración correcta - Puerto 3001 detectado');
  }
}

// Configuración base para fetch
const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Función helper para manejar errores de la API
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error('🚨 [apiClient] Error del servidor:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData
      });
      console.error('🚨 [apiClient] MENSAJE ESPECÍFICO DEL SERVER:', errorData.error || errorData.message || 'Sin mensaje específico');
      
      // Crear mensaje de error más descriptivo
      let errorMessage = errorData.message || `Error ${response.status}`;
      if (response.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor intenta nuevamente.';
      } else if (response.status === 400) {
        errorMessage = errorData.message || 'Datos inválidos enviados al servidor.';
      }
      
      const error = new Error(errorMessage);
      (error as any).response = { data: errorData };
      (error as any).status = response.status;
      throw error;
    } catch (parseError) {
      console.error('🚨 [apiClient] Error parseando respuesta de error:', parseError);
      const error = new Error(`Error ${response.status}: ${response.statusText}`);
      (error as any).response = { data: { message: `Error de conexión (${response.status})` } };
      (error as any).status = response.status;
      throw error;
    }
  }
  
  // Verificar que la respuesta tenga contenido JSON válido
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      const jsonData = await response.json();
      // Asegurar que siempre devolvemos un objeto con data
      if (jsonData && typeof jsonData === 'object') {
        return jsonData;
      } else {
        return { success: true, data: jsonData };
      }
    } catch (parseError) {
      console.error('❌ [apiClient] Error parseando JSON:', parseError);
      return { success: false, error: 'Error parseando respuesta del servidor', data: null };
    }
  } else {
    console.warn('⚠️ [apiClient] Respuesta no es JSON:', contentType, 'Status:', response.status);
    // Para respuestas exitosas sin JSON, considerar éxito con data null
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: null };
    }
    return { success: false, error: 'Respuesta del servidor no es JSON válido', data: null };
  }
};

// Función para obtener el token del localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Función para agregar el token a las headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  if (import.meta.env.DEV) {
    // Solo en desarrollo, log para depuración
    console.log('[apiClient] Token enviado:', token);
  }
  return {
    ...fetchConfig.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiClient = {
  // GET request
  get: async (endpoint: string) => {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 [apiClient] 📡 GET REQUEST:', {
      endpoint,
      fullUrl,
      baseUrl: API_BASE_URL,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      console.log('✅ [apiClient] GET Response:', response.status, response.statusText);
      return handleApiError(response);
    } catch (error: any) {
      console.error('❌ [apiClient] GET Error:', {
        endpoint,
        fullUrl,
        error: error.message,
        type: error.name
      });
      throw error;
    }
  },

  // POST request  
  post: async (endpoint: string, data: unknown) => {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 [apiClient] 📡 POST REQUEST:', {
      endpoint,
      fullUrl,
      data,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      console.log('✅ [apiClient] POST Response:', response.status, response.statusText);
      return handleApiError(response);
    } catch (error: any) {
      console.error('❌ [apiClient] POST Error:', {
        endpoint,
        fullUrl,
        error: error.message,
        type: error.name
      });
      throw error;
    }
  },

  // PUT request
  put: async (endpoint: string, data: unknown) => {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 [apiClient] 🔄 PUT REQUEST:', {
      endpoint,
      fullUrl,
      data,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      console.log('✅ [apiClient] PUT Response:', response.status, response.statusText);
      return handleApiError(response);
    } catch (error: any) {
      console.error('❌ [apiClient] PUT Error:', {
        endpoint,
        fullUrl,
        error: error.message,
        type: error.name
      });
      throw error;
    }
  },

  // DELETE request
  delete: async (endpoint: string) => {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 [apiClient] 🗑️ DELETE REQUEST:', {
      endpoint,
      fullUrl,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      console.log('✅ [apiClient] DELETE Response:', response.status, response.statusText);
      return handleApiError(response);
    } catch (error: any) {
      console.error('❌ [apiClient] DELETE Error:', {
        endpoint,
        fullUrl,
        error: error.message,
        type: error.name
      });
      throw error;
    }
  },
};
