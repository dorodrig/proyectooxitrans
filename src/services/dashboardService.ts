import { apiClient } from './apiClient';

export const dashboardService = {
  getUsuariosStats: async () => {
    // Ejemplo: total de usuarios y activos
    return apiClient.get('/usuarios/stats');
  },
  getUsuariosPorRol: async () => {
    // Ejemplo: agrupación por rol
    return apiClient.get('/usuarios/por-rol');
  },
  getUsuariosPorDepartamento: async () => {
    // Agrupación por departamento/regional
    return apiClient.get('/usuarios/por-departamento');
  },
  getUsuariosPorCargo: async () => {
    // Agrupación por cargo
    return apiClient.get('/usuarios/por-cargo');
  },
  getNovedadesStats: async () => {
    // Estadísticas de novedades
    return apiClient.get('/usuarios/novedades-stats');
  },
};
