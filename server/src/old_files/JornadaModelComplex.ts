import { executeQuery } from '../database';
import { RowDataPacket } from 'mysql2';

export interface JornadaLaboral {
  id: number;
  usuarioId: number;
  fecha: string;
  entrada?: string;
  almuerzoInicio?: string;
  almuerzoFin?: string;
  descansoMananaInicio?: string;
  descansoMananaFin?: string;
  descansoTardeInicio?: string;
  descansoTardeFin?: string;
  salida?: string;
  horasTrabajadas: number;
  horasExtras: number;
  autoCerrada: boolean;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JornadaRow extends RowDataPacket {
  id: number;
  usuario_id: number;
  fecha: string;
  entrada?: string;
  almuerzo_inicio?: string;
  almuerzo_fin?: string;
  descanso_manana_inicio?: string;
  descanso_manana_fin?: string;
  descanso_tarde_inicio?: string;
  descanso_tarde_fin?: string;
  salida?: string;
  horas_trabajadas: number;
  horas_extras: number;
  auto_cerrada: boolean;
  observaciones?: string;
  created_at: Date;
  updated_at: Date;
}

export class JornadaModel {
  /**
   * Obtener jornada actual del usuario
   */
  static async obtenerJornadaActual(usuarioId: number): Promise<JornadaLaboral | null> {
    const query = `
      SELECT * FROM jornadas_laborales 
      WHERE usuario_id = ? AND fecha = CURDATE()
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await executeQuery(query, [usuarioId]) as JornadaRow[];
    
    if (result.length === 0) {
      return null;
    }
    
    return JornadaModel.mapRowToJornada(result[0]);
  }

  /**
   * Iniciar nueva jornada
   */
  static async iniciarJornada(
    usuarioId: number,
    timestamp: string,
    latitud: number,
    longitud: number,
    accuracy: number
  ): Promise<JornadaLaboral> {
    const fecha = new Date().toISOString().split('T')[0];
    
    const query = `
      INSERT INTO jornadas_laborales 
      (usuario_id, fecha, entrada, latitud_entrada, longitud_entrada, accuracy_entrada)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [
      usuarioId, fecha, timestamp, latitud, longitud, accuracy
    ]);
    
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
    tipo: string,
    timestamp: string,
    latitud?: number,
    longitud?: number,
    accuracy?: number,
    observaciones?: string
  ): Promise<JornadaLaboral> {
    const setClauses = [`${tipo} = ?`];
    const params: (string | number)[] = [timestamp];
    
    if (latitud !== undefined && longitud !== undefined && accuracy !== undefined) {
      setClauses.push(`latitud_${tipo} = ?`, `longitud_${tipo} = ?`, `accuracy_${tipo} = ?`);
      params.push(latitud, longitud, accuracy);
    }
    
    if (observaciones) {
      setClauses.push('observaciones = ?');
      params.push(observaciones);
    }
    
    params.push(usuarioId);
    
    const query = `
      UPDATE jornadas_laborales 
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE usuario_id = ? AND fecha = CURDATE()
    `;
    
    await executeQuery(query, params);
    
    const jornada = await JornadaModel.obtenerJornadaActual(usuarioId);
    if (!jornada) {
      throw new Error('No se pudo actualizar la jornada');
    }
    return jornada;
  }

  /**
   * Obtener jornadas por rango de fechas
   */
  static async obtenerJornadasPorFecha(
    usuarioId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<JornadaLaboral[]> {
    let query = `
      SELECT * FROM jornadas_laborales 
      WHERE usuario_id = ?
    `;
    
    const params: (string | number)[] = [usuarioId];
    
    if (fechaInicio) {
      query += ' AND fecha >= ?';
      params.push(fechaInicio);
    }
    
    if (fechaFin) {
      query += ' AND fecha <= ?';
      params.push(fechaFin);
    }
    
    query += ' ORDER BY fecha DESC';
    
    const result = await executeQuery(query, params) as JornadaRow[];
    return result.map(row => JornadaModel.mapRowToJornada(row));
  }

  /**
   * Forzar cierre de jornada
   */
  static async forzarCierre(
    usuarioId: number,
    observaciones: string
  ): Promise<JornadaLaboral> {
    const timestamp = new Date().toISOString();
    
    const query = `
      UPDATE jornadas_laborales 
      SET salida = ?, observaciones = CONCAT(COALESCE(observaciones, ''), '. Cierre forzado: ', ?),
          auto_cerrada = true, updated_at = NOW()
      WHERE usuario_id = ? AND fecha = CURDATE() AND salida IS NULL
    `;
    
    await executeQuery(query, [timestamp, observaciones, usuarioId]);
    
    const jornada = await JornadaModel.obtenerJornadaActual(usuarioId);
    if (!jornada) {
      throw new Error('No se pudo cerrar la jornada');
    }
    return jornada;
  }

  /**
   * Mapear fila de base de datos a objeto JornadaLaboral
   */
  private static mapRowToJornada(row: JornadaRow): JornadaLaboral {
    return {
      id: row.id,
      usuarioId: row.usuario_id,
      fecha: row.fecha,
      entrada: row.entrada,
      almuerzoInicio: row.almuerzo_inicio,
      almuerzoFin: row.almuerzo_fin,
      descansoMananaInicio: row.descanso_manana_inicio,
      descansoMananaFin: row.descanso_manana_fin,
      descansoTardeInicio: row.descanso_tarde_inicio,
      descansoTardeFin: row.descanso_tarde_fin,
      salida: row.salida,
      horasTrabajadas: row.horas_trabajadas || 0,
      horasExtras: row.horas_extras || 0,
      autoCerrada: row.auto_cerrada || false,
      observaciones: row.observaciones,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Ejecutar auto-cierre de jornadas
   */
  static async ejecutarAutoCierre(): Promise<{ jornadasCerradas: number; detalles: Array<{usuarioId: number, nombre: string, email: string}> }> {
    const query = `
      SELECT jl.*, u.nombre, u.apellido, u.email
      FROM jornadas_laborales jl
      JOIN usuarios u ON jl.usuario_id = u.id
      WHERE jl.fecha = CURDATE() 
        AND jl.entrada IS NOT NULL 
        AND jl.salida IS NULL
        AND TIMESTAMPDIFF(HOUR, jl.entrada, NOW()) >= 8
    `;
    
    const result = await executeQuery(query, []) as (JornadaRow & {nombre: string, apellido: string, email: string})[];
    
    if (result.length === 0) {
      return { jornadasCerradas: 0, detalles: [] };
    }

    const detalles: Array<{usuarioId: number, nombre: string, email: string}> = [];
    
    for (const jornada of result) {
      const timestamp = new Date().toISOString();
      
      await executeQuery(`
        UPDATE jornadas_laborales 
        SET salida = ?, auto_cerrada = true, 
            observaciones = CONCAT(COALESCE(observaciones, ''), '. Auto-cerrado por sistema tras 8 horas'),
            updated_at = NOW()
        WHERE id = ?
      `, [timestamp, jornada.id]);
      
      detalles.push({
        usuarioId: jornada.usuario_id,
        nombre: `${jornada.nombre} ${jornada.apellido}`,
        email: jornada.email
      });
    }

    return {
      jornadasCerradas: result.length,
      detalles
    };
  }
}