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
};
