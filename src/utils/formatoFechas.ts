// ====================================
// 📅 UTILIDADES DE FORMATO DE FECHAS
// Funciones para formatear fechas al estándar colombiano
// ====================================

/**
 * Formatea una fecha ISO al formato colombiano dd/mm/yyyy hh:mm:ss
 * @param fechaISO - Fecha en formato ISO string
 * @returns Fecha formateada en formato colombiano con hora
 */
export const formatearFechaColombiana = (fechaISO: string | null): string => {
  if (!fechaISO) return 'No registrada';
  
  try {
    const fecha = new Date(fechaISO);
    
    // Verificar que la fecha sea válida
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }
    
    // Configurar para timezone colombiano
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Bogota',
      hour12: false
    };
    
    const fechaFormateada = fecha.toLocaleString('es-CO', opcionesFecha);
    
    // Convertir formato de dd/mm/yyyy, hh:mm:ss a dd/mm/yyyy hh:mm:ss
    return fechaFormateada.replace(',', '');
    
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error en fecha';
  }
};

/**
 * Formatea una fecha ISO al formato colombiano dd/mm/yyyy (sin hora)
 * @param fechaISO - Fecha en formato ISO string
 * @returns Fecha formateada en formato colombiano sin hora
 */
export const formatearSoloFecha = (fechaISO: string | null): string => {
  if (!fechaISO) return 'No registrada';
  
  try {
    const fecha = new Date(fechaISO);
    
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }
    
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Bogota'
    };
    
    return fecha.toLocaleDateString('es-CO', opcionesFecha);
    
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error en fecha';
  }
};

/**
 * Formatea solo la hora de una fecha ISO al formato hh:mm:ss
 * @param fechaISO - Fecha en formato ISO string
 * @returns Hora formateada en formato hh:mm:ss
 */
export const formatearSoloHora = (fechaISO: string | null): string => {
  if (!fechaISO) return 'No registrada';
  
  try {
    const fecha = new Date(fechaISO);
    
    if (isNaN(fecha.getTime())) {
      return 'Hora inválida';
    }
    
    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Bogota',
      hour12: false
    };
    
    return fecha.toLocaleTimeString('es-CO', opcionesHora);
    
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return 'Error en hora';
  }
};

/**
 * Formatea una fecha para mostrar en el formato corto: dd/MMM
 * @param fechaISO - Fecha en formato ISO string
 * @returns Fecha en formato corto dd/MMM
 */
export const formatearFechaCorta = (fechaISO: string | null): string => {
  if (!fechaISO) return 'No fecha';
  
  try {
    const fecha = new Date(fechaISO + 'T00:00:00');
    
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }
    
    return fecha.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      timeZone: 'America/Bogota'
    });
    
  } catch (error) {
    console.error('Error al formatear fecha corta:', error);
    return 'Error';
  }
};

/**
 * Formatea una fecha para mostrar el día de la semana
 * @param fechaISO - Fecha en formato ISO string
 * @returns Día de la semana en español
 */
export const formatearDiaSemana = (fechaISO: string | null): string => {
  if (!fechaISO) return 'N/A';
  
  try {
    const fecha = new Date(fechaISO + 'T00:00:00');
    
    if (isNaN(fecha.getTime())) {
      return 'Día inválido';
    }
    
    return fecha.toLocaleDateString('es-CO', {
      weekday: 'short',
      timeZone: 'America/Bogota'
    });
    
  } catch (error) {
    console.error('Error al formatear día de semana:', error);
    return 'Error';
  }
};