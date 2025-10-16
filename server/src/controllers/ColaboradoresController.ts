import { Request, Response } from 'express';
import { UsuarioModel } from '../models/UsuarioModel';
import { validationResult } from 'express-validator';
import mysql from 'mysql2/promise';

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_acceso_oxitrans',
  charset: 'utf8mb4',
  timezone: 'local'
};

export class ColaboradoresController {
  
  /**
   * Buscar colaboradores por cédula o apellidos
   * GET /api/colaboradores/buscar/:termino
   */
  static async buscarColaboradores(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { termino } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Validar que el término tenga al menos 3 caracteres
      if (termino.length < 3) {
        res.status(400).json({
          success: false,
          message: 'El término de búsqueda debe tener al menos 3 caracteres'
        });
        return;
      }

      const connection = await mysql.createConnection(dbConfig);
      
      try {
        // Query para buscar por cédula o apellidos con información completa
        const searchQuery = `
          SELECT 
            u.id,
            u.nombre,
            u.apellido,
            u.documento,
            u.email,
            u.telefono,
            u.rol,
            u.estado,
            u.created_at as fecha_creacion,
            u.regional_id,
            r.nombre as regional_nombre,
            u.departamento,
            u.cargo as cargo_nombre,
            NULL as cargo_id
          FROM usuarios u
          LEFT JOIN regionales r ON u.regional_id = r.id
          WHERE (u.documento LIKE ? OR u.apellido LIKE ?)
          AND u.estado = 'activo'
          ORDER BY u.apellido, u.nombre
          LIMIT ? OFFSET ?
        `;

        const searchTerm = `%${termino}%`;
        const offset = (Number(page) - 1) * Number(limit);
        
        const [rows] = await connection.execute(searchQuery, [
          searchTerm, 
          searchTerm, 
          String(Number(limit)), 
          String(offset)
        ]);

        // Contar total de resultados
        const countQuery = `
          SELECT COUNT(*) as total 
          FROM usuarios u
          WHERE (u.documento LIKE ? OR u.apellido LIKE ?)
          AND u.estado = 'activo'
        `;
        
        const [countResult] = await connection.execute(countQuery, [searchTerm, searchTerm]);
        const total = (countResult as any[])[0].total;

        res.json({
          success: true,
          data: rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        });

      } finally {
        await connection.end();
      }

    } catch (error) {
      console.error('Error en buscarColaboradores:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  /**
   * Obtener historial completo de jornadas de un colaborador
   * GET /api/colaboradores/:id/jornadas
   */
  static async getHistorialJornadas(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { 
        fechaInicio, 
        fechaFin, 
        page = 1, 
        limit = 20 
      } = req.query;

      const connection = await mysql.createConnection(dbConfig);
      
      try {
        // Verificar que el colaborador existe
        const [userCheck] = await connection.execute(
          'SELECT id, nombre, apellido FROM usuarios WHERE id = ? AND estado = "activo"',
          [id]
        );

        if ((userCheck as any[]).length === 0) {
          res.status(404).json({
            success: false,
            message: 'Colaborador no encontrado'
          });
          return;
        }

        const colaborador = (userCheck as any[])[0];

        // Construir query con filtros de fecha opcionales
        let jornadaQuery = `
          SELECT 
            j.id,
            j.fecha,
            j.entrada,
            j.salida,
            j.descanso_manana_inicio,
            j.descanso_manana_fin,
            j.almuerzo_inicio,
            j.almuerzo_fin,
            j.descanso_tarde_inicio,
            j.descanso_tarde_fin,
            j.latitud_entrada,
            j.longitud_entrada,
            j.latitud_salida,
            j.longitud_salida,
            j.horas_trabajadas,
            j.observaciones_entrada,
            j.observaciones_salida,
            TIMEDIFF(j.salida, j.entrada) as duracion_total,
            CASE 
              WHEN j.almuerzo_inicio IS NOT NULL AND j.almuerzo_fin IS NOT NULL 
              THEN TIMEDIFF(j.almuerzo_fin, j.almuerzo_inicio)
              ELSE '00:00:00'
            END as duracion_almuerzo,
            CASE 
              WHEN j.descanso_manana_inicio IS NOT NULL AND j.descanso_manana_fin IS NOT NULL 
              THEN TIMEDIFF(j.descanso_manana_fin, j.descanso_manana_inicio)
              ELSE '00:00:00'
            END as duracion_descanso_manana,
            CASE 
              WHEN j.descanso_tarde_inicio IS NOT NULL AND j.descanso_tarde_fin IS NOT NULL 
              THEN TIMEDIFF(j.descanso_tarde_fin, j.descanso_tarde_inicio)
              ELSE '00:00:00'
            END as duracion_descanso_tarde
          FROM jornadas_laborales j
          WHERE j.usuario_id = ?
        `;

        const queryParams = [id];

        // Agregar filtros de fecha si se proporcionan
        if (fechaInicio) {
          jornadaQuery += ' AND j.fecha >= ?';
          queryParams.push(fechaInicio as string);
        }
        
        if (fechaFin) {
          jornadaQuery += ' AND j.fecha <= ?';
          queryParams.push(fechaFin as string);
        }

        jornadaQuery += ' ORDER BY j.fecha DESC, j.entrada DESC LIMIT ? OFFSET ?';
        
        const offset = (Number(page) - 1) * Number(limit);
        queryParams.push(String(Number(limit)), String(offset));

        const [jornadas] = await connection.execute(jornadaQuery, queryParams);

        // DEBUG TEMPORAL - Ver datos exactos que se envían
        console.log('🔍 [BACKEND DEBUG] Query ejecutado:', jornadaQuery);
        console.log('🔍 [BACKEND DEBUG] Parámetros:', queryParams);
        console.log('🔍 [BACKEND DEBUG] Jornadas encontradas:', (jornadas as any[]).length);
        if ((jornadas as any[]).length > 0) {
          console.log('🔍 [BACKEND DEBUG] Primera jornada:', (jornadas as any[])[0]);
          console.log('🔍 [BACKEND DEBUG] Últimas 3 fechas:', (jornadas as any[]).slice(0, 3).map(j => j.fecha));
        }

        // Contar total de jornadas
        let countQuery = 'SELECT COUNT(*) as total FROM jornadas_laborales j WHERE j.usuario_id = ?';
        const countParams = [id];

        if (fechaInicio) {
          countQuery += ' AND j.fecha >= ?';
          countParams.push(fechaInicio as string);
        }
        
        if (fechaFin) {
          countQuery += ' AND j.fecha <= ?';
          countParams.push(fechaFin as string);
        }

        const [countResult] = await connection.execute(countQuery, countParams);
        const total = (countResult as any[])[0].total;

        res.json({
          success: true,
          data: {
            colaborador,
            jornadas,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total,
              pages: Math.ceil(total / Number(limit))
            }
          }
        });

      } finally {
        await connection.end();
      }

    } catch (error) {
      console.error('Error en getHistorialJornadas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  /**
   * Obtener registros de ubicaciones GPS de un colaborador
   * GET /api/colaboradores/:id/ubicaciones
   */
  static async getUbicacionesGPS(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { 
        fechaInicio, 
        fechaFin, 
        page = 1, 
        limit = 50 
      } = req.query;

      const connection = await mysql.createConnection(dbConfig);
      
      try {
        // Verificar que el colaborador existe
        const [userCheck] = await connection.execute(
          'SELECT id, nombre, apellido FROM usuarios WHERE id = ? AND estado = "activo"',
          [id]
        );

        if ((userCheck as any[]).length === 0) {
          res.status(404).json({
            success: false,
            message: 'Colaborador no encontrado'
          });
          return;
        }

        const colaborador = (userCheck as any[])[0];

        // Query para obtener todas las ubicaciones GPS
        let ubicacionesQuery = `
          SELECT 
            j.id as jornada_id,
            j.fecha,
            j.entrada as hora_entrada,
            j.salida as hora_salida,
            j.latitud_entrada,
            j.longitud_entrada,
            j.latitud_salida,
            j.longitud_salida,
            CASE 
              WHEN j.latitud_entrada IS NOT NULL AND j.longitud_entrada IS NOT NULL
              THEN 'entrada'
              ELSE NULL
            END as tipo_entrada,
            CASE 
              WHEN j.latitud_salida IS NOT NULL AND j.longitud_salida IS NOT NULL
              THEN 'salida'
              ELSE NULL
            END as tipo_salida
          FROM jornadas_laborales j
          WHERE j.usuario_id = ?
          AND (
            (j.latitud_entrada IS NOT NULL AND j.longitud_entrada IS NOT NULL)
            OR (j.latitud_salida IS NOT NULL AND j.longitud_salida IS NOT NULL)
          )
        `;

        const queryParams = [id];

        // Agregar filtros de fecha
        if (fechaInicio) {
          ubicacionesQuery += ' AND j.fecha >= ?';
          queryParams.push(fechaInicio as string);
        }
        
        if (fechaFin) {
          ubicacionesQuery += ' AND j.fecha <= ?';
          queryParams.push(fechaFin as string);
        }

        ubicacionesQuery += ' ORDER BY j.fecha DESC, j.entrada DESC LIMIT ? OFFSET ?';
        
        const offset = (Number(page) - 1) * Number(limit);
        queryParams.push(String(Number(limit)), String(offset));

        const [ubicaciones] = await connection.execute(ubicacionesQuery, queryParams);

        // Formatear datos para el mapa
        const ubicacionesFormateadas = (ubicaciones as any[]).reduce((acc, registro) => {
          // Agregar entrada si existe
          if (registro.latitud_entrada && registro.longitud_entrada) {
            acc.push({
              id: `${registro.jornada_id}_entrada`,
              jornada_id: registro.jornada_id,
              fecha: registro.fecha,
              hora: registro.hora_entrada,
              tipo: 'entrada',
              latitud: registro.latitud_entrada,
              longitud: registro.longitud_entrada
            });
          }

          // Agregar salida si existe
          if (registro.latitud_salida && registro.longitud_salida) {
            acc.push({
              id: `${registro.jornada_id}_salida`,
              jornada_id: registro.jornada_id,
              fecha: registro.fecha,
              hora: registro.hora_salida,
              tipo: 'salida',
              latitud: registro.latitud_salida,
              longitud: registro.longitud_salida
            });
          }

          return acc;
        }, []);

        res.json({
          success: true,
          data: {
            colaborador,
            ubicaciones: ubicacionesFormateadas,
            total_registros: ubicacionesFormateadas.length,
            pagination: {
              page: Number(page),
              limit: Number(limit)
            }
          }
        });

      } finally {
        await connection.end();
      }

    } catch (error) {
      console.error('Error en getUbicacionesGPS:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  /**
   * Calcular horas extras de un colaborador
   * POST /api/colaboradores/horas-extras
   */
  static async calcularHorasExtras(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { 
        colaborador_id, 
        fecha_inicio, 
        fecha_fin,
        horas_legales_dia = 8 // 8 horas por defecto según legislación colombiana
      } = req.body;

      const connection = await mysql.createConnection(dbConfig);
      
      try {
        // Verificar colaborador
        const [userCheck] = await connection.execute(
          'SELECT id, nombre, apellido FROM usuarios WHERE id = ? AND estado = "activo"',
          [colaborador_id]
        );

        if ((userCheck as any[]).length === 0) {
          res.status(404).json({
            success: false,
            message: 'Colaborador no encontrado'
          });
          return;
        }

        const colaborador = (userCheck as any[])[0];

        // Query para obtener jornadas en el rango de fechas
        const jornadasQuery = `
          SELECT 
            j.id,
            j.fecha,
            j.entrada,
            j.salida,
            j.almuerzo_inicio,
            j.almuerzo_fin,
            j.descanso_manana_inicio,
            j.descanso_manana_fin,
            j.descanso_tarde_inicio,
            j.descanso_tarde_fin,
            j.horas_trabajadas,
            TIME(j.entrada) as hora_entrada,
            TIME(j.salida) as hora_salida,
            TIMEDIFF(j.salida, j.entrada) as duracion_bruta,
            (
              CASE WHEN j.almuerzo_inicio IS NOT NULL AND j.almuerzo_fin IS NOT NULL 
                   THEN TIMEDIFF(j.almuerzo_fin, j.almuerzo_inicio) ELSE '00:00:00' END +
              CASE WHEN j.descanso_manana_inicio IS NOT NULL AND j.descanso_manana_fin IS NOT NULL 
                   THEN TIMEDIFF(j.descanso_manana_fin, j.descanso_manana_inicio) ELSE '00:00:00' END +
              CASE WHEN j.descanso_tarde_inicio IS NOT NULL AND j.descanso_tarde_fin IS NOT NULL 
                   THEN TIMEDIFF(j.descanso_tarde_fin, j.descanso_tarde_inicio) ELSE '00:00:00' END
            ) as tiempo_descanso_total
          FROM jornadas_laborales j
          WHERE j.usuario_id = ?
          AND j.fecha >= ? 
          AND j.fecha <= ?
          AND j.entrada IS NOT NULL 
          AND j.salida IS NOT NULL
          ORDER BY j.fecha ASC
        `;

        const [jornadas] = await connection.execute(jornadasQuery, [
          colaborador_id, 
          fecha_inicio, 
          fecha_fin
        ]);

        const calculoDetallado = (jornadas as any[]).map(jornada => {
          // Calcular horas trabajadas netas (sin descansos)
          const duracionBrutaMs = this.timeToMilliseconds(jornada.duracion_bruta);
          const tiempoDescansoMs = this.timeToMilliseconds(jornada.tiempo_descanso_total || '00:00:00');
          const horasTrabajadasMs = duracionBrutaMs - tiempoDescansoMs;
          const horasTrabajadasDecimal = horasTrabajadasMs / (1000 * 60 * 60);

          // Determinar horas diurnas y nocturnas según horarios legales colombianos
          // Nocturno: 21:00 a 06:00 (Código Sustantivo del Trabajo)
          const horaEntrada = this.timeToMinutes(jornada.hora_entrada);
          const horaSalida = this.timeToMinutes(jornada.hora_salida);
          
          const { horasDiurnas, horasNocturnas } = this.calcularHorasDiurnasNocturnas(
            horaEntrada, 
            horaSalida, 
            tiempoDescansoMs
          );

          // Calcular horas extras
          const horasExtras = Math.max(0, horasTrabajadasDecimal - horas_legales_dia);
          const horasExtrasDiurnas = Math.max(0, horasDiurnas - horas_legales_dia);
          const horasExtrasNocturnas = horasNocturnas;

          return {
            fecha: jornada.fecha,
            entrada: jornada.entrada,
            salida: jornada.salida,
            horas_trabajadas: Number(horasTrabajadasDecimal.toFixed(2)),
            horas_diurnas: Number(horasDiurnas.toFixed(2)),
            horas_nocturnas: Number(horasNocturnas.toFixed(2)),
            horas_extras_total: Number(horasExtras.toFixed(2)),
            horas_extras_diurnas: Number(horasExtrasDiurnas.toFixed(2)),
            horas_extras_nocturnas: Number(horasExtrasNocturnas.toFixed(2)),
            descanso_minutos: Math.floor(tiempoDescansoMs / (1000 * 60))
          };
        });

        // Calcular totales del período
        const totales = calculoDetallado.reduce((acc, dia) => ({
          total_horas_trabajadas: acc.total_horas_trabajadas + dia.horas_trabajadas,
          total_horas_diurnas: acc.total_horas_diurnas + dia.horas_diurnas,
          total_horas_nocturnas: acc.total_horas_nocturnas + dia.horas_nocturnas,
          total_horas_extras: acc.total_horas_extras + dia.horas_extras_total,
          total_horas_extras_diurnas: acc.total_horas_extras_diurnas + dia.horas_extras_diurnas,
          total_horas_extras_nocturnas: acc.total_horas_extras_nocturnas + dia.horas_extras_nocturnas,
          dias_trabajados: acc.dias_trabajados + 1
        }), {
          total_horas_trabajadas: 0,
          total_horas_diurnas: 0,
          total_horas_nocturnas: 0,
          total_horas_extras: 0,
          total_horas_extras_diurnas: 0,
          total_horas_extras_nocturnas: 0,
          dias_trabajados: 0
        });

        res.json({
          success: true,
          data: {
            colaborador,
            periodo: {
              fecha_inicio,
              fecha_fin,
              horas_legales_dia
            },
            calculo_diario: calculoDetallado,
            totales: {
              ...totales,
              promedio_horas_dia: totales.dias_trabajados > 0 
                ? Number((totales.total_horas_trabajadas / totales.dias_trabajados).toFixed(2))
                : 0
            }
          }
        });

      } finally {
        await connection.end();
      }

    } catch (error) {
      console.error('Error en calcularHorasExtras:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  // Métodos auxiliares para cálculos de tiempo
  private static timeToMilliseconds(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  }

  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static calcularHorasDiurnasNocturnas(
    horaEntradaMinutos: number, 
    horaSalidaMinutos: number, 
    tiempoDescansoMs: number
  ): { horasDiurnas: number; horasNocturnas: number } {
    // Horarios según legislación colombiana
    const inicioNocturno = 21 * 60; // 21:00
    const finNocturno = 6 * 60;     // 06:00

    let totalMinutosTrabajo = horaSalidaMinutos - horaEntradaMinutos;
    const minutosDescanso = tiempoDescansoMs / (1000 * 60);
    totalMinutosTrabajo -= minutosDescanso;

    let minutosNocturnos = 0;
    let minutosDiurnos = 0;

    // Si la jornada cruza la medianoche
    if (horaSalidaMinutos < horaEntradaMinutos) {
      horaSalidaMinutos += 24 * 60; // Agregar 24 horas
    }

    for (let minuto = horaEntradaMinutos; minuto < horaSalidaMinutos; minuto++) {
      const minutoDelDia = minuto % (24 * 60);
      
      if (minutoDelDia >= inicioNocturno || minutoDelDia < finNocturno) {
        minutosNocturnos++;
      } else {
        minutosDiurnos++;
      }
    }

    // Restar tiempo de descanso proporcionalmente
    const proporcionNocturna = minutosNocturnos / (minutosNocturnos + minutosDiurnos);
    minutosNocturnos -= minutosDescanso * proporcionNocturna;
    minutosDiurnos -= minutosDescanso * (1 - proporcionNocturna);

    return {
      horasDiurnas: Math.max(0, minutosDiurnos / 60),
      horasNocturnas: Math.max(0, minutosNocturnos / 60)
    };
  }
}