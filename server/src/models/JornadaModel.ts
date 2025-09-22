import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

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
  autoCerrada: boolean;
  observaciones?: string;
}

export interface RegistroEvento {
  tipo: 'entrada' | 'almuerzo_inicio' | 'almuerzo_fin' | 'descanso_manana_inicio' | 'descanso_manana_fin' | 'descanso_tarde_inicio' | 'descanso_tarde_fin' | 'salida';
  timestamp: string;
  ubicacion?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  observaciones?: string;
}

export class JornadaModel {
  /**
   * Obtener jornada actual del usuario
   */
  static async obtenerJornadaActual(usuarioId: number): Promise<JornadaLaboral | null> {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM jornadas_laborales 
         WHERE usuario_id = ? AND fecha = CURDATE() 
         ORDER BY id DESC LIMIT 1`,
        [usuarioId]
      ) as [RowDataPacket[], any];

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
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
        autoCerrada: Boolean(row.auto_cerrada),
        observaciones: row.observaciones
      };
    } catch (error) {
      console.error('Error obteniendo jornada actual:', error);
      throw error;
    }
  }

  /**
   * Iniciar nueva jornada
   */
  static async iniciarJornada(usuarioId: number, registro: RegistroEvento): Promise<JornadaLaboral> {
    try {
      const [result] = await pool.execute(
        `INSERT INTO jornadas_laborales (
          usuario_id, fecha, entrada, latitud_entrada, longitud_entrada, 
          precision_entrada, observaciones_entrada
        ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?)`,
        [
          usuarioId,
          registro.timestamp,
          registro.ubicacion?.latitude || null,
          registro.ubicacion?.longitude || null,
          registro.ubicacion?.accuracy || null,
          registro.observaciones || null
        ]
      ) as [ResultSetHeader, any];

      const jornada = await this.obtenerJornadaActual(usuarioId);
      if (!jornada) {
        throw new Error('Error creando jornada');
      }

      return jornada;
    } catch (error) {
      console.error('Error iniciando jornada:', error);
      throw error;
    }
  }

  /**
   * Registrar evento en jornada existente
   */
  static async registrarEvento(usuarioId: number, registro: RegistroEvento): Promise<JornadaLaboral> {
    try {
      const jornada = await this.obtenerJornadaActual(usuarioId);
      if (!jornada) {
        throw new Error('No hay jornada activa');
      }

      const campos: Record<string, string> = {
        'almuerzo_inicio': 'almuerzo_inicio',
        'almuerzo_fin': 'almuerzo_fin',
        'descanso_manana_inicio': 'descanso_manana_inicio',
        'descanso_manana_fin': 'descanso_manana_fin',
        'descanso_tarde_inicio': 'descanso_tarde_inicio',
        'descanso_tarde_fin': 'descanso_tarde_fin',
        'salida': 'salida'
      };

      const campo = campos[registro.tipo];
      if (!campo) {
        throw new Error(`Tipo de evento no válido: ${registro.tipo}`);
      }

      await pool.execute(
        `UPDATE jornadas_laborales 
         SET ${campo} = ? 
         WHERE id = ?`,
        [registro.timestamp, jornada.id]
      );

      // Recalcular horas trabajadas
      await this.calcularHorasTrabajadas(jornada.id);

      const jornadaActualizada = await this.obtenerJornadaActual(usuarioId);
      if (!jornadaActualizada) {
        throw new Error('Error actualizando jornada');
      }

      return jornadaActualizada;
    } catch (error) {
      console.error('Error registrando evento:', error);
      throw error;
    }
  }

  /**
   * Forzar cierre de jornada
   */
  static async forzarCierre(usuarioId: number, observaciones: string = 'Cierre forzado'): Promise<JornadaLaboral | null> {
    try {
      const jornada = await this.obtenerJornadaActual(usuarioId);
      if (!jornada) {
        throw new Error('No hay jornada activa para cerrar');
      }

      await pool.execute(
        `UPDATE jornadas_laborales 
         SET salida = NOW(), observaciones = CONCAT(COALESCE(observaciones, ''), ?, '\n')
         WHERE id = ?`,
        [observaciones, jornada.id]
      );

      await this.calcularHorasTrabajadas(jornada.id);
      return await this.obtenerJornadaActual(usuarioId);
    } catch (error) {
      console.error('Error forzando cierre:', error);
      throw error;
    }
  }

  /**
   * Obtener jornadas por fecha
   */
  static async obtenerJornadasPorFecha(
    usuarioId: number, 
    fechaInicio: string, 
    fechaFin: string
  ): Promise<JornadaLaboral[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM jornadas_laborales 
         WHERE usuario_id = ? AND fecha BETWEEN ? AND ?
         ORDER BY fecha DESC`,
        [usuarioId, fechaInicio, fechaFin]
      ) as [RowDataPacket[], any];

      return rows.map(row => ({
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
        autoCerrada: Boolean(row.auto_cerrada),
        observaciones: row.observaciones
      }));
    } catch (error) {
      console.error('Error obteniendo jornadas por fecha:', error);
      throw error;
    }
  }

  /**
   * Calcular horas trabajadas
   */
  private static async calcularHorasTrabajadas(jornadaId: number): Promise<void> {
    try {
      await pool.execute(
        `UPDATE jornadas_laborales 
         SET horas_trabajadas = COALESCE(
           TIMESTAMPDIFF(MINUTE, entrada, COALESCE(salida, NOW())) / 60.0 -
           COALESCE(TIMESTAMPDIFF(MINUTE, almuerzo_inicio, COALESCE(almuerzo_fin, entrada)) / 60.0, 0) -
           COALESCE(TIMESTAMPDIFF(MINUTE, descanso_manana_inicio, COALESCE(descanso_manana_fin, entrada)) / 60.0, 0) -
           COALESCE(TIMESTAMPDIFF(MINUTE, descanso_tarde_inicio, COALESCE(descanso_tarde_fin, entrada)) / 60.0, 0),
           0
         )
         WHERE id = ?`,
        [jornadaId]
      );
    } catch (error) {
      console.error('Error calculando horas trabajadas:', error);
    }
  }

  /**
   * Ejecutar auto-cierre de jornadas
   */
  static async ejecutarAutoCierre(): Promise<{ jornadasCerradas: number; detalles: any[] }> {
    try {
      // Por ahora retornamos valores dummy
      console.log('Ejecutando auto-cierre de jornadas...');
      return {
        jornadasCerradas: 0,
        detalles: []
      };
    } catch (error) {
      console.error('Error en auto-cierre:', error);
      return {
        jornadasCerradas: 0,
        detalles: []
      };
    }
  }

  /**
   * Generar reporte Excel (simplificado)
   */
  static async generarReporteExcel(): Promise<Buffer> {
    // Por ahora retornamos un buffer vacío
    return Buffer.from('Reporte no disponible temporalmente');
  }
}