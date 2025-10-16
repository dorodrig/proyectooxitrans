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
  horas_calculadas?: number; // Horas ya calculadas desde la base de datos
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
    const observaciones: string[] = [];

    // Validación de horas
    const validarHoras = (valor: number): number => {
      if (isNaN(valor) || valor < 0 || valor === null || valor === undefined) return 0;
      return valor;
    };

    let totalHorasTrabajadas: number;
    let horasDetalladas: DesglosePorHoras;

    // Si tenemos horas calculadas desde la BD, las usamos; sino calculamos desde entrada/salida
    if (jornada.horas_calculadas !== undefined && jornada.horas_calculadas > 0) {
      totalHorasTrabajadas = validarHoras(jornada.horas_calculadas);
      
      // Para horas precalculadas, asumimos que son diurnas ordinarias por defecto
      horasDetalladas = {
        ordinarias_diurnas: Math.min(totalHorasTrabajadas, this.JORNADA_DIARIA_MAXIMA),
        ordinarias_nocturnas: 0,
        extras_diurnas: Math.max(0, totalHorasTrabajadas - this.JORNADA_DIARIA_MAXIMA),
        extras_nocturnas: 0
      };
      
      observaciones.push('✅ Usando horas calculadas desde base de datos');
    } else {
      // Cálculo tradicional desde entrada/salida
      horasDetalladas = this.analizarHoras(jornada.entrada, jornada.salida, jornada.descanso_minutos || 0);
      
      totalHorasTrabajadas = validarHoras(horasDetalladas.ordinarias_diurnas) + 
                            validarHoras(horasDetalladas.ordinarias_nocturnas) + 
                            validarHoras(horasDetalladas.extras_diurnas) + 
                            validarHoras(horasDetalladas.extras_nocturnas);
      
      observaciones.push('📊 Calculado desde horarios de entrada/salida');
    }

    // Las horas ordinarias son todas las horas trabajadas hasta el límite de 8 horas
    const horasOrdinarias = Math.min(totalHorasTrabajadas, this.JORNADA_DIARIA_MAXIMA);
    
    // Las horas extras son las que exceden las 8 horas diarias
    const horasExtrasTotal = Math.max(0, totalHorasTrabajadas - this.JORNADA_DIARIA_MAXIMA);

    // Las horas extras pueden ser diurnas o nocturnas - sumamos todas las extras
    const horasExtrasDiurnas = validarHoras(horasDetalladas.extras_diurnas);
    const horasExtrasNocturnas = validarHoras(horasDetalladas.extras_nocturnas);

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

    // Debug temporal - esto se puede quitar después
    console.log(`[DEBUG] ${jornada.fecha}: Trabajadas=${totalHorasTrabajadas}, Ordinarias=${horasOrdinarias}, ExtrasDiurnas=${horasExtrasDiurnas}, ExtrasNocturnas=${horasExtrasNocturnas}`);
    
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
    
    // Validar que los cálculos tengan valores válidos antes de sumar
    const totales = calculos.reduce((acc, calculo) => {
      // Validar horas ordinarias
      const horasOrdinarias = (calculo.horas_ordinarias && !isNaN(calculo.horas_ordinarias) && calculo.horas_ordinarias >= 0) ? 
        calculo.horas_ordinarias : 0;
      
      // Validar horas extras diurnas  
      const horasExtrasDiurnas = (calculo.horas_extras_diurnas && !isNaN(calculo.horas_extras_diurnas) && calculo.horas_extras_diurnas >= 0) ? 
        calculo.horas_extras_diurnas : 0;
        
      // Validar horas extras nocturnas
      const horasExtrasNocturnas = (calculo.horas_extras_nocturnas && !isNaN(calculo.horas_extras_nocturnas) && calculo.horas_extras_nocturnas >= 0) ? 
        calculo.horas_extras_nocturnas : 0;
      
      return {
        horas_ordinarias: acc.horas_ordinarias + horasOrdinarias,
        horas_extras_diurnas: acc.horas_extras_diurnas + horasExtrasDiurnas,
        horas_extras_nocturnas: acc.horas_extras_nocturnas + horasExtrasNocturnas,
        valor_ordinarias: acc.valor_ordinarias + (calculo.valor_hora_ordinaria ? horasOrdinarias * calculo.valor_hora_ordinaria : 0),
        valor_extras: acc.valor_extras + (calculo.valor_extras_diurnas || 0) + (calculo.valor_extras_nocturnas || 0),
        total_periodo: acc.total_periodo + (calculo.total_dia || 0)
      };
    }, {
      horas_ordinarias: 0,
      horas_extras_diurnas: 0,
      horas_extras_nocturnas: 0,
      valor_ordinarias: 0,
      valor_extras: 0,
      total_periodo: 0
    });

    const totalHorasExtras = totales.horas_extras_diurnas + totales.horas_extras_nocturnas;
    const diasConExtras = calculos.filter(c => c.horas_extras_diurnas + c.horas_extras_nocturnas > 0).length;
    
    // Debug temporal - esto se puede quitar después
    console.log('[DEBUG RESUMEN] Totales:', totales);
    console.log(`[DEBUG RESUMEN] Horas ordinarias total: ${totales.horas_ordinarias}, Horas extras total: ${totalHorasExtras}`);
    
    // Calcular promedio de horas dia con validaciones
    let promedioHorasDia = 0;
    if (calculos.length > 0) {
      const horasValidas = calculos.filter(c => 
        c.horas_trabajadas !== undefined && 
        c.horas_trabajadas !== null && 
        !isNaN(c.horas_trabajadas) && 
        c.horas_trabajadas >= 0
      );
      
      if (horasValidas.length > 0) {
        const sumaHoras = horasValidas.reduce((sum, c) => sum + c.horas_trabajadas, 0);
        promedioHorasDia = Math.round((sumaHoras / horasValidas.length) * 100) / 100;
      }
    }

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
      promedio_horas_dia: promedioHorasDia,
      dias_con_extras: diasConExtras
    };
  }

  /**
   * Formatea horas decimales a HH:MM
   */
  static formatearHoras(horas: number | undefined | null): string {
    // Validar entrada y prevenir NaN
    if (horas === undefined || horas === null || isNaN(horas) || horas < 0) {
      return '00:00';
    }
    
    const horasValidas = Math.max(0, horas);
    const h = Math.floor(horasValidas);
    const m = Math.round((horasValidas - h) * 60);
    
    // Validar que los valores calculados sean correctos
    if (isNaN(h) || isNaN(m)) {
      return '00:00';
    }
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Formatea valores monetarios
   */
  static formatearValor(valor: number | undefined | null): string {
    // Validar entrada y prevenir NaN
    if (valor === undefined || valor === null || isNaN(valor) || valor < 0) {
      return '$0';
    }
    
    const valorValido = Math.max(0, valor);
    
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valorValido);
    } catch (error) {
      console.error('Error formateando valor:', error, 'Valor:', valor);
      return '$0';
    }
  }
}