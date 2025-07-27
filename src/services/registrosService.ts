import { apiClient } from './apiClient';
import type { RegistroAcceso, Usuario } from '../types';

interface CreateRegistroData {
  usuarioId: string;
  tipo: 'entrada' | 'salida';
  ubicacion?: {
    latitud: number;
    longitud: number;
  };
  dispositivo?: string;
  notas?: string;
}

interface RegistrosResponse {
  registros: (RegistroAcceso & { usuario: Usuario })[];
  total: number;
  page: number;
  limit: number;
}

interface EstadisticasAcceso {
  totalEmpleados: number;
  empleadosActivos: number;
  registrosHoy: number;
  tardanzasHoy: number;
  promedioHorasSemanales: number;
  empleadosPresentes: number;
}

export const registrosService = {
  // Obtener todos los registros con paginación
  getAll: async (page = 1, limit = 10, filters?: {
    fecha?: string;
    usuarioId?: string;
    tipo?: 'entrada' | 'salida';
    departamento?: string;
  }): Promise<RegistrosResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    return apiClient.get(`/registros?${params}`);
  },

  // Crear nuevo registro de acceso
  create: async (registroData: CreateRegistroData): Promise<RegistroAcceso> => {
    return apiClient.post('/registros', registroData);
  },

  // Registrar entrada rápida
  registrarEntrada: async (usuarioId: string, ubicacion?: { latitud: number; longitud: number }): Promise<RegistroAcceso> => {
    return apiClient.post('/registros/entrada', {
      usuarioId,
      ubicacion,
      dispositivo: navigator.userAgent,
    });
  },

  // Registrar salida rápida
  registrarSalida: async (usuarioId: string, ubicacion?: { latitud: number; longitud: number }): Promise<RegistroAcceso> => {
    return apiClient.post('/registros/salida', {
      usuarioId,
      ubicacion,
      dispositivo: navigator.userAgent,
    });
  },

  // Obtener registros por usuario
  getByUsuario: async (usuarioId: string, startDate?: string, endDate?: string): Promise<RegistroAcceso[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get(`/registros/usuario/${usuarioId}?${params}`);
  },

  // Obtener registros del día actual
  getToday: async (): Promise<(RegistroAcceso & { usuario: Usuario })[]> => {
    return apiClient.get('/registros/today');
  },

  // Obtener registros por fecha
  getByDate: async (date: string): Promise<(RegistroAcceso & { usuario: Usuario })[]> => {
    return apiClient.get(`/registros/date/${date}`);
  },

  // Obtener último registro de un usuario
  getLastByUsuario: async (usuarioId: string): Promise<RegistroAcceso | null> => {
    return apiClient.get(`/registros/usuario/${usuarioId}/last`);
  },

  // Obtener estadísticas de acceso
  getEstadisticas: async (startDate?: string, endDate?: string): Promise<EstadisticasAcceso> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get(`/registros/estadisticas?${params}`);
  },

  // Obtener empleados presentes actualmente
  getEmpleadosPresentes: async (): Promise<Usuario[]> => {
    return apiClient.get('/registros/presentes');
  },

  // Obtener reporte de asistencia
  getReporteAsistencia: async (startDate: string, endDate: string, departamento?: string): Promise<unknown[]> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    
    if (departamento) {
      params.append('departamento', departamento);
    }
    
    return apiClient.get(`/registros/reporte?${params}`);
  },

  // Validar registro (para correcciones administrativas)
  validarRegistro: async (id: string, observaciones?: string): Promise<RegistroAcceso> => {
    return apiClient.put(`/registros/${id}/validar`, { observaciones });
  },

  // Eliminar registro (solo admin)
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/registros/${id}`);
  },
};
