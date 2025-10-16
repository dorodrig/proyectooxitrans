import { apiClient } from './apiClient';
// import type { Usuario } from '../types'; // No utilizado actualmente

// ====================================
// 🔍 INTERFACES - MÓDULO COLABORADORES
// ====================================

// Colaborador encontrado en búsqueda
export interface Colaborador {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  rol: 'admin' | 'empleado' | 'supervisor';
  estado: 'activo' | 'inactivo' | 'suspendido';
  fecha_creacion: string;
  regional_id: number;
  regional_nombre: string;
  departamento: string;
  cargo_id: number;
  cargo_nombre: string;
}

// Jornada laboral completa
export interface JornadaLaboral {
  id: number;
  fecha: string;
  entrada: string;
  salida: string;
  descanso_manana_inicio?: string;
  descanso_manana_fin?: string;
  almuerzo_inicio?: string;
  almuerzo_fin?: string;
  descanso_tarde_inicio?: string;
  descanso_tarde_fin?: string;
  latitud_entrada?: number;
  longitud_entrada?: number;
  latitud_salida?: number;
  longitud_salida?: number;
  horas_trabajadas?: number;
  observaciones_entrada?: string;
  observaciones_salida?: string;
  duracion_total: string;
  duracion_almuerzo: string;
  duracion_descanso_manana: string;
  duracion_descanso_tarde: string;
}

// Ubicación GPS para mapas
export interface UbicacionGPS {
  id: string;
  jornada_id: number;
  fecha: string;
  hora: string;
  tipo: 'entrada' | 'salida';
  latitud: number;
  longitud: number;
}

// Cálculo de horas extras por día
export interface CalculoHorasExtrasDia {
  fecha: string;
  entrada: string;
  salida: string;
  horas_trabajadas: number;
  horas_diurnas: number;
  horas_nocturnas: number;
  horas_extras_total: number;
  horas_extras_diurnas: number;
  horas_extras_nocturnas: number;
  descanso_minutos: number;
}

// Totales de período
export interface TotalesHorasExtras {
  total_horas_trabajadas: number;
  total_horas_diurnas: number;
  total_horas_nocturnas: number;
  total_horas_extras: number;
  total_horas_extras_diurnas: number;
  total_horas_extras_nocturnas: number;
  dias_trabajados: number;
  promedio_horas_dia: number;
}

// ====================================
// 🔧 RESPUESTAS DE API
// ====================================

interface BusquedaResponse {
  success: boolean;
  data: Colaborador[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface HistorialJornadasResponse {
  success: boolean;
  data: {
    colaborador: {
      id: number;
      nombre: string;
      apellido: string;
    };
    jornadas: JornadaLaboral[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface UbicacionesGPSResponse {
  success: boolean;
  data: {
    colaborador: {
      id: number;
      nombre: string;
      apellido: string;
    };
    ubicaciones: UbicacionGPS[];
    total_registros: number;
    pagination: {
      page: number;
      limit: number;
    };
  };
}

interface HorasExtrasResponse {
  success: boolean;
  data: {
    colaborador: {
      id: number;
      nombre: string;
      apellido: string;
    };
    periodo: {
      fecha_inicio: string;
      fecha_fin: string;
      horas_legales_dia: number;
    };
    calculo_diario: CalculoHorasExtrasDia[];
    totales: TotalesHorasExtras;
  };
}

// ====================================
// 🚀 SERVICIO COLABORADORES
// ====================================

export const colaboradoresService = {
  
  /**
   * 🔍 Buscar colaboradores por cédula o apellidos
   */
  buscar: async (
    termino: string, 
    page = 1, 
    limit = 10
  ): Promise<BusquedaResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return apiClient.get(`/colaboradores/buscar/${encodeURIComponent(termino)}?${params.toString()}`);
  },

  /**
   * 📅 Obtener historial completo de jornadas laborales
   */
  getHistorialJornadas: async (
    colaboradorId: number,
    options: {
      fechaInicio?: string;
      fechaFin?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<HistorialJornadasResponse> => {
    const params = new URLSearchParams();
    
    if (options.fechaInicio) params.append('fechaInicio', options.fechaInicio);
    if (options.fechaFin) params.append('fechaFin', options.fechaFin);
    params.append('page', (options.page || 1).toString());
    params.append('limit', (options.limit || 20).toString());
    
    return apiClient.get(`/colaboradores/${colaboradorId}/jornadas?${params.toString()}`);
  },

  /**
   * 🗺️ Obtener ubicaciones GPS para mapas
   */
  getUbicacionesGPS: async (
    colaboradorId: number,
    options: {
      fechaInicio?: string;
      fechaFin?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<UbicacionesGPSResponse> => {
    const params = new URLSearchParams();
    
    if (options.fechaInicio) params.append('fechaInicio', options.fechaInicio);
    if (options.fechaFin) params.append('fechaFin', options.fechaFin);
    params.append('page', (options.page || 1).toString());
    params.append('limit', (options.limit || 50).toString());
    
    return apiClient.get(`/colaboradores/${colaboradorId}/ubicaciones?${params.toString()}`);
  },

  /**
   * ⏰ Calcular horas extras con desglose diurno/nocturno
   */
  calcularHorasExtras: async (data: {
    colaborador_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    horas_legales_dia?: number;
  }): Promise<HorasExtrasResponse> => {
    return apiClient.post('/colaboradores/horas-extras', {
      ...data,
      horas_legales_dia: data.horas_legales_dia || 8 // Default legal en Colombia
    });
  },

  /**
   * 📊 Obtener resumen de colaborador con datos principales
   */
  getResumenColaborador: async (colaboradorId: number) => {
    // Obtener datos básicos + jornadas recientes
    const [colaboradorData, jornadasRecientes] = await Promise.all([
      colaboradoresService.buscar(colaboradorId.toString(), 1, 1),
      colaboradoresService.getHistorialJornadas(colaboradorId, { limit: 5 })
    ]);

    return {
      colaborador: colaboradorData.data[0] || null,
      jornadasRecientes: jornadasRecientes.data?.jornadas || []
    };
  },

  /**
   * 📈 Obtener estadísticas de colaborador (período customizable)
   */
  getEstadisticasColaborador: async (
    colaboradorId: number,
    fechaInicio: string,
    fechaFin: string
  ) => {
    const [horasExtras, ubicaciones] = await Promise.all([
      colaboradoresService.calcularHorasExtras({
        colaborador_id: colaboradorId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      }),
      colaboradoresService.getUbicacionesGPS(colaboradorId, {
        fechaInicio,
        fechaFin,
        limit: 100
      })
    ]);

    return {
      horasExtras: horasExtras.data,
      ubicaciones: ubicaciones.data.ubicaciones,
      totalRegistrosGPS: ubicaciones.data.total_registros
    };
  },

  /**
   * 📄 Generar reporte para descarga
   */
  generarReporte: async (
    colaboradorId: number,
    fechaInicio: string,
    fechaFin: string,
    formato: 'csv' | 'excel' = 'csv'
  ) => {
    // Por ahora retornamos los datos, la descarga se maneja en el componente
    const estadisticas = await colaboradoresService.getEstadisticasColaborador(
      colaboradorId, 
      fechaInicio, 
      fechaFin
    );

    return {
      colaborador: estadisticas.horasExtras.colaborador,
      periodo: estadisticas.horasExtras.periodo,
      calculo_diario: estadisticas.horasExtras.calculo_diario,
      totales: estadisticas.horasExtras.totales,
      ubicaciones: estadisticas.ubicaciones,
      formato
    };
  }

};