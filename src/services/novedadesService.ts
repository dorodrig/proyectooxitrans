import { apiClient } from './apiClient';

export const novedadesService = {
  async create(data: {
    usuarioId: string;
    tipo: string;
    fechaInicio: string;
    fechaFin: string;
    horas: number;
  }) {
    const res = await apiClient.post('/novedades', data);
    return res.data;
  },
  async getAll() {
    const res = await apiClient.get('/novedades');
    return res.data;
  },
  async getByUsuario(usuarioId: string) {
    const res = await apiClient.get(`/novedades/usuario/${usuarioId}`);
    return res.data;
  }
};
