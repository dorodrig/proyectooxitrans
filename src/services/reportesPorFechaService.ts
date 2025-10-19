// ====================================
// 📊 SERVICIO DE REPORTES POR FECHAS
// Reporte general de jornadas por rango de fechas
// ====================================

import { apiClient } from './apiClient';

// Interfaces para el reporte
export interface JornadaCompleta {
  nombre_completo: string;
  documento: string;
  regional: string;
  fecha_inicio_turno: string;
  fecha_fin_turno: string;
  descanso_manana: string;
  almuerzo: string;
  descanso_tarde: string;
  cantidad_horas_trabajadas: string;
  cantidad_horas_extra: string;
  periodo_consulta: string;
  novedad: string;
  tiempo_novedad: string;
}

export interface FiltrosReporte {
  fechaInicio: string;  // formato YYYY-MM-DD
  fechaFin: string;     // formato YYYY-MM-DD
  formato?: 'xlsx' | 'csv';
  colaboradorId?: number; // ID del colaborador para filtrar (opcional)
}

export interface PreviewReporte {
  preview: JornadaCompleta[];
  totalRegistros: number;
  mensaje: string;
}

export class ReportesPorFechaService {

  /**
   * Obtener vista previa del reporte
   */
  static async obtenerPreview(filtros: FiltrosReporte): Promise<PreviewReporte> {
    try {
      console.log('🔍 Obteniendo preview del reporte:', filtros);

      const queryParams = new URLSearchParams({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      });

      // Agregar colaboradorId si está presente
      if (filtros.colaboradorId) {
        queryParams.append('colaboradorId', filtros.colaboradorId.toString());
      }

      const response = await apiClient.get(`/reportes/preview-jornadas?${queryParams.toString()}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener preview');
      }

    } catch (error: any) {
      console.error('❌ Error obteniendo preview:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener vista previa del reporte'
      );
    }
  }

  /**
   * Descargar reporte completo en Excel
   */
  static async descargarReporte(filtros: FiltrosReporte): Promise<void> {
    try {
      console.log('📥 Descargando reporte completo:', filtros);

      const queryParams = new URLSearchParams({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        formato: filtros.formato || 'xlsx'
      });

      // Agregar colaboradorId si está presente
      if (filtros.colaboradorId) {
        queryParams.append('colaboradorId', filtros.colaboradorId.toString());
      }

      // Para descargas de archivos, necesitamos usar fetch directamente
      const fullUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/reportes/jornadas-completo?${queryParams.toString()}`;
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Obtener el blob del response
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre del archivo
      const fechaInicio = filtros.fechaInicio.replace(/-/g, '');
      const fechaFin = filtros.fechaFin.replace(/-/g, '');
      link.download = `Reporte_Jornadas_${fechaInicio}_${fechaFin}.xlsx`;
      
      // Ejecutar descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte descargado exitosamente');

    } catch (error: any) {
      console.error('❌ Error descargando reporte:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al descargar el reporte'
      );
    }
  }

  /**
   * Validar rango de fechas
   */
  static validarRangoFechas(fechaInicio: string, fechaFin: string): {
    esValido: boolean;
    mensaje: string;
  } {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();

    // Validar formato de fechas
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return {
        esValido: false,
        mensaje: 'Las fechas deben tener un formato válido (YYYY-MM-DD)'
      };
    }

    // Fecha fin no puede ser anterior a fecha inicio
    if (fin < inicio) {
      return {
        esValido: false,
        mensaje: 'La fecha fin no puede ser anterior a la fecha de inicio'
      };
    }

    // No más de 90 días de diferencia
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) {
      return {
        esValido: false,
        mensaje: 'El rango de fechas no puede ser mayor a 90 días'
      };
    }

    // Fecha inicio no puede ser muy antigua (más de 1 año)
    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(hoy.getFullYear() - 1);
    
    if (inicio < unAnoAtras) {
      return {
        esValido: false,
        mensaje: 'La fecha de inicio no puede ser anterior a un año atrás'
      };
    }

    return {
      esValido: true,
      mensaje: 'Rango de fechas válido'
    };
  }

  /**
   * Formatear fecha para display (DD/MM/YYYY)
   */
  static formatearFechaDisplay(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CO');
  }

  /**
   * Formatear fecha para API (YYYY-MM-DD)
   */
  static formatearFechaAPI(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Obtener rango de fechas sugeridos
   */
  static obtenerRangosSugeridos(): Array<{
    label: string;
    fechaInicio: string;
    fechaFin: string;
  }> {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    return [
      {
        label: 'Hoy',
        fechaInicio: this.formatearFechaAPI(hoy),
        fechaFin: this.formatearFechaAPI(hoy)
      },
      {
        label: 'Ayer', 
        fechaInicio: this.formatearFechaAPI(ayer),
        fechaFin: this.formatearFechaAPI(ayer)
      },
      {
        label: 'Esta semana',
        fechaInicio: this.formatearFechaAPI(inicioSemana),
        fechaFin: this.formatearFechaAPI(hoy)
      },
      {
        label: 'Este mes',
        fechaInicio: this.formatearFechaAPI(inicioMes),
        fechaFin: this.formatearFechaAPI(hoy)
      },
      {
        label: 'Mes anterior',
        fechaInicio: this.formatearFechaAPI(inicioMesAnterior),
        fechaFin: this.formatearFechaAPI(finMesAnterior)
      }
    ];
  }
}