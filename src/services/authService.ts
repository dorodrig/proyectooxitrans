import { apiClient } from './apiClient';
import type { Usuario } from '../types';

interface LoginCredentials {
  documento: string;
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

interface RegistroEmpleadoData {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  tipo_documento: 'CC' | 'CE' | 'PA';
  telefono?: string;
  departamento: string;
  cargo: string;
  password: string;
  fecha_ingreso?: string;
}

interface RegistroResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    email: string;
    estado: string;
  };
}

export const authService = {
  // Iniciar sesión
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    if (import.meta.env.DEV) {
      console.log('[authService] Respuesta cruda login:', response);
    }
    // Adaptar a la estructura real del backend
    const token = response?.data?.token;
    const usuario = response?.data?.user;
    if (!token || typeof token !== 'string') {
      throw new Error('El backend no devolvió un token válido. Respuesta: ' + JSON.stringify(response));
    }
    localStorage.removeItem('auth_token');
    localStorage.setItem('auth_token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    return {
      token,
      usuario,
      message: response.message || 'Login exitoso',
    };
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

  // Registro de empleados (público)
  registroEmpleado: async (userData: RegistroEmpleadoData): Promise<RegistroResponse> => {
    return apiClient.post('/auth/registro', userData);
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

  // Solicitar restablecimiento de contraseña
  requestPasswordReset: async (documento: string): Promise<{
    documentExists: boolean;
    resetToken?: string;
    usuario?: {
      nombre: string;
      apellido: string;
      documento: string;
    };
  }> => {
    return apiClient.post('/auth/forgot-password', { documento });
  },

  // Verificar token de restablecimiento
  verifyResetToken: async (token: string): Promise<void> => {
    return apiClient.get(`/auth/verify-reset-token/${token}`);
  },

  // Restablecer contraseña
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    return apiClient.post('/auth/reset-password', {
      token,
      password: newPassword,
      confirmPassword: newPassword,
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

// Exportar funciones específicas para compatibilidad
export const login = authService.login;
export const registroEmpleado = authService.registroEmpleado;
export const getCurrentUser = authService.getCurrentUser;
export const verifyToken = authService.verifyToken;
export const changePassword = authService.changePassword;
export const requestPasswordReset = authService.requestPasswordReset;
export const verifyResetToken = authService.verifyResetToken;
export const resetPassword = authService.resetPassword;
export const getUserFromStorage = authService.getUserFromStorage;
export const hasToken = authService.hasToken;
