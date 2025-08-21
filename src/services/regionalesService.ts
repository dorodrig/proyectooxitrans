import type { Regional } from '../types';

export const regionalesService = {
  async getAll(): Promise<Regional[]> {
    const res = await fetch('/api/regionales');
    if (!res.ok) throw new Error('Error al obtener regionales');
    return await res.json().then(r => r.data || []);
  },
  async create(regional: Omit<Regional, 'id'>): Promise<Regional> {
    const res = await fetch('/api/regionales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regional),
    });
    if (!res.ok) throw new Error('Error al crear regional');
    return await res.json().then(r => r.data);
  },
  async update(id: string, regional: Partial<Regional>): Promise<Regional> {
    const res = await fetch(`/api/regionales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regional),
    });
    if (!res.ok) throw new Error('Error al actualizar regional');
    return await res.json().then(r => r.data);
  },
  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/regionales/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar regional');
  },
};
