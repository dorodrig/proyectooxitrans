
import { Capacitor } from '@capacitor/core';

function getApiBaseUrl() {
  // Si está en móvil y en desarrollo, usar IP local
  if (Capacitor.isNativePlatform() && import.meta.env.MODE === 'development') {
    return 'http://192.168.1.21:3001/api'; // IP local del PC
  }
  // En web, usar localhost
  if (!Capacitor.isNativePlatform() && import.meta.env.MODE === 'development') {
    return 'http://localhost:3001/api';
  }
  // En producción, usar variable de entorno
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
}

const API_BASE_URL = getApiBaseUrl();

// Configuración base para fetch
const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Función helper para manejar errores de la API
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error del servidor' }));
    throw new Error(error.message || `Error ${response.status}`);
  }
  return response.json();
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiError(response);
  },

  // POST request
  post: async (endpoint: string, data: unknown) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiError(response);
  },

  // PUT request
  put: async (endpoint: string, data: unknown) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiError(response);
  },

  // DELETE request
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleApiError(response);
  },
};
