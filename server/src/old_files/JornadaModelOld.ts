import { executeQuery } from '../config/database';
import * as ExcelJS from 'exceljs';

export interface JornadaLaboral {
  id: number;
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
  ubicacionEntradaLat?: number;
  ubicacionEntradaLng?: number;
  ubicacionEntradaAccuracy?: number;
  ubicacionSalidaLat?: number;
  ubicacionSalidaLng?: number;
  ubicacionSalidaAccuracy?: number;
  horasTrabajadas: number;
  autoCerrada: boolean;
  autoCerradaRazon?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

interface JornadaRow {
  id: number;
  usuario_id: number;
  fecha: string;
  entrada?: string;
  descanso_manana_inicio?: string;
  descanso_manana_fin?: string;
  almuerzo_inicio?: string;
  almuerzo_fin?: string;
  descanso_tarde_inicio?: string;
  descanso_tarde_fin?: string;
  salida?: string;
  ubicacion_entrada_lat?: number;
  ubicacion_entrada_lng?: number;
  ubicacion_entrada_accuracy?: number;
  ubicacion_salida_lat?: number;
  ubicacion_salida_lng?: number;
  ubicacion_salida_accuracy?: number;
  horas_trabajadas: number;
  auto_cerrada: boolean;
  auto_cerrada_razon?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface EstadisticasJornada {
  totalJornadas: number;
  horasPromedio: number;
  jornadasCompletas: number;
  jornadasIncompletas: number;
  jornadasAutoCerradas: number;
  puntualidad: {
    entradaPuntual: number;
    salidaPuntual: number;
  };
}

export interface ResumenAdmin {
  fecha: string;
  totalEmpleados: number;
  empleadosConEntrada: number;
  empleadosConSalida: number;
  jornadasCompletas: number;
  jornadasIncompletas: number;
  jornadasAutoCerradas: number;
  promedioHoras: number;
  entradaPromedio: string;
  salidaPromedio: string;
  jornadas: Array<{
    usuario: {
      id: number;
      nombre: string;
      apellido: string;
      documento: string;
      departamento: string;
      cargo: string;
    };
    jornada: JornadaLaboral;
  }>;
}

export class JornadaModel {
  
  /**
   * Obtener jornada actual del usuario (fecha actual)
   */
  static async obtenerJornadaActual(usuarioId: number): Promise<JornadaLaboral | null> {
    const query = `
      SELECT * FROM jornadas_laborales 
      WHERE usuario_id = ? AND fecha = CURDATE()
    `;
    
    const result = await executeQuery(query, [usuarioId]);
    
    if (result.length === 0) {
      return null;
    }
    
    return JornadaModel.mapRowToJornada(result[0] as JornadaRow);
  }

  /**
   * Iniciar nueva jornada laboral
   */
  static async iniciarJornada(
    usuarioId: number,
    latitud: number,
    longitud: number,
    accuracy: number,
    timestamp: Date = new Date()
  ): Promise<JornadaLaboral> {
    const fecha = timestamp.toISOString().split('T')[0];
    
    // Verificar que no exista jornada para hoy
    const existeJornada = await JornadaModel.obtenerJornadaActual(usuarioId);
    if (existeJornada) {
      throw new Error('Ya existe una jornada registrada para hoy');
    }

    const query = `
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada, 
        ubicacion_entrada_lat, ubicacion_entrada_lng, ubicacion_entrada_accuracy
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [
      usuarioId, fecha, timestamp, latitud, longitud, accuracy
    ]);
    
    // Retornar la jornada creada
    const jornada = await JornadaModel.obtenerJornadaActual(usuarioId);
    if (!jornada) {
      throw new Error('No se pudo crear la jornada');
    }
    return jornada;
  }

  /**
   * Registrar evento en jornada existente
   */
  static async registrarEvento(
    usuarioId: number,
    tipo: 'descanso_manana_inicio' | 'descanso_manana_fin' | 
          'almuerzo_inicio' | 'almuerzo_fin' | 
          'descanso_tarde_inicio' | 'descanso_tarde_fin' | 'salida',
    latitud: number,
    longitud: number,
    accuracy: number,
    observaciones?: string,
    timestamp: Date = new Date()
  ): Promise<JornadaLaboral> {
    
    // Obtener jornada actual
    const jornada = await JornadaModel.obtenerJornadaActual(usuarioId);
    if (!jornada) {
      throw new Error('No existe jornada iniciada para hoy');
    }

    // Validar secuencia de eventos
    await JornadaModel.validarSecuenciaEvento(jornada, tipo);

    // Construir query dinámicamente según el tipo
    let setClauses = [`${tipo} = ?`];
    let params = [timestamp];

    // Agregar ubicación para salida
    if (tipo === 'salida') {
      setClauses.push('ubicacion_salida_lat = ?', 'ubicacion_salida_lng = ?', 'ubicacion_salida_accuracy = ?');
      params.push(latitud, longitud, accuracy);
    }

    // Agregar observaciones si existen
    if (observaciones) {
      setClauses.push('observaciones = CONCAT(COALESCE(observaciones, ""), CASE WHEN observaciones IS NULL THEN "" ELSE "; " END, ?)');
      params.push(observaciones);
    }

    params.push(usuarioId);

    const query = `
      UPDATE jornadas_laborales 
      SET ${setClauses.join(', ')}
      WHERE usuario_id = ? AND fecha = CURDATE()
    `;
    
    await executeQuery(query, params);

    // Recalcular horas trabajadas
    await JornadaModel.recalcularHoras(jornada.id);
    
    // Retornar jornada actualizada
    return JornadaModel.obtenerJornadaActual(usuarioId)!;
  }

  /**
   * Obtener historial de jornadas
   */
  static async obtenerHistorial(
    usuarioId: number,
    fechaInicio?: string,
    fechaFin?: string,
    limite: number = 30
  ): Promise<JornadaLaboral[]> {
    let query = `
      SELECT * FROM jornadas_laborales 
      WHERE usuario_id = ?
    `;
    
    const params: any[] = [usuarioId];

    if (fechaInicio) {
      query += ' AND fecha >= ?';
      params.push(fechaInicio);
    }

    if (fechaFin) {
      query += ' AND fecha <= ?';
      params.push(fechaFin);
    }

    query += ' ORDER BY fecha DESC LIMIT ?';
    params.push(limite);

    const result = await executeQuery(query, params);
    
    return result.map((row: JornadaRow) => JornadaModel.mapRowToJornada(row));
  }

  /**
   * Obtener estadísticas de jornadas
   */
  static async obtenerEstadisticas(
    usuarioId: number,
    mes?: number,
    año?: number
  ): Promise<EstadisticasJornada> {
    const añoActual = año || new Date().getFullYear();
    const mesActual = mes || new Date().getMonth() + 1;

    const query = `
      SELECT 
        COUNT(*) as total_jornadas,
        AVG(horas_trabajadas) as horas_promedio,
        COUNT(CASE WHEN entrada IS NOT NULL AND salida IS NOT NULL THEN 1 END) as jornadas_completas,
        COUNT(CASE WHEN entrada IS NOT NULL AND salida IS NULL THEN 1 END) as jornadas_incompletas,
        COUNT(CASE WHEN auto_cerrada = TRUE THEN 1 END) as jornadas_auto_cerradas,
        COUNT(CASE WHEN TIME(entrada) <= '07:15:00' THEN 1 END) as entradas_puntuales,
        COUNT(CASE WHEN TIME(salida) >= '17:00:00' THEN 1 END) as salidas_puntuales
      FROM jornadas_laborales 
      WHERE usuario_id = ? 
        AND YEAR(fecha) = ? 
        AND MONTH(fecha) = ?
    `;

    const result = await executeQuery(query, [usuarioId, añoActual, mesActual]);
    const stats = result[0];

    return {
      totalJornadas: stats.total_jornadas || 0,
      horasPromedio: parseFloat(stats.horas_promedio) || 0,
      jornadasCompletas: stats.jornadas_completas || 0,
      jornadasIncompletas: stats.jornadas_incompletas || 0,
      jornadasAutoCerradas: stats.jornadas_auto_cerradas || 0,
      puntualidad: {
        entradaPuntual: ((stats.entradas_puntuales || 0) / Math.max(1, stats.total_jornadas)) * 100,
        salidaPuntual: ((stats.salidas_puntuales || 0) / Math.max(1, stats.total_jornadas)) * 100
      }
    };
  }

  /**
   * Forzar cierre de jornada (administradores)
   */
  static async forzarCierre(jornadaId: number, observaciones?: string): Promise<JornadaLaboral> {
    // Verificar que la jornada existe
    const query = `SELECT * FROM jornadas_laborales WHERE id = ?`;
    const result = await executeQuery(query, [jornadaId]);
    
    if (result.length === 0) {
      throw new Error('Jornada no encontrada');
    }

    const jornada = result[0];
    
    // Cerrar jornada si no está cerrada
    if (!jornada.salida) {
      const ahora = new Date();
      const updateQuery = `
        UPDATE jornadas_laborales 
        SET salida = ?, 
            auto_cerrada = TRUE,
            auto_cerrada_razon = ?,
            observaciones = CONCAT(COALESCE(observaciones, ''), 
                                  CASE WHEN observaciones IS NULL THEN '' ELSE '; ' END,
                                  'Cerrada forzosamente por administrador')
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, [
        ahora,
        observaciones || 'Cierre forzoso por administrador',
        jornadaId
      ]);

      // Recalcular horas
      await JornadaModel.recalcularHoras(jornadaId);
    }

    // Retornar jornada actualizada
    const updatedResult = await executeQuery(query, [jornadaId]);
    return JornadaModel.mapRowToJornada(updatedResult[0]);
  }

  /**
   * Obtener resumen para administradores
   */
  static async obtenerResumenAdmin(filtros: {
    fecha?: string;
    regionalId?: number;
    departamento?: string;
  }): Promise<ResumenAdmin> {
    const fecha = filtros.fecha || new Date().toISOString().split('T')[0];
    
    let query = `
      SELECT 
        j.*,
        u.nombre, u.apellido, u.documento, u.departamento, u.cargo
      FROM jornadas_laborales j
      RIGHT JOIN usuarios u ON j.usuario_id = u.id AND j.fecha = ?
      WHERE u.estado = 'activo'
    `;
    
    const params: any[] = [fecha];

    if (filtros.regionalId) {
      query += ' AND u.regional_id = ?';
      params.push(filtros.regionalId);
    }

    if (filtros.departamento) {
      query += ' AND u.departamento = ?';
      params.push(filtros.departamento);
    }

    query += ' ORDER BY u.apellido, u.nombre';

    const result = await executeQuery(query, params);

    // Procesar resultados
    const jornadas = result.map((row: any) => ({
      usuario: {
        id: row.id || row.usuario_id,
        nombre: row.nombre,
        apellido: row.apellido,
        documento: row.documento,
        departamento: row.departamento,
        cargo: row.cargo
      },
      jornada: row.id ? JornadaModel.mapRowToJornada(row) : null
    }));

    // Calcular estadísticas
    const jornadasConRegistro = jornadas.filter(j => j.jornada);
    const jornadasCompletas = jornadasConRegistro.filter(j => j.jornada?.entrada && j.jornada?.salida);
    const jornadasAutoCerradas = jornadasConRegistro.filter(j => j.jornada?.autoCerrada);

    return {
      fecha,
      totalEmpleados: jornadas.length,
      empleadosConEntrada: jornadasConRegistro.filter(j => j.jornada?.entrada).length,
      empleadosConSalida: jornadasConRegistro.filter(j => j.jornada?.salida).length,
      jornadasCompletas: jornadasCompletas.length,
      jornadasIncompletas: jornadasConRegistro.length - jornadasCompletas.length,
      jornadasAutoCerradas: jornadasAutoCerradas.length,
      promedioHoras: jornadasCompletas.reduce((acc, j) => acc + (j.jornada?.horasTrabajadas || 0), 0) / Math.max(1, jornadasCompletas.length),
      entradaPromedio: JornadaModel.calcularPromedioTiempo(jornadasConRegistro.map(j => j.jornada?.entrada).filter(Boolean)),
      salidaPromedio: JornadaModel.calcularPromedioTiempo(jornadasCompletas.map(j => j.jornada?.salida).filter(Boolean)),
      jornadas
    };
  }

  /**
   * Ejecutar auto-cierre de jornadas de 8+ horas
   */
  static async ejecutarAutoCierre(): Promise<{ jornadasCerradas: number; detalles: any[] }> {
    const query = `
      SELECT j.*, u.nombre, u.apellido, u.email
      FROM jornadas_laborales j
      JOIN usuarios u ON j.usuario_id = u.id
      WHERE j.fecha = CURDATE()
        AND j.entrada IS NOT NULL
        AND j.salida IS NULL
        AND j.auto_cerrada = FALSE
        AND TIMESTAMPDIFF(HOUR, j.entrada, NOW()) >= 8
    `;

    const jornadas = await executeQuery(query, []);
    const detalles = [];

    for (const jornada of jornadas) {
      // Calcular tiempo de cierre (entrada + 8 horas)
      const entrada = new Date(jornada.entrada);
      const cierreAutomatico = new Date(entrada.getTime() + (8 * 60 * 60 * 1000));

      const updateQuery = `
        UPDATE jornadas_laborales 
        SET salida = ?,
            auto_cerrada = TRUE,
            auto_cerrada_razon = 'Jornada cerrada automáticamente después de 8 horas'
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [cierreAutomatico, jornada.id]);
      await JornadaModel.recalcularHoras(jornada.id);

      detalles.push({
        usuarioId: jornada.usuario_id,
        nombre: `${jornada.nombre} ${jornada.apellido}`,
        email: jornada.email,
        entrada: jornada.entrada,
        salida: cierreAutomatico
      });
    }

    return {
      jornadasCerradas: jornadas.length,
      detalles
    };
  }

  /**
   * Generar reporte Excel
   */
  static async generarReporteExcel(filtros: {
    fechaInicio: string;
    fechaFin: string;
    usuarioId?: number;
    departamento?: string;
  }): Promise<Buffer> {
    let query = `
      SELECT 
        j.*,
        u.nombre, u.apellido, u.documento, u.departamento, u.cargo
      FROM jornadas_laborales j
      JOIN usuarios u ON j.usuario_id = u.id
      WHERE j.fecha BETWEEN ? AND ?
    `;
    
    const params: any[] = [filtros.fechaInicio, filtros.fechaFin];

    if (filtros.usuarioId) {
      query += ' AND j.usuario_id = ?';
      params.push(filtros.usuarioId);
    }

    if (filtros.departamento) {
      query += ' AND u.departamento = ?';
      params.push(filtros.departamento);
    }

    query += ' ORDER BY j.fecha DESC, u.apellido, u.nombre';

    const result = await executeQuery(query, params);

    // Crear libro Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Jornadas');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Documento', key: 'documento', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Departamento', key: 'departamento', width: 15 },
      { header: 'Cargo', key: 'cargo', width: 20 },
      { header: 'Entrada', key: 'entrada', width: 12 },
      { header: 'Almuerzo Inicio', key: 'almuerzo_inicio', width: 15 },
      { header: 'Almuerzo Fin', key: 'almuerzo_fin', width: 15 },
      { header: 'Salida', key: 'salida', width: 12 },
      { header: 'Horas Trabajadas', key: 'horas_trabajadas', width: 15 },
      { header: 'Auto Cerrada', key: 'auto_cerrada', width: 12 },
      { header: 'Observaciones', key: 'observaciones', width: 30 }
    ];

    // Agregar datos
    result.forEach((row: any) => {
      worksheet.addRow({
        fecha: row.fecha,
        documento: row.documento,
        nombre: row.nombre,
        apellido: row.apellido,
        departamento: row.departamento,
        cargo: row.cargo,
        entrada: row.entrada ? new Date(row.entrada).toLocaleTimeString() : '',
        almuerzo_inicio: row.almuerzo_inicio ? new Date(row.almuerzo_inicio).toLocaleTimeString() : '',
        almuerzo_fin: row.almuerzo_fin ? new Date(row.almuerzo_fin).toLocaleTimeString() : '',
        salida: row.salida ? new Date(row.salida).toLocaleTimeString() : '',
        horas_trabajadas: row.horas_trabajadas,
        auto_cerrada: row.auto_cerrada ? 'Sí' : 'No',
        observaciones: row.observaciones || ''
      });
    });

    // Estilo de encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };
    });

    // Generar buffer
    return await workbook.xlsx.writeBuffer() as Buffer;
  }

  /**
   * Validar secuencia de eventos
   */
  private static async validarSecuenciaEvento(
    jornada: JornadaLaboral, 
    tipo: string
  ): Promise<void> {
    switch (tipo) {
      case 'almuerzo_inicio':
        if (!jornada.entrada) {
          throw new Error('Debes registrar entrada primero');
        }
        if (jornada.almuerzoInicio) {
          throw new Error('Ya iniciaste el almuerzo');
        }
        break;

      case 'almuerzo_fin':
        if (!jornada.almuerzoInicio) {
          throw new Error('Debes iniciar el almuerzo primero');
        }
        if (jornada.almuerzoFin) {
          throw new Error('Ya finalizaste el almuerzo');
        }
        // Validar duración máxima (1 hora)
        const duracionAlmuerzo = new Date().getTime() - new Date(jornada.almuerzoInicio).getTime();
        if (duracionAlmuerzo > 60 * 60 * 1000) {
          throw new Error('El almuerzo no puede exceder 60 minutos');
        }
        break;

      case 'salida':
        if (!jornada.entrada) {
          throw new Error('Debes registrar entrada primero');
        }
        if (jornada.salida) {
          throw new Error('Ya registraste la salida');
        }
        break;

      // Validaciones similares para descansos...
    }
  }

  /**
   * Recalcular horas trabajadas
   */
  private static async recalcularHoras(jornadaId: number): Promise<void> {
    const query = `CALL CalcularHorasTrabajadas(?)`;
    await executeQuery(query, [jornadaId]);
  }

  /**
   * Mapear fila de BD a objeto JornadaLaboral
   */
  private static mapRowToJornada(row: JornadaRow): JornadaLaboral {
    return {
      id: row.id,
      usuarioId: row.usuario_id,
      fecha: row.fecha,
      entrada: row.entrada,
      descansoMananaInicio: row.descanso_manana_inicio,
      descansoMananaFin: row.descanso_manana_fin,
      almuerzoInicio: row.almuerzo_inicio,
      almuerzoFin: row.almuerzo_fin,
      descansoTardeInicio: row.descanso_tarde_inicio,
      descansoTardeFin: row.descanso_tarde_fin,
      salida: row.salida,
      ubicacionEntradaLat: row.ubicacion_entrada_lat,
      ubicacionEntradaLng: row.ubicacion_entrada_lng,
      ubicacionEntradaAccuracy: row.ubicacion_entrada_accuracy,
      ubicacionSalidaLat: row.ubicacion_salida_lat,
      ubicacionSalidaLng: row.ubicacion_salida_lng,
      ubicacionSalidaAccuracy: row.ubicacion_salida_accuracy,
      horasTrabajadas: row.horas_trabajadas,
      autoCerrada: row.auto_cerrada,
      autoCerradaRazon: row.auto_cerrada_razon,
      observaciones: row.observaciones,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Calcular promedio de tiempos
   */
  private static calcularPromedioTiempo(tiempos: string[]): string {
    if (tiempos.length === 0) return '00:00:00';
    
    const totalMinutos = tiempos.reduce((acc, tiempo) => {
      const [horas, minutos] = tiempo.substring(11, 16).split(':').map(Number);
      return acc + (horas * 60) + minutos;
    }, 0);

    const promedioMinutos = Math.round(totalMinutos / tiempos.length);
    const horas = Math.floor(promedioMinutos / 60);
    const minutos = promedioMinutos % 60;

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`;
  }
}