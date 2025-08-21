import { apiClient } from './apiClient';

export const cargosService = {
  getAll: async () => {
    const res = await apiClient.get('/cargos');
    // Log temporal para depuración
    console.log('[cargosService.getAll] Respuesta:', res);
    if (!res) return [];
    // Si la respuesta es { success, data: [...] }
    if (Array.isArray(res.data)) return res.data;
    // Si la respuesta es { success, data: { ... } }
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    // Si la respuesta es un array directamente
    if (Array.isArray(res)) return res;
    return [];
  },
  create: async (data: { nombre: string; descripcion?: string }) => {
    const res = await apiClient.post('/cargos', data);
    return res.data.data;
  },
  update: async (id: string, data: { nombre: string; descripcion?: string }) => {
    const res = await apiClient.put(`/cargos/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/cargos/${id}`);
    return res.data.success;
  },
};
