import type { Regional } from '../types';
import { apiClient } from './apiClient';

export const regionalesService = {
  async getAll(): Promise<Regional[]> {
    const response = await apiClient.get('/regionales');
    return response.data || [];
  },
  
  async create(regional: Omit<Regional, 'id'>): Promise<Regional> {
    const response = await apiClient.post('/regionales', regional);
    return response.data;
  },
  
  async update(id: string, regional: Partial<Regional>): Promise<Regional> {
    const response = await apiClient.put(`/regionales/${id}`, regional);
    return response.data;
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/regionales/${id}`);
  },
};
