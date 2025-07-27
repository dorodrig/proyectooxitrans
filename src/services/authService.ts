import { apiClient } from './apiClient';
import type { Usuario } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
  message: string;
}

interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  tipoDocumento: 'CC' | 'CE' | 'PA';
  telefono?: string;
  departamento: string;
  cargo: string;
  rol: 'admin' | 'empleado' | 'supervisor';
}

export const authService = {
  // Iniciar sesión
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Guardar token en localStorage
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
    }
    
    return response;
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar localStorage siempre
      localStorage.removeItem('auth_token');
      localStorage.removeItem('usuario');
    }
  },

  // Registrar nuevo usuario (solo admin)
  register: async (userData: RegisterData): Promise<Usuario> => {
    return apiClient.post('/auth/register', userData);
  },

  // Obtener usuario actual
  getCurrentUser: async (): Promise<Usuario> => {
    return apiClient.get('/auth/me');
  },

  // Verificar si el token es válido
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch {
      return false;
    }
  },

  // Cambiar contraseña
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Obtener usuario desde localStorage
  getUserFromStorage: (): Usuario | null => {
    try {
      const userStr = localStorage.getItem('usuario');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Verificar si hay token en localStorage
  hasToken: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};
