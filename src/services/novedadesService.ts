import { apiClient } from './apiClient';

// ====================================
// 📊 INTERFACES NOVEDADES
// ====================================

export interface Novedad {
  id: number;
  usuarioId: number;
  tipo: 'incapacidad' | 'ausentismo' | 'permiso' | 'no_remunerado' | 'lic_maternidad' | 'lic_paternidad' | 'dia_familia' | 'horas_extra';
  fechaInicio: string;
  fechaFin: string;
  horas: number;
  createdAt: string;
  updatedAt: string;
}

export interface HorasExtraRegistradas {
  fecha: string;
  horas: number;
  tipo: 'horas_extra';
}

// ====================================
// 🚀 SERVICIO NOVEDADES
// ====================================

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
  },

  /**
   * 🕒 Obtener horas extras registradas para un colaborador
   */
  async getHorasExtrasByUsuario(usuarioId: string): Promise<HorasExtraRegistradas[]> {
    try {
      const res = await apiClient.get(`/novedades/usuario/${usuarioId}`);
      const novedades = res.data?.data || res.data || [];
      
      // Filtrar solo horas extra y formatear
      const horasExtras = novedades
        .filter((n: Novedad) => n.tipo === 'horas_extra')
        .map((n: Novedad) => ({
          fecha: n.fechaInicio.split('T')[0], // Extraer solo la fecha
          horas: n.horas,
          tipo: 'horas_extra' as const
        }));

      console.log('📊 Horas extra obtenidas:', horasExtras);
      return horasExtras;
    } catch (error) {
      console.error('❌ Error obteniendo horas extra:', error);
      return [];
    }
  },

  /**
   * 📅 Obtener horas extras por rango de fechas
   */
  async getHorasExtrasByFecha(
    usuarioId: string, 
    fechaInicio?: string, 
    fechaFin?: string
  ): Promise<HorasExtraRegistradas[]> {
    const horasExtras = await this.getHorasExtrasByUsuario(usuarioId);
    
    if (!fechaInicio && !fechaFin) return horasExtras;
    
    return horasExtras.filter(he => {
      if (fechaInicio && he.fecha < fechaInicio) return false;
      if (fechaFin && he.fecha > fechaFin) return false;
      return true;
    });
  }
};
