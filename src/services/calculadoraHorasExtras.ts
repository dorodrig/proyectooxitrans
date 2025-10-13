// ====================================
// 📊 CALCULADORA DE HORAS EXTRAS - COLOMBIA
// Servicio para cálculo según Código Sustantivo del Trabajo
// ====================================

export interface JornadaDiaria {
  fecha: string;
  entrada: string;
  salida: string;
  descanso_minutos?: number;
  observaciones?: string;
}

export interface CalculoDetallado {
  fecha: string;
  entrada: string;
  salida: string;
  horas_trabajadas: number;
  horas_ordinarias: number;
  horas_extras_diurnas: number;
  horas_extras_nocturnas: number;
  recargo_diurno: number;    // 25%
  recargo_nocturno: number;  // 75%
  valor_hora_ordinaria?: number;
  valor_extras_diurnas?: number;
  valor_extras_nocturnas?: number;
  total_dia?: number;
  desglose: DesglosePorHoras;
  observaciones?: string[];
}

export interface DesglosePorHoras {
  ordinarias_diurnas: number;    // 6:00 AM - 10:00 PM (dentro de jornada)
  ordinarias_nocturnas: number;  // 10:00 PM - 6:00 AM (dentro de jornada)
  extras_diurnas: number;        // 6:00 AM - 10:00 PM (fuera de jornada)
  extras_nocturnas: number;      // 10:00 PM - 6:00 AM (fuera de jornada)
}

export interface ResumenPeriodo {
  fecha_inicio: string;
  fecha_fin: string;
  total_dias_laborados: number;
  total_horas_ordinarias: number;
  total_horas_extras: number;
  total_horas_extras_diurnas: number;
  total_horas_extras_nocturnas: number;
  valor_total_ordinarias?: number;
  valor_total_extras?: number;
  valor_total_periodo?: number;
  promedio_horas_dia: number;
  dias_con_extras: number;
}

/**
 * Calculadora de horas extras según legislación colombiana
 * Código Sustantivo del Trabajo - Artículos 159-164
 */
export class CalculadoraHorasExtras {
  
  // Configuración según legislación colombiana
  private static readonly JORNADA_DIARIA_MAXIMA = 8; // 8 horas
  private static readonly HORA_INICIO_DIURNA = 6;    // 6:00 AM
  private static readonly HORA_FIN_DIURNA = 22;      // 10:00 PM
  private static readonly RECARGO_DIURNO = 0.25;     // 25%
  private static readonly RECARGO_NOCTURNO = 0.75;   // 75%

  /**
   * Calcula horas extras para un conjunto de jornadas
   */
  static calcularPeriodo(
    jornadas: JornadaDiaria[], 
    valorHoraOrdinaria?: number
  ): { calculos: CalculoDetallado[], resumen: ResumenPeriodo } {
    
    const calculosDetallados = jornadas.map(jornada => 
      this.calcularJornada(jornada, valorHoraOrdinaria)
    );

    const resumen = this.generarResumen(calculosDetallados, jornadas);

    return { calculos: calculosDetallados, resumen };
  }

  /**
   * Calcula horas extras para una jornada específica
   */
  static calcularJornada(jornada: JornadaDiaria, valorHoraOrdinaria?: number): CalculoDetallado {
    const horasDetalladas = this.analizarHoras(jornada.entrada, jornada.salida, jornada.descanso_minutos || 0);
    const observaciones: string[] = [];

    // Calcular horas ordinarias (máximo 8 horas)
    const totalHorasTrabajadas = horasDetalladas.ordinarias_diurnas + horasDetalladas.ordinarias_nocturnas + 
                                horasDetalladas.extras_diurnas + horasDetalladas.extras_nocturnas;

    const horasOrdinarias = Math.min(totalHorasTrabajadas, this.JORNADA_DIARIA_MAXIMA);
    const horasExtrasTotal = Math.max(0, totalHorasTrabajadas - this.JORNADA_DIARIA_MAXIMA);

    // Las horas extras pueden ser diurnas o nocturnas
    const horasExtrasDiurnas = horasDetalladas.extras_diurnas;
    const horasExtrasNocturnas = horasDetalladas.extras_nocturnas;

    // Calcular valores monetarios si se proporciona tarifa
    let valorExtrasDiurnas, valorExtrasNocturnas, totalDia;
    if (valorHoraOrdinaria) {
      const valorHoraDiurnaExtra = valorHoraOrdinaria * (1 + this.RECARGO_DIURNO);
      const valorHoraNocturnaExtra = valorHoraOrdinaria * (1 + this.RECARGO_NOCTURNO);
      
      valorExtrasDiurnas = horasExtrasDiurnas * valorHoraDiurnaExtra;
      valorExtrasNocturnas = horasExtrasNocturnas * valorHoraNocturnaExtra;
      
      const valorOrdinarias = horasOrdinarias * valorHoraOrdinaria;
      totalDia = valorOrdinarias + valorExtrasDiurnas + valorExtrasNocturnas;
    }

    // Generar observaciones
    if (totalHorasTrabajadas > 10) {
      observaciones.push('⚠️ Jornada excesiva (>10 horas). Verificar cumplimiento legal.');
    }
    if (horasExtrasTotal > 4) {
      observaciones.push('⚠️ Horas extras exceden límite recomendado (4h/día).');
    }
    if (horasDetalladas.ordinarias_nocturnas > 0) {
      observaciones.push('🌙 Incluye trabajo nocturno ordinario.');
    }

    return {
      fecha: jornada.fecha,
      entrada: jornada.entrada,
      salida: jornada.salida,
      horas_trabajadas: totalHorasTrabajadas,
      horas_ordinarias: horasOrdinarias,
      horas_extras_diurnas: horasExtrasDiurnas,
      horas_extras_nocturnas: horasExtrasNocturnas,
      recargo_diurno: this.RECARGO_DIURNO,
      recargo_nocturno: this.RECARGO_NOCTURNO,
      valor_hora_ordinaria: valorHoraOrdinaria,
      valor_extras_diurnas: valorExtrasDiurnas,
      valor_extras_nocturnas: valorExtrasNocturnas,
      total_dia: totalDia,
      desglose: horasDetalladas,
      observaciones
    };
  }

  /**
   * Analiza las horas trabajadas clasificándolas por tipo
   */
  private static analizarHoras(entrada: string, salida: string, descansoMinutos: number): DesglosePorHoras {
    const inicioTrabajo = this.parseHora(entrada);
    const finTrabajo = this.parseHora(salida);
    
    // Manejar jornadas que cruzan medianoche
    let tiempoTotal = finTrabajo - inicioTrabajo;
    if (tiempoTotal < 0) {
      tiempoTotal += 24; // Agregar 24 horas si cruza medianoche
    }

    // Descontar tiempo de descanso del total

    // Determinar distribución por horarios
    const resultado: DesglosePorHoras = {
      ordinarias_diurnas: 0,
      ordinarias_nocturnas: 0,
      extras_diurnas: 0,
      extras_nocturnas: 0
    };

    // Calcular horas en cada segmento temporal
    const segmentos = this.dividirEnSegmentos(inicioTrabajo, finTrabajo, descansoMinutos);
    
    let horasAcumuladas = 0;
    
    segmentos.forEach(segmento => {
      const esHorarioDiurno = this.esDiurno(segmento.inicio, segmento.fin);
      const horasSegmento = segmento.horas;
      
      // Las primeras 8 horas son ordinarias
      if (horasAcumuladas < this.JORNADA_DIARIA_MAXIMA) {
        const horasOrdinariasSegmento = Math.min(horasSegmento, this.JORNADA_DIARIA_MAXIMA - horasAcumuladas);
        
        if (esHorarioDiurno) {
          resultado.ordinarias_diurnas += horasOrdinariasSegmento;
        } else {
          resultado.ordinarias_nocturnas += horasOrdinariasSegmento;
        }
        
        horasAcumuladas += horasOrdinariasSegmento;
        
        // Si quedan horas después de las 8, son extras
        const horasExtrasSegmento = horasSegmento - horasOrdinariasSegmento;
        if (horasExtrasSegmento > 0) {
          if (esHorarioDiurno) {
            resultado.extras_diurnas += horasExtrasSegmento;
          } else {
            resultado.extras_nocturnas += horasExtrasSegmento;
          }
        }
      } else {
        // Todas las horas son extras
        if (esHorarioDiurno) {
          resultado.extras_diurnas += horasSegmento;
        } else {
          resultado.extras_nocturnas += horasSegmento;
        }
      }
    });

    return resultado;
  }

  /**
   * Determina si un horario es diurno
   */
  private static esDiurno(inicioHora: number, finHora: number): boolean {
    // Simplificación: considera diurno si la mayoría del tiempo está en horario diurno
    const puntoMedio = (inicioHora + finHora) / 2;
    return puntoMedio >= this.HORA_INICIO_DIURNA && puntoMedio < this.HORA_FIN_DIURNA;
  }

  /**
   * Divide la jornada en segmentos temporales
   */
  private static dividirEnSegmentos(inicio: number, fin: number, descansoMinutos: number) {
    // Implementación simplificada - en producción sería más compleja
    const duracionTotal = fin > inicio ? fin - inicio : (24 - inicio) + fin;
    const tiempoTrabajo = duracionTotal - (descansoMinutos / 60);

    return [{
      inicio,
      fin,
      horas: tiempoTrabajo
    }];
  }

  /**
   * Convierte hora string (HH:MM) a número decimal
   */
  private static parseHora(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas + (minutos / 60);
  }

  /**
   * Genera resumen del período
   */
  private static generarResumen(calculos: CalculoDetallado[], jornadas: JornadaDiaria[]): ResumenPeriodo {
    const fechas = jornadas.map(j => j.fecha).sort();
    
    const totales = calculos.reduce((acc, calculo) => ({
      horas_ordinarias: acc.horas_ordinarias + calculo.horas_ordinarias,
      horas_extras_diurnas: acc.horas_extras_diurnas + calculo.horas_extras_diurnas,
      horas_extras_nocturnas: acc.horas_extras_nocturnas + calculo.horas_extras_nocturnas,
      valor_ordinarias: acc.valor_ordinarias + (calculo.valor_hora_ordinaria ? calculo.horas_ordinarias * calculo.valor_hora_ordinaria : 0),
      valor_extras: acc.valor_extras + (calculo.valor_extras_diurnas || 0) + (calculo.valor_extras_nocturnas || 0),
      total_periodo: acc.total_periodo + (calculo.total_dia || 0)
    }), {
      horas_ordinarias: 0,
      horas_extras_diurnas: 0,
      horas_extras_nocturnas: 0,
      valor_ordinarias: 0,
      valor_extras: 0,
      total_periodo: 0
    });

    const totalHorasExtras = totales.horas_extras_diurnas + totales.horas_extras_nocturnas;
    const diasConExtras = calculos.filter(c => c.horas_extras_diurnas + c.horas_extras_nocturnas > 0).length;
    const promedioHorasDia = calculos.reduce((sum, c) => sum + c.horas_trabajadas, 0) / calculos.length;

    return {
      fecha_inicio: fechas[0],
      fecha_fin: fechas[fechas.length - 1],
      total_dias_laborados: calculos.length,
      total_horas_ordinarias: totales.horas_ordinarias,
      total_horas_extras: totalHorasExtras,
      total_horas_extras_diurnas: totales.horas_extras_diurnas,
      total_horas_extras_nocturnas: totales.horas_extras_nocturnas,
      valor_total_ordinarias: totales.valor_ordinarias > 0 ? totales.valor_ordinarias : undefined,
      valor_total_extras: totales.valor_extras > 0 ? totales.valor_extras : undefined,
      valor_total_periodo: totales.total_periodo > 0 ? totales.total_periodo : undefined,
      promedio_horas_dia: Math.round(promedioHorasDia * 100) / 100,
      dias_con_extras: diasConExtras
    };
  }

  /**
   * Formatea horas decimales a HH:MM
   */
  static formatearHoras(horas: number): string {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Formatea valores monetarios
   */
  static formatearValor(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }
}