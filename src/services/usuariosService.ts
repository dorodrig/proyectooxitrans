import { apiClient } from './apiClient';
import type { Usuario } from '../types';

interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  tipoDocumento: 'CC' | 'CE' | 'PA';
  telefono?: string;
  departamento: string;
  cargo: string;
  rol: 'admin' | 'empleado' | 'supervisor';
  fechaIngreso: Date;
}

interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

interface UsuariosResponse {
  usuarios: Usuario[];
  total: number;
  page: number;
  limit: number;
}

export const usuariosService = {
  // Obtener todos los usuarios con paginación
  getAll: async (page = 1, limit = 10, search?: string): Promise<UsuariosResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return apiClient.get(`/usuarios?${params}`);
  },

  // Obtener usuario por ID
  getById: async (id: string): Promise<Usuario> => {
    return apiClient.get(`/usuarios/${id}`);
  },

  // Crear nuevo usuario
  create: async (userData: CreateUserData): Promise<Usuario> => {
    return apiClient.post('/usuarios', userData);
  },

  // Actualizar usuario
  update: async (id: string, userData: Partial<UpdateUserData>): Promise<Usuario> => {
    return apiClient.put(`/usuarios/${id}`, userData);
  },

  // Eliminar usuario (cambiar estado a inactivo)
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/usuarios/${id}`);
  },

  // Activar/Desactivar usuario
  toggleStatus: async (id: string, estado: 'activo' | 'inactivo' | 'suspendido'): Promise<Usuario> => {
    return apiClient.put(`/usuarios/${id}/status`, { estado });
  },

  // Buscar usuarios por criterios
  search: async (criteria: {
    nombre?: string;
    departamento?: string;
    cargo?: string;
    rol?: string;
    estado?: string;
  }): Promise<Usuario[]> => {
    const params = new URLSearchParams();
    Object.entries(criteria).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    return apiClient.get(`/usuarios/search?${params}`);
  },

  // Obtener usuarios por departamento
  getByDepartamento: async (departamento: string): Promise<Usuario[]> => {
    return apiClient.get(`/usuarios/departamento/${encodeURIComponent(departamento)}`);
  },

  // Resetear contraseña de usuario
  resetPassword: async (id: string): Promise<{ tempPassword: string }> => {
    return apiClient.post(`/usuarios/${id}/reset-password`, {});
  },

  // Subir foto de perfil
  uploadPhoto: async (id: string, file: File): Promise<{ fotoUrl: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch(`http://localhost:3001/api/usuarios/${id}/photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error del servidor' }));
      throw new Error(error.message || `Error ${response.status}`);
    }
    
    return response.json();
  },
};
