/**
 * Servicio de utilidades para cálculos precisos de tiempo laboral
 * Este servicio gestiona correctamente las zonas horarias para Colombia
 * y proporciona métodos para calcular tiempo trabajado con precisión
 */

// Constantes de zona horaria
const COLOMBIA_TIMEZONE = 'America/Bogota'; // UTC-5

export interface PeriodoTiempo {
  inicio: Date | string | null;
  fin: Date | string | null;
}

/**
 * Normaliza una fecha a objeto Date, manejando diferentes formatos
 */
export const normalizarFecha = (fecha: Date | string | null | undefined): Date | null => {
  if (!fecha) return null;
  
  if (typeof fecha === 'string') {
    // Si la fecha ya incluye información de zona horaria, usarla directamente
    if (fecha.includes('Z') || fecha.includes('+') || fecha.includes('-')) {
      return new Date(fecha);
    }
    
    // Si no tiene zona horaria, asumir que es hora de Colombia (UTC-5)
    return new Date(`${fecha.replace(' ', 'T')}${fecha.includes('T') ? '' : 'T00:00:00'}-05:00`);
  }
  
  return fecha;
};

/**
 * Convierte milisegundos a formato horas:minutos:segundos
 */
export const formatearTiempoMs = (milisegundos: number): string => {
  // Evitar negativos
  milisegundos = Math.max(0, milisegundos);
  
  const segundos = Math.floor((milisegundos / 1000) % 60);
  const minutos = Math.floor((milisegundos / (1000 * 60)) % 60);
  const horas = Math.floor(milisegundos / (1000 * 60 * 60));
  
  return [
    horas.toString().padStart(2, '0'),
    minutos.toString().padStart(2, '0'),
    segundos.toString().padStart(2, '0')
  ].join(':');
};

/**
 * Calcula la duración entre dos fechas en milisegundos
 * Si alguna fecha es null, se usa la fecha actual
 */
export const calcularDuracionMs = (inicio: Date | string | null, fin: Date | string | null = null): number => {
  const inicioDate = normalizarFecha(inicio);
  const finDate = fin ? normalizarFecha(fin) : new Date();
  
  if (!inicioDate) return 0;
  
  return (finDate as Date).getTime() - inicioDate.getTime();
};

/**
 * Calcula el tiempo total trabajado teniendo en cuenta descansos
 * @param entrada Timestamp de entrada
 * @param salida Timestamp de salida (o null si aún no ha terminado)
 * @param periodos Array de periodos de descanso a restar
 * @returns Tiempo trabajado en milisegundos
 */
export const calcularTiempoTrabajadoMs = (
  entrada: Date | string | null,
  salida: Date | string | null = null,
  periodos: PeriodoTiempo[] = []
): number => {
  if (!entrada) return 0;
  
  // Calcular tiempo total
  const tiempoTotal = calcularDuracionMs(entrada, salida);
  
  // Restar periodos de descanso
  let tiempoDescanso = 0;
  
  for (const periodo of periodos) {
    if (periodo.inicio) {
      const periodFin = periodo.fin || new Date();
      tiempoDescanso += calcularDuracionMs(periodo.inicio, periodFin);
    }
  }
  
  return Math.max(0, tiempoTotal - tiempoDescanso);
};

/**
 * Formatea un timestamp para mostrar en la interfaz
 * Maneja múltiples formatos y siempre muestra hora de Colombia
 */
export const formatearHoraUI = (fecha?: Date | string | null): string => {
  if (!fecha) return '--:--';
  
  try {
    let fechaObj: Date;
    
    if (typeof fecha === 'string') {
      // Detectar y manejar diferentes formatos
      if (fecha.includes('T') && fecha.includes('-05:00')) {
        // Formato ISO con timezone Colombia: "2025-10-07T20:30:00-05:00"
        fechaObj = new Date(fecha);
      } else if (fecha.includes('T') && fecha.includes('Z')) {
        // Formato ISO UTC: "2025-10-07T01:30:00.000Z"
        fechaObj = new Date(fecha);
      } else if (fecha.includes(' ') && !fecha.includes('T')) {
        // Formato MySQL: "2025-10-07 01:47:30" 
        // NUEVO: Asumir que SIEMPRE es hora de Colombia ya que se guardó correctamente
        // El backend ya está corrigiendo los timestamps al leerlos
        fechaObj = new Date(`${fecha.replace(' ', 'T')}-05:00`);
      } else {
        // Fallback: intentar parsear directamente
        fechaObj = new Date(fecha);
      }
    } else {
      fechaObj = fecha;
    }
    
    if (isNaN(fechaObj.getTime())) {
      console.warn('Timestamp inválido:', fecha);
      return '--:--';
    }
    
    // SIEMPRE formatear mostrando la hora equivalente en Colombia
    // Esto asegura que sin importar cómo esté almacenado, se muestre la hora local correcta
    return fechaObj.toLocaleTimeString('es-CO', {
      timeZone: COLOMBIA_TIMEZONE,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formateando hora:', error, fecha);
    return '--:--';
  }
};

/**
 * Genera un timestamp en zona horaria de Colombia (UTC-5)
 * Formato: ISO 8601 compatible con registros existentes
 */
export const obtenerTimestampColombia = (): string => {
  const ahora = new Date();
  
  // Obtener componentes de fecha/hora en timezone de Colombia usando Intl
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(ahora);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const hour = parts.find(p => p.type === 'hour')?.value;
  const minute = parts.find(p => p.type === 'minute')?.value;
  const second = parts.find(p => p.type === 'second')?.value;
  
  // Formato ISO 8601 con timezone de Colombia
  const timestamp = `${year}-${month}-${day}T${hour}:${minute}:${second}-05:00`;
  
  return timestamp;
};

/**
 * Clase principal con métodos para gestión de tiempo laboral
 */
class TiempoLaboralService {
  /**
   * Calcula el tiempo transcurrido en una jornada con múltiples descansos
   */
  calcularTiempoTranscurrido(jornada: any): string {
    if (!jornada?.entrada) return '00:00:00';
    
    try {
      // Periodos de descanso a considerar
      const periodos: PeriodoTiempo[] = [];
      
      // Agregar descanso de mañana si existe
      if (jornada.descansoMananaInicio) {
        periodos.push({
          inicio: jornada.descansoMananaInicio,
          fin: jornada.descansoMananaFin || null
        });
      }
      
      // Agregar almuerzo si existe
      if (jornada.almuerzoInicio) {
        periodos.push({
          inicio: jornada.almuerzoInicio,
          fin: jornada.almuerzoFin || null
        });
      }
      
      // Agregar descanso de tarde si existe
      if (jornada.descansoTardeInicio) {
        periodos.push({
          inicio: jornada.descansoTardeInicio,
          fin: jornada.descansoTardeFin || null
        });
      }
      
      // Calcular tiempo trabajado
      const tiempoMs = calcularTiempoTrabajadoMs(
        jornada.entrada,
        jornada.salida,
        periodos
      );
      
      return formatearTiempoMs(tiempoMs);
    } catch (error) {
      console.error('Error calculando tiempo transcurrido:', error);
      return '00:00:00';
    }
  }

  /**
   * Calcula horas trabajadas en decimal (para backend)
   */
  calcularHorasDecimal(jornada: any): number {
    if (!jornada?.entrada) return 0;
    
    try {
      // Periodos de descanso a considerar
      const periodos: PeriodoTiempo[] = [];
      
      // Agregar descansos
      if (jornada.descansoMananaInicio) {
        periodos.push({
          inicio: jornada.descansoMananaInicio,
          fin: jornada.descansoMananaFin || null
        });
      }
      
      if (jornada.almuerzoInicio) {
        periodos.push({
          inicio: jornada.almuerzoInicio,
          fin: jornada.almuerzoFin || null
        });
      }
      
      if (jornada.descansoTardeInicio) {
        periodos.push({
          inicio: jornada.descansoTardeInicio,
          fin: jornada.descansoTardeFin || null
        });
      }
      
      // Calcular tiempo trabajado en milisegundos
      const tiempoMs = calcularTiempoTrabajadoMs(
        jornada.entrada,
        jornada.salida,
        periodos
      );
      
      // Convertir a horas
      return parseFloat((tiempoMs / (1000 * 60 * 60)).toFixed(2));
    } catch (error) {
      console.error('Error calculando horas trabajadas:', error);
      return 0;
    }
  }
}

// Exportar instancia singleton
export const tiempoLaboralService = new TiempoLaboralService();