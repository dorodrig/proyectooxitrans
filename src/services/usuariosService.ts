// Asignar regional y tipo de usuario a un usuario final
async function asignarRegionalYTipo(id: string, regionalId: string, tipoUsuario: 'planta' | 'visita') {
  return apiClient.put(`/usuarios/${id}/regional`, { regionalId, tipoUsuario });
}
import type { Rol } from '../types';
import { apiClient } from './apiClient';
import type { Usuario } from '../types';

async function asignarRol(id: string, nuevoRol: Rol) {
  return apiClient.put(`/usuarios/${id}/rol`, { rol: nuevoRol });
}
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


// Estructura real de la respuesta del backend
interface UsuariosResponseBackend {
  success: boolean;
  data: {
    usuarios: Usuario[];
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
}

export const usuariosService = {
  asignarRol,
  asignarRegionalYTipo,
  // Obtener todos los usuarios con paginación
  getAll: async (page = 1, limit = 10, search?: string): Promise<UsuariosResponseBackend> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search && search.trim() !== '') {
      params.append('search', search);
    }
    return apiClient.get(`/usuarios?${params.toString()}`);
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

  // Buscar usuarios por nombre o documento
  buscar: async (search: string): Promise<Usuario[]> => {
    const params = new URLSearchParams();
    params.append('search', search);
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
