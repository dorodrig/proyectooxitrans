import { apiClient } from './apiClient';

export interface RegistroJornada {
  id?: number;
  usuarioId: number;
  fecha: string;
  entrada?: string;
  descansoMananaInicio?: string;
  descansoMananaFin?: string;
  almuerzoInicio?: string;
  almuerzoFin?: string;
  descansoTardeInicio?: string;
  descansoTardeFin?: string;
  salida?: string;
  horasTrabajadas?: number; // Cambiado a opcional
  ubicacionEntrada?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  ubicacionSalida?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  autoCerrada?: boolean; // Cambiado a opcional
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegistroTiempo {
  tipo: 'entrada' | 'descanso_manana_inicio' | 'descanso_manana_fin' | 
        'almuerzo_inicio' | 'almuerzo_fin' | 'descanso_tarde_inicio' | 
        'descanso_tarde_fin' | 'salida';
  timestamp: string;
  ubicacion: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  observaciones?: string;
}

export interface ValidacionUbicacion {
  valida: boolean;
  distancia: number;
  tolerancia: number;
  ubicacion: {
    nombre: string;
    latitud: number;
    longitud: number;
  } | null;
  tipoValidacion: 'ubicacion_especifica' | 'regional' | 'sin_restriccion';
}

class JornadasService {
  private baseURL = '/jornadas';

  /**
   * Obtener jornada actual del usuario autenticado
   */
  async obtenerJornadaActual(): Promise<RegistroJornada | null> {
    try {
      const response = await apiClient.get(`${this.baseURL}/actual`);
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        return null; // No hay jornada iniciada hoy
      }
      throw error;
    }
  }

  /**
   * Registrar un evento de tiempo (entrada, almuerzo, salida, descanso)
   */
  async registrarTiempo(registro: RegistroTiempo): Promise<RegistroJornada> {
    try {
      const response = await apiClient.post(`${this.baseURL}/registrar`, registro);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validar ubicación actual contra regional asignada
   */
  async validarUbicacion(latitude: number, longitude: number): Promise<ValidacionUbicacion> {
    try {
      const response = await apiClient.post(`${this.baseURL}/validar-ubicacion`, {
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener historial de jornadas del usuario
   */
  async obtenerHistorial(
    fechaInicio?: string, 
    fechaFin?: string, 
    limite: number = 30
  ): Promise<RegistroJornada[]> {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      params.append('limite', limite.toString());

      const response = await apiClient.get(`${this.baseURL}/historial?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Forzar cierre de jornada (solo para administradores)
   */
  async forzarCierre(jornadaId: number, observaciones?: string): Promise<RegistroJornada> {
    try {
      const response = await apiClient.post(`${this.baseURL}/${jornadaId}/forzar-cierre`, {
        observaciones
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de jornadas del usuario
   */
  async obtenerEstadisticas(mes?: number, año?: number): Promise<{
    totalJornadas: number;
    horasPromedio: number;
    jornadasCompletas: number;
    jornadasIncompletas: number;
    jornadasAutoCerradas: number;
    puntualidad: {
      entradaPuntual: number;
      salidaPuntual: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes.toString());
      if (año) params.append('año', año.toString());

      const response = await apiClient.get(`${this.baseURL}/estadisticas?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calcular horas trabajadas en tiempo real
   */
  calcularHorasTrabajadas(jornada: RegistroJornada, horaActual?: Date): number {
    if (!jornada.entrada) return 0;

    const entrada = new Date(jornada.entrada);
    const ahora = horaActual || new Date();
    const salida = jornada.salida ? new Date(jornada.salida) : ahora;

    // Tiempo total en milisegundos
    let tiempoTotal = salida.getTime() - entrada.getTime();

    // Restar tiempo de almuerzo
    if (jornada.almuerzoInicio) {
      const almuerzoInicio = new Date(jornada.almuerzoInicio);
      const almuerzoFin = jornada.almuerzoFin ? new Date(jornada.almuerzoFin) : ahora;
      const tiempoAlmuerzo = almuerzoFin.getTime() - almuerzoInicio.getTime();
      tiempoTotal -= tiempoAlmuerzo;
    }

    // Restar descansos
    if (jornada.descansoMananaInicio && jornada.descansoMananaFin) {
      const descansoInicio = new Date(jornada.descansoMananaInicio);
      const descansoFin = new Date(jornada.descansoMananaFin);
      tiempoTotal -= (descansoFin.getTime() - descansoInicio.getTime());
    }

    if (jornada.descansoTardeInicio && jornada.descansoTardeFin) {
      const descansoInicio = new Date(jornada.descansoTardeInicio);
      const descansoFin = new Date(jornada.descansoTardeFin);
      tiempoTotal -= (descansoFin.getTime() - descansoInicio.getTime());
    }

    // Convertir a horas
    return Math.max(0, tiempoTotal / (1000 * 60 * 60));
  }

  /**
   * Validar límites de tiempo para descansos
   */
  validarLimitesDescanso(
    tipo: 'almuerzo' | 'descanso',
    inicio: string,
    fin?: string
  ): {
    valido: boolean;
    duracion: number;
    limite: number;
    excedido: boolean;
  } {
    const inicioDate = new Date(inicio);
    const finDate = fin ? new Date(fin) : new Date();
    const duracionMs = finDate.getTime() - inicioDate.getTime();
    const duracionMinutos = duracionMs / (1000 * 60);

    const limite = tipo === 'almuerzo' ? 60 : 15; // 60 min almuerzo, 15 min descansos
    const excedido = duracionMinutos > limite;

    return {
      valido: !excedido,
      duracion: duracionMinutos,
      limite,
      excedido
    };
  }

  /**
   * Verificar si puede registrar siguiente actividad
   */
  puedeRegistrar(
    jornada: RegistroJornada,
    tipoRegistro: 'entrada' | 'almuerzo' | 'salida' | 'descanso_manana' | 'descanso_tarde'
  ): {
    puede: boolean;
    razon?: string;
  } {
    // Entrada: solo si no hay entrada registrada
    if (tipoRegistro === 'entrada') {
      return {
        puede: !jornada.entrada,
        razon: jornada.entrada ? 'Ya registraste la entrada' : undefined
      };
    }

    // Almuerzo: requiere entrada
    if (tipoRegistro === 'almuerzo') {
      if (!jornada.entrada) {
        return { puede: false, razon: 'Debes registrar entrada primero' };
      }
      return { puede: true };
    }

    // Salida: requiere entrada y almuerzo completo
    if (tipoRegistro === 'salida') {
      if (!jornada.entrada) {
        return { puede: false, razon: 'Debes registrar entrada primero' };
      }
      if (!jornada.almuerzoFin) {
        return { puede: false, razon: 'Debes completar el almuerzo primero' };
      }
      return { puede: true };
    }

    // Descansos: requieren entrada
    if (tipoRegistro.startsWith('descanso')) {
      if (!jornada.entrada) {
        return { puede: false, razon: 'Debes registrar entrada primero' };
      }
      
      if (tipoRegistro === 'descanso_tarde' && !jornada.almuerzoFin) {
        return { puede: false, razon: 'Debes completar el almuerzo primero' };
      }
      
      return { puede: true };
    }

    return { puede: false, razon: 'Tipo de registro no válido' };
  }
}

export const jornadasService = new JornadasService();