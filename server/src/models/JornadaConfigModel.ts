// ================================================
// Modelo para Configuración de Jornadas Laborales
// ================================================

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';

export interface JornadaConfigData {
  id?: number;
  horaEntrada: string;
  tiempoTrabajoDia: number;
  finJornadaLaboral: string;
  usuarioId: number;
  activa: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

interface JornadaConfigRow extends RowDataPacket {
  id: number;
  hora_entrada: string;
  tiempo_trabajo_dia: number;
  fin_jornada_laboral: string;
  usuario_id: number;
  activa: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  // Campos del usuario si se hace JOIN
  usuario_nombre?: string;
  usuario_apellido?: string;
  usuario_email?: string;
}

export class JornadaConfigModel {
  
  /**
   * Obtener configuración por ID
   */
  async obtenerPorId(id: number): Promise<JornadaConfigData | null> {
    try {
      const query = `
        SELECT 
          jc.id,
          jc.hora_entrada,
          jc.tiempo_trabajo_dia,
          jc.fin_jornada_laboral,
          jc.usuario_id,
          jc.activa,
          jc.fecha_creacion,
          jc.fecha_actualizacion
        FROM jornadas_config jc
        WHERE jc.id = ?
      `;
      
      const [rows] = await pool.execute<JornadaConfigRow[]>(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToData(rows[0]);
    } catch (error) {
      console.error('Error obteniendo configuración por ID:', error);
      throw new Error('Error accediendo a la base de datos');
    }
  }

  /**
   * Obtener configuración por usuario ID
   */
  async obtenerPorUsuarioId(usuarioId: number): Promise<JornadaConfigData | null> {
    try {
      const query = `
        SELECT 
          jc.id,
          jc.hora_entrada,
          jc.tiempo_trabajo_dia,
          jc.fin_jornada_laboral,
          jc.usuario_id,
          jc.activa,
          jc.fecha_creacion,
          jc.fecha_actualizacion
        FROM jornadas_config jc
        WHERE jc.usuario_id = ? AND jc.activa = 1
        ORDER BY jc.fecha_creacion DESC
        LIMIT 1
      `;
      
      const [rows] = await pool.execute<JornadaConfigRow[]>(query, [usuarioId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToData(rows[0]);
    } catch (error) {
      console.error('Error obteniendo configuración por usuario ID:', error);
      throw new Error('Error accediendo a la base de datos');
    }
  }

  /**
   * Crear nueva configuración
   */
  async crear(data: Omit<JornadaConfigData, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<JornadaConfigData> {
    try {
      // Primero desactivar cualquier configuración anterior del mismo usuario
      await this.desactivarConfiguracionesUsuario(data.usuarioId);

      const query = `
        INSERT INTO jornadas_config (
          hora_entrada,
          tiempo_trabajo_dia,
          fin_jornada_laboral,
          usuario_id,
          activa,
          fecha_creacion,
          fecha_actualizacion
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await pool.execute<ResultSetHeader>(query, [
        data.horaEntrada,
        data.tiempoTrabajoDia,
        data.finJornadaLaboral,
        data.usuarioId,
        data.activa
      ]);
      
      const nuevaConfiguracion = await this.obtenerPorId(result.insertId);
      
      if (!nuevaConfiguracion) {
        throw new Error('Error obteniendo la configuración recién creada');
      }
      
      return nuevaConfiguracion;
    } catch (error) {
      console.error('Error creando configuración de jornada:', error);
      throw new Error('Error creando configuración en la base de datos');
    }
  }

  /**
   * Actualizar configuración existente
   */
  async actualizar(id: number, data: Partial<JornadaConfigData>): Promise<JornadaConfigData> {
    try {
      const campos: string[] = [];
      const valores: any[] = [];
      
      if (data.horaEntrada !== undefined) {
        campos.push('hora_entrada = ?');
        valores.push(data.horaEntrada);
      }
      
      if (data.tiempoTrabajoDia !== undefined) {
        campos.push('tiempo_trabajo_dia = ?');
        valores.push(data.tiempoTrabajoDia);
      }
      
      if (data.finJornadaLaboral !== undefined) {
        campos.push('fin_jornada_laboral = ?');
        valores.push(data.finJornadaLaboral);
      }
      
      if (data.activa !== undefined) {
        campos.push('activa = ?');
        valores.push(data.activa);
      }
      
      // Siempre actualizar fecha de actualización
      campos.push('fecha_actualizacion = NOW()');
      valores.push(id);
      
      if (campos.length === 1) { // Solo fecha_actualizacion
        throw new Error('No hay datos para actualizar');
      }
      
      const query = `
        UPDATE jornadas_config 
        SET ${campos.join(', ')}
        WHERE id = ?
      `;
      
      await pool.execute(query, valores);
      
      const configuracionActualizada = await this.obtenerPorId(id);
      
      if (!configuracionActualizada) {
        throw new Error('Error obteniendo la configuración actualizada');
      }
      
      return configuracionActualizada;
    } catch (error) {
      console.error('Error actualizando configuración de jornada:', error);
      throw new Error('Error actualizando configuración en la base de datos');
    }
  }

  /**
   * Eliminar configuración
   */
  async eliminar(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM jornadas_config WHERE id = ?';
      const [result] = await pool.execute<ResultSetHeader>(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error eliminando configuración de jornada:', error);
      throw new Error('Error eliminando configuración de la base de datos');
    }
  }

  /**
   * Obtener todas las configuraciones con información del usuario
   */
  async obtenerTodas(): Promise<(JornadaConfigData & { usuarioNombre?: string; usuarioApellido?: string; usuarioEmail?: string })[]> {
    try {
      const query = `
        SELECT 
          jc.id,
          jc.hora_entrada,
          jc.tiempo_trabajo_dia,
          jc.fin_jornada_laboral,
          jc.usuario_id,
          jc.activa,
          jc.fecha_creacion,
          jc.fecha_actualizacion,
          u.nombre as usuario_nombre,
          u.apellido as usuario_apellido,
          u.email as usuario_email
        FROM jornadas_config jc
        LEFT JOIN usuarios u ON jc.usuario_id = u.id
        ORDER BY jc.fecha_creacion DESC
      `;
      
      const [rows] = await pool.execute<JornadaConfigRow[]>(query);
      
      return rows.map(row => ({
        ...this.mapRowToData(row),
        usuarioNombre: row.usuario_nombre,
        usuarioApellido: row.usuario_apellido,
        usuarioEmail: row.usuario_email
      }));
    } catch (error) {
      console.error('Error obteniendo todas las configuraciones:', error);
      throw new Error('Error accediendo a la base de datos');
    }
  }

  /**
   * Desactivar todas las configuraciones de un usuario
   */
  async desactivarConfiguracionesUsuario(usuarioId: number): Promise<void> {
    try {
      const query = `
        UPDATE jornadas_config 
        SET activa = 0, fecha_actualizacion = NOW()
        WHERE usuario_id = ? AND activa = 1
      `;
      
      await pool.execute(query, [usuarioId]);
    } catch (error) {
      console.error('Error desactivando configuraciones del usuario:', error);
      throw new Error('Error actualizando configuraciones en la base de datos');
    }
  }

  /**
   * Verificar si existe configuración activa para un usuario
   */
  async existeConfiguracionActiva(usuarioId: number): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as total
        FROM jornadas_config
        WHERE usuario_id = ? AND activa = 1
      `;
      
      const [rows] = await pool.execute<RowDataPacket[]>(query, [usuarioId]);
      
      return rows[0].total > 0;
    } catch (error) {
      console.error('Error verificando configuración activa:', error);
      throw new Error('Error accediendo a la base de datos');
    }
  }

  /**
   * Obtener estadísticas de configuraciones
   */
  async obtenerEstadisticas(): Promise<{
    totalConfiguraciones: number;
    configuracionesActivas: number;
    promedioHorasTrabajo: number;
    configuracionesPorHoras: { horas: number; cantidad: number }[];
  }> {
    try {
      // Total de configuraciones
      const [totalRows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM jornadas_config'
      );
      
      // Configuraciones activas
      const [activasRows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM jornadas_config WHERE activa = 1'
      );
      
      // Promedio de horas de trabajo
      const [promedioRows] = await pool.execute<RowDataPacket[]>(
        'SELECT AVG(tiempo_trabajo_dia) as promedio FROM jornadas_config WHERE activa = 1'
      );
      
      // Distribución por horas de trabajo
      const [distribucionRows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
           tiempo_trabajo_dia as horas, 
           COUNT(*) as cantidad 
         FROM jornadas_config 
         WHERE activa = 1 
         GROUP BY tiempo_trabajo_dia 
         ORDER BY tiempo_trabajo_dia`
      );
      
      return {
        totalConfiguraciones: totalRows[0].total,
        configuracionesActivas: activasRows[0].total,
        promedioHorasTrabajo: parseFloat(promedioRows[0].promedio || '0'),
        configuracionesPorHoras: distribucionRows.map(row => ({
          horas: row.horas,
          cantidad: row.cantidad
        }))
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error accediendo a la base de datos');
    }
  }

  // ================================================
  // MÉTODOS PARA CONFIGURACIÓN GLOBAL EMPRESARIAL
  // ================================================

  /**
   * Obtener configuración GLOBAL empresarial
   * Solo debe existir UNA configuración global para toda la empresa
   */
  async obtenerConfiguracionGlobal(): Promise<JornadaConfigData | null> {
    try {
      // Buscar configuración global (-1) o cualquier configuración activa como fallback
      const query = `
        SELECT 
          jc.id,
          jc.hora_entrada,
          jc.tiempo_trabajo_dia,
          jc.fin_jornada_laboral,
          jc.usuario_id,
          jc.activa,
          jc.fecha_creacion,
          jc.fecha_actualizacion
        FROM jornadas_config jc
        WHERE (jc.usuario_id = -1 OR jc.usuario_id IS NOT NULL)
        AND jc.activa = 1
        ORDER BY 
          CASE WHEN jc.usuario_id = -1 THEN 0 ELSE 1 END,
          jc.fecha_creacion DESC
        LIMIT 1
      `;
      
      console.log('🔍 [JornadaConfigModel] Buscando configuración global con query:', query);
      const [rows] = await pool.execute<JornadaConfigRow[]>(query);
      console.log('📊 [JornadaConfigModel] Registros encontrados:', rows.length);
      
      if (rows.length === 0) {
        console.log('❌ [JornadaConfigModel] No se encontró configuración global');
        return null;
      }
      
      console.log('✅ [JornadaConfigModel] Configuración global encontrada:', rows[0]);
      return this.mapRowToData(rows[0]);
    } catch (error) {
      console.error('❌ [JornadaConfigModel] Error obteniendo configuración global:', error);
      throw new Error('Error accediendo a la configuración global');
    }
  }

  /**
   * Crear nueva configuración GLOBAL empresarial
   */
  async crearConfiguracionGlobal(data: Omit<JornadaConfigData, 'id' | 'usuarioId' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<JornadaConfigData> {
    try {
      console.log('🔧 [JornadaConfigModel] Iniciando creación de configuración global con datos:', data);
      
      // Primero desactivar cualquier configuración global anterior
      console.log('🔄 [JornadaConfigModel] Desactivando configuraciones globales anteriores...');
      await this.desactivarConfiguracionGlobal();
      console.log('✅ [JornadaConfigModel] Configuraciones anteriores desactivadas');

      // SOLUCIÓN TEMPORAL: Usar usuario_id = -1 para configuración global
      const query = `
        INSERT INTO jornadas_config (
          hora_entrada,
          tiempo_trabajo_dia,
          fin_jornada_laboral,
          usuario_id,
          activa,
          fecha_creacion,
          fecha_actualizacion
        ) VALUES (?, ?, ?, -1, ?, NOW(), NOW())
      `;
      
      const params = [
        data.horaEntrada,
        data.tiempoTrabajoDia,
        data.finJornadaLaboral,
        data.activa
      ];
      
      console.log('💾 [JornadaConfigModel] Ejecutando INSERT con parámetros:', params);
      console.log('📝 [JornadaConfigModel] Query:', query);
      
      const [result] = await pool.execute<ResultSetHeader>(query, params);
      console.log('✅ [JornadaConfigModel] INSERT exitoso, ID:', result.insertId);
      
      console.log('🔍 [JornadaConfigModel] Obteniendo configuración recién creada con ID:', result.insertId);
      const nuevaConfiguracion = await this.obtenerPorId(result.insertId);
      
      if (!nuevaConfiguracion) {
        console.log('❌ [JornadaConfigModel] No se pudo obtener la configuración recién creada');
        throw new Error('Error obteniendo la configuración global recién creada');
      }
      
      console.log('✅ [JornadaConfigModel] Configuración global creada exitosamente:', nuevaConfiguracion);
      return nuevaConfiguracion;
    } catch (error: any) {
      console.error('❌ [JornadaConfigModel] ERROR creando configuración global:', error);
      console.error('❌ [JornadaConfigModel] Error message:', error.message);
      console.error('❌ [JornadaConfigModel] SQL Message:', error.sqlMessage);
      console.error('❌ [JornadaConfigModel] Error code:', error.code);
      console.error('❌ [JornadaConfigModel] SQL State:', error.sqlState);
      throw new Error('Error creando configuración global en la base de datos: ' + error.message);
    }
  }

  /**
   * Actualizar configuración GLOBAL existente
   */
  async actualizarConfiguracionGlobal(id: number, data: Partial<JornadaConfigData>): Promise<JornadaConfigData> {
    try {
      const campos: string[] = [];
      const valores: any[] = [];
      
      if (data.horaEntrada !== undefined) {
        campos.push('hora_entrada = ?');
        valores.push(data.horaEntrada);
      }
      
      if (data.tiempoTrabajoDia !== undefined) {
        campos.push('tiempo_trabajo_dia = ?');
        valores.push(data.tiempoTrabajoDia);
      }
      
      if (data.finJornadaLaboral !== undefined) {
        campos.push('fin_jornada_laboral = ?');
        valores.push(data.finJornadaLaboral);
      }
      
      if (data.activa !== undefined) {
        campos.push('activa = ?');
        valores.push(data.activa);
      }
      
      if (campos.length === 0) {
        throw new Error('No hay campos para actualizar');
      }
      
      campos.push('fecha_actualizacion = NOW()');
      valores.push(id);
      
      const query = `
        UPDATE jornadas_config 
        SET ${campos.join(', ')} 
        WHERE id = ?
      `;
      
      const [result] = await pool.execute<ResultSetHeader>(query, valores);
      
      if (result.affectedRows === 0) {
        throw new Error('Configuración global no encontrada o no se pudo actualizar');
      }
      
      const configuracionActualizada = await this.obtenerPorId(id);
      
      if (!configuracionActualizada) {
        throw new Error('Error obteniendo la configuración global actualizada');
      }
      
      return configuracionActualizada;
    } catch (error) {
      console.error('Error actualizando configuración global:', error);
      throw new Error('Error actualizando configuración global en la base de datos');
    }
  }

  /**
   * Desactivar configuración global anterior
   */
  private async desactivarConfiguracionGlobal(): Promise<void> {
    try {
      const query = `
        UPDATE jornadas_config 
        SET activa = 0, fecha_actualizacion = NOW() 
        WHERE usuario_id = -1 AND activa = 1
      `;
      
      console.log('🔄 [JornadaConfigModel] Ejecutando UPDATE para desactivar configuraciones globales');
      console.log('📝 [JornadaConfigModel] Query desactivación:', query);
      
      const [result] = await pool.execute(query);
      console.log('✅ [JornadaConfigModel] UPDATE completado, filas afectadas:', (result as any).affectedRows);
    } catch (error: any) {
      console.error('❌ [JornadaConfigModel] Error desactivando configuraciones globales anteriores:', error);
      console.error('❌ [JornadaConfigModel] SQL Message:', error.sqlMessage);
      console.error('❌ [JornadaConfigModel] Error code:', error.code);
      throw new Error('Error desactivando configuraciones globales: ' + error.message);
    }
  }

  // ================================================
  // Métodos privados de utilidad
  // ================================================

  /**
   * Mapear fila de base de datos a objeto de datos
   */
  private mapRowToData(row: JornadaConfigRow): JornadaConfigData {
    return {
      id: row.id,
      horaEntrada: row.hora_entrada,
      tiempoTrabajoDia: row.tiempo_trabajo_dia,
      finJornadaLaboral: row.fin_jornada_laboral,
      usuarioId: row.usuario_id,
      activa: Boolean(row.activa),
      fechaCreacion: row.fecha_creacion,
      fechaActualizacion: row.fecha_actualizacion
    };
  }
}

// Exportar instancia del modelo
export const jornadaConfigModel = new JornadaConfigModel();