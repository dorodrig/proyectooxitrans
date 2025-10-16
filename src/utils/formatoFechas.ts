// ====================================
// 📅 UTILIDADES DE FORMATO DE FECHAS
// Funciones para formatear fechas al estándar colombiano
// ====================================

/**
 * Formatea una fecha ISO al formato colombiano dd/mm/yyyy hh:mm:ss
 * @param fechaISO - Fecha en formato ISO string
 * @returns Fecha formateada en formato colombiano con hora
 */
export const formatearFechaColombiana = (fechaISO: string | null | undefined): string => {
  if (!fechaISO || fechaISO === 'null' || fechaISO === 'undefined') {
    return 'No registrada';
  }
  
  try {
    // Limpiar la fecha de formatos problemáticos
    let fechaLimpia = fechaISO.toString().trim();
    
    // Si es solo fecha (yyyy-mm-dd), agregar hora
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaLimpia)) {
      fechaLimpia += 'T00:00:00';
    }
    
    // Si tiene formato ISO incompleto, completar
    if (fechaLimpia.includes('T') && !fechaLimpia.includes('Z') && !fechaLimpia.includes('+')) {
      fechaLimpia += 'Z';
    }
    
    const fecha = new Date(fechaLimpia);
    
    // Verificar que la fecha sea válida
    if (isNaN(fecha.getTime())) {
      console.warn('Fecha inválida detectada:', fechaISO);
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
    console.error('Error al formatear fecha:', error, 'Input:', fechaISO);
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
 * Formatea una fecha para mostrar en el formato corto: dd MMM
 * @param fechaISO - Fecha en formato ISO string (YYYY-MM-DD)
 * @returns Fecha en formato corto dd MMM
 */
export const formatearFechaCorta = (fechaISO: string | null): string => {
  if (!fechaISO) return 'No fecha';
  
  try {
    // Extraer solo la parte de fecha si viene con hora
    const soloFecha = fechaISO.includes('T') ? fechaISO.split('T')[0] : fechaISO;
    
    // Validar formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
      console.error('Formato de fecha inválido:', fechaISO);
      return 'Fecha inválida';
    }
    
    // Crear fecha sin problemas de zona horaria
    const [year, month, day] = soloFecha.split('-').map(Number);
    const fecha = new Date(year, month - 1, day); // month es 0-indexado
    
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }
    
    return fecha.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short'
    });
    
  } catch (error) {
    console.error('Error al formatear fecha corta:', error, fechaISO);
    return 'Error';
  }
};

/**
 * Formatea una fecha para mostrar el día de la semana
 * @param fechaISO - Fecha en formato ISO string (YYYY-MM-DD)
 * @returns Día de la semana en español
 */
export const formatearDiaSemana = (fechaISO: string | null): string => {
  if (!fechaISO) return 'N/A';
  
  try {
    // Extraer solo la parte de fecha si viene con hora
    const soloFecha = fechaISO.includes('T') ? fechaISO.split('T')[0] : fechaISO;
    
    // Validar formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
      console.error('Formato de fecha inválido para día semana:', fechaISO);
      return 'N/A';
    }
    
    // Crear fecha sin problemas de zona horaria
    const [year, month, day] = soloFecha.split('-').map(Number);
    const fecha = new Date(year, month - 1, day); // month es 0-indexado
    
    if (isNaN(fecha.getTime())) {
      return 'Día inválido';
    }
    
    return fecha.toLocaleDateString('es-CO', {
      weekday: 'short'
    });
    
  } catch (error) {
    console.error('Error al formatear día de semana:', error);
    return 'Error';
  }
};