// ================================================
// Servicio para Tiempo Laboral Global OXITRANS
// ================================================

import { apiClient } from './apiClient';

// 🔄 SERVICIO TIEMPO LABORAL GLOBAL - 2025-10-06
console.log('🔄 [tiempoLaboralService] Servicio actualizado para configuración global única');

interface TiempoLaboralData {
  id?: number;
  hora_entrada: string;
  tiempo_trabajo_dia: number;
  fin_jornada_laboral: string;
  fecha_actualizacion?: string;
}

interface TiempoLaboralResponse {
  success: boolean;
  data?: TiempoLaboralData;
  message?: string;
  error?: string;
}

class TiempoLaboralService {
  private baseUrl = '/jornada-config'; // Mantener URL por compatibilidad

  /**
   * Obtener configuración de tiempo laboral global OXITRANS
   * Un solo registro que aplica a todos los empleados
   */
  async obtenerTiempoLaboralGlobal(): Promise<TiempoLaboralData | null> {
    try {
      console.log('🔍 [tiempoLaboral] Obteniendo tiempo laboral global OXITRANS');
      
      const responseBody = await apiClient.get(`${this.baseUrl}/global`);
      
      console.log('🔍 [tiempoLaboral] Respuesta GET completa:', responseBody);
      
      // ⚡ CORRECCIÓN: apiClient.get retorna directamente la respuesta del servidor
      if (responseBody && typeof responseBody === 'object') {
        // Caso 1: Respuesta con estructura {success, data}
        if ('success' in responseBody && 'data' in responseBody) {
          const result: TiempoLaboralResponse = responseBody;
          if (result.success && result.data) {
            console.log('✅ [tiempoLaboral] Configuración global obtenida:', result.data);
            return result.data;
          }
        }
        // Caso 2: Respuesta directa con los datos
        else if ('id' in responseBody && 'hora_entrada' in responseBody) {
          console.log('✅ [tiempoLaboral] Configuración global obtenida (respuesta directa):', responseBody);
          return responseBody as TiempoLaboralData;
        }
      }

      console.log('📝 [tiempoLaboral] No existe configuración global');
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.warn('⚠️ [tiempoLaboral] Error obteniendo configuración:', errorMessage);
      return null;
    }
  }

  /**
   * Actualizar tiempo laboral global OXITRANS
   * Actualiza o crea el registro único de configuración global
   */
  async actualizarTiempoLaboralGlobal(data: Omit<TiempoLaboralData, 'id' | 'fecha_actualizacion'>): Promise<TiempoLaboralData> {
    try {
      console.log('🔧 [tiempoLaboral] Actualizando tiempo laboral global:', data);
      console.log('🔧 [tiempoLaboral] Datos en detalle:', {
        hora_entrada: data.hora_entrada,
        tiempo_trabajo_dia: data.tiempo_trabajo_dia,
        fin_jornada_laboral: data.fin_jornada_laboral,
        tipos: {
          hora_entrada: typeof data.hora_entrada,
          tiempo_trabajo_dia: typeof data.tiempo_trabajo_dia,
          fin_jornada_laboral: typeof data.fin_jornada_laboral
        }
      });
      
      // 🚨 VERIFICACIÓN CRÍTICA: Asegurar formato HH:MM sin segundos
      const datosCorregidos = {
        hora_entrada: data.hora_entrada?.substring(0, 5) || '08:00', // Cortar segundos si existen
        tiempo_trabajo_dia: data.tiempo_trabajo_dia,
        fin_jornada_laboral: data.fin_jornada_laboral?.substring(0, 5) || '17:00' // Cortar segundos si existen
      };
      
      console.log('🔧 [tiempoLaboral] Datos CORREGIDOS para enviar:', datosCorregidos);
      
      const responseBody = await apiClient.post(`${this.baseUrl}/global`, datosCorregidos);
      
      console.log('🔍 [tiempoLaboral] Respuesta completa del apiClient:', responseBody);
      console.log('🔍 [tiempoLaboral] Tipo de respuesta:', typeof responseBody);
      
      // ⚡ CORRECCIÓN: apiClient.post retorna directamente la respuesta del servidor,
      // NO un objeto con .data como axios
      
      if (!responseBody || typeof responseBody !== 'object') {
        console.error('❌ [tiempoLaboral] Respuesta inválida del servidor:', responseBody);
        throw new Error('Respuesta inválida del servidor');
      }
      
      // Verificar si la respuesta tiene estructura {success, data}
      if ('success' in responseBody && 'data' in responseBody) {
        const result: TiempoLaboralResponse = responseBody;
        
        if (!result.success) {
          const errorMessage = result.error || 'Error actualizando tiempo laboral global';
          console.error('❌ [tiempoLaboral] Error en respuesta del servidor:', errorMessage);
          throw new Error(errorMessage);
        }

        if (!result.data) {
          console.error('❌ [tiempoLaboral] Respuesta sin datos:', result);
          throw new Error('No se recibieron datos del tiempo laboral actualizado');
        }

        console.log('✅ [tiempoLaboral] Tiempo laboral global actualizado exitosamente:', result.data);
        return result.data;
      }
      // Si no tiene estructura envuelta, asumir que es directamente los datos
      else if ('id' in responseBody && 'hora_entrada' in responseBody) {
        console.log('✅ [tiempoLaboral] Tiempo laboral global actualizado (respuesta directa):', responseBody);
        return responseBody as TiempoLaboralData;
      }
      
      console.error('❌ [tiempoLaboral] Estructura de respuesta no reconocida:', responseBody);
      throw new Error('Estructura de respuesta no válida del servidor');
      
    } catch (error: unknown) {
      console.error('❌ [tiempoLaboral] Error actualizando tiempo laboral:', error);
      // Si es un error de red o del servidor, mostrar más detalles
      if (error instanceof Error) {
        console.error('❌ [tiempoLaboral] Detalles del error:', error.message);
        console.error('❌ [tiempoLaboral] Stack trace:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Calcular hora de salida basada en inicio y horas de trabajo
   */
  calcularHoraSalida(hora_entrada: string, tiempo_trabajo_dia: number): string {
    try {
      const [horas, minutos] = hora_entrada.split(':').map(Number);
      const fechaInicio = new Date();
      fechaInicio.setHours(horas, minutos, 0, 0);
      
      // Agregar horas de trabajo + 1 hora de almuerzo
      const tiempoTotalMs = (tiempo_trabajo_dia + 1) * 60 * 60 * 1000;
      const fechaFin = new Date(fechaInicio.getTime() + tiempoTotalMs);
      
      return `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculando hora de salida:', error);
      return '17:00'; // Valor por defecto
    }
  }

  /**
   * Validar datos de tiempo laboral
   */
  validarTiempoLaboral(data: Partial<TiempoLaboralData>): { valida: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validar hora de inicio
    if (!data.hora_entrada) {
      errores.push('La hora de inicio es requerida');
    } else {
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(data.hora_entrada)) {
        errores.push('La hora de inicio debe tener formato HH:MM válido');
      }
    }

    // Validar horas de trabajo
    if (!data.tiempo_trabajo_dia || data.tiempo_trabajo_dia <= 0) {
      errores.push('Las horas de trabajo deben ser mayor a 0');
    } else if (data.tiempo_trabajo_dia < 4) {
      errores.push('Mínimo 4 horas de trabajo por jornada');
    } else if (data.tiempo_trabajo_dia > 10) {
      errores.push('Máximo 10 horas de trabajo por regulaciones laborales');
    }

    return {
      valida: errores.length === 0,
      errores
    };
  }

  /**
   * Calcular horas extras basadas en horas de trabajo
   */
  calcularHorasExtras(tiempo_trabajo_dia: number): number {
    const horasNormales = 8;
    return Math.max(0, tiempo_trabajo_dia - horasNormales);
  }

  /**
   * Obtener sugerencias de horarios comunes OXITRANS
   */
  obtenerSugerenciasHorarios(): Array<{ nombre: string; hora_entrada: string; tiempo_trabajo_dia: number }> {
    return [
      { nombre: 'Jornada Estándar', hora_entrada: '08:00', tiempo_trabajo_dia: 8 },
      { nombre: 'Jornada Matutina', hora_entrada: '07:00', tiempo_trabajo_dia: 8 },
      { nombre: 'Jornada Tarde', hora_entrada: '14:00', tiempo_trabajo_dia: 8 },
      { nombre: 'Media Jornada', hora_entrada: '08:00', tiempo_trabajo_dia: 4 },
      { nombre: 'Jornada Extendida', hora_entrada: '08:00', tiempo_trabajo_dia: 9 }
    ];
  }
}

// Instancia singleton del servicio
export const jornadaConfigService = new TiempoLaboralService();

// Exportar tipos para uso en componentes
export type { TiempoLaboralData, TiempoLaboralResponse };