import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

/**
 * 🚀 Convierte timestamp de Colombia a formato MySQL preservando la hora local
 * Evita que MySQL interprete incorrectamente las zonas horarias
 */
const convertirTimestampParaMySQL = (timestamp: string): string => {
  try {
    console.log('📤 [MySQL] Convirtiendo timestamp:', timestamp);
    
    // Si ya es un timestamp con zona horaria de Colombia, parsearlo y convertir a formato MySQL
    const fecha = new Date(timestamp);
    
    // Obtener componentes en zona horaria de Colombia (preservar la hora local)
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(fecha);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const second = parts.find(p => p.type === 'second')?.value;
    
    // Formato MySQL: 'YYYY-MM-DD HH:MM:SS' (sin zona horaria, pero en hora de Colombia)
    const mysqlTimestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    console.log('📥 [MySQL] Timestamp convertido:', mysqlTimestamp);
    
    return mysqlTimestamp;
  } catch (error) {
    console.error('❌ [MySQL] Error convirtiendo timestamp:', timestamp, error);
    // Fallback: mantener el timestamp original
    return timestamp;
  }
};

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
      
      // Función helper para convertir timestamp de MySQL a formato Colombia
      const convertTimestamp = (timestamp: string | null): string | undefined => {
        if (!timestamp) return undefined;
        
        try {
          let fechaObj: Date;
          
          if (typeof timestamp === 'string') {
            if (timestamp.includes('T') && (timestamp.includes('Z') || timestamp.includes('-05:00') || timestamp.includes('+') || timestamp.includes('-'))) {
              // Ya tiene zona horaria, usar directamente
              fechaObj = new Date(timestamp);
            } else {
              // Formato MySQL sin zona horaria, asumir que es Colombia y agregar offset
              fechaObj = new Date(`${timestamp.replace(' ', 'T')}-05:00`);
            }
          } else {
            fechaObj = new Date(timestamp);
          }
          
          // Convertir a formato ISO con zona horaria Colombia
          const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          
          const parts = formatter.formatToParts(fechaObj);
          const year = parts.find(p => p.type === 'year')?.value;
          const month = parts.find(p => p.type === 'month')?.value;
          const day = parts.find(p => p.type === 'day')?.value;
          const hour = parts.find(p => p.type === 'hour')?.value;
          const minute = parts.find(p => p.type === 'minute')?.value;
          const second = parts.find(p => p.type === 'second')?.value;
          
          return `${year}-${month}-${day}T${hour}:${minute}:${second}-05:00`;
        } catch (error) {
          console.error('Error convirtiendo timestamp:', timestamp, error);
          return timestamp;
        }
      };

      return {
        id: row.id,
        usuarioId: row.usuario_id,
        fecha: row.fecha,
        entrada: convertTimestamp(row.entrada),
        almuerzoInicio: convertTimestamp(row.almuerzo_inicio),
        almuerzoFin: convertTimestamp(row.almuerzo_fin),
        descansoMananaInicio: convertTimestamp(row.descanso_manana_inicio),
        descansoMananaFin: convertTimestamp(row.descanso_manana_fin),
        descansoTardeInicio: convertTimestamp(row.descanso_tarde_inicio),
        descansoTardeFin: convertTimestamp(row.descanso_tarde_fin),
        salida: convertTimestamp(row.salida),
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
          convertirTimestampParaMySQL(registro.timestamp),
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

      // Validar constraint antes de actualizar
      if (campo === 'salida') {
        // Verificar que salida no sea anterior a entrada
        const entrada = new Date(jornada.entrada || '').getTime();
        const salida = new Date(registro.timestamp).getTime();
        
        if (salida < entrada) {
          throw new Error('La hora de salida no puede ser anterior a la entrada');
        }
      }
      
      await pool.execute(
        `UPDATE jornadas_laborales 
         SET ${campo} = ? 
         WHERE id = ?`,
        [convertirTimestampParaMySQL(registro.timestamp), jornada.id]
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

      // Usar timestamp actual para salida
      const ahora = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await pool.execute(
        `UPDATE jornadas_laborales 
         SET salida = ?, observaciones = CONCAT(COALESCE(observaciones, ''), ?, '\n')
         WHERE id = ?`,
        [ahora, observaciones, jornada.id]
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