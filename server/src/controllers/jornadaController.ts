import { Response } from 'express';
import { JornadaModel } from '../models/JornadaModel';
import { RegionalModel } from '../models/RegionalModel';
import { executeQuery } from '../config/database';
import { AuthenticatedRequest } from '../types/auth';

interface UsuarioUbicacion {
  ubicacion_trabajo_latitud?: number;
  ubicacion_trabajo_longitud?: number;
  nombre_ubicacion_trabajo?: string;
  tolerancia_ubicacion_metros?: number;
  regional_id?: number;
}

export class JornadaController {
  /**
   * Obtener jornada actual del usuario autenticado
   */
  static async obtenerJornadaActual(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const usuarioId = req.usuario.id;
      const jornada = await JornadaModel.obtenerJornadaActual(usuarioId);
      
      res.json({
        success: true,
        data: jornada
      });
    } catch (error) {
      console.error('Error en obtenerJornadaActual:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Registrar tiempo (entrada, almuerzo, descansos, salida)
   */
  static async registrarTiempo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const usuarioId = req.usuario.id;
      const { tipo, timestamp, ubicacion, observaciones } = req.body;

      // Validar datos requeridos
      if (!tipo || !timestamp) {
        res.status(400).json({
          success: false,
          message: 'Tipo y timestamp son requeridos'
        });
        return;
      }

      const registro = {
        tipo,
        timestamp,
        ubicacion,
        observaciones
      };

      let jornada;

      if (tipo === 'entrada') {
        jornada = await JornadaModel.iniciarJornada(usuarioId, registro);
      } else {
        jornada = await JornadaModel.registrarEvento(usuarioId, registro);
      }

      res.json({
        success: true,
        message: 'Tiempo registrado exitosamente',
        data: jornada
      });
    } catch (error) {
      console.error('Error en registrarTiempo:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Validar ubicación del usuario
   */
  static async validarUbicacion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const usuarioId = req.usuario.id;
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridos'
        });
        return;
      }

      const validacion = await JornadaController.validarUbicacionInterna(
        usuarioId,
        latitude,
        longitude
      );

      res.json({
        success: true,
        data: validacion
      });
    } catch (error) {
      console.error('Error en validarUbicacion:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Forzar cierre de jornada
   */
  static async forzarCierre(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const usuarioId = req.usuario.id;
      const { observaciones } = req.body;

      const jornada = await JornadaModel.forzarCierre(usuarioId, observaciones || 'Cierre forzado');

      res.json({
        success: true,
        message: 'Jornada cerrada exitosamente',
        data: jornada
      });
    } catch (error) {
      console.error('Error en forzarCierre:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener historial de jornadas
   */
  static async obtenerHistorial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const usuarioId = req.usuario.id;
      const { fechaInicio = '2024-01-01', fechaFin = '2024-12-31' } = req.query;

      const jornadas = await JornadaModel.obtenerJornadasPorFecha(
        usuarioId,
        fechaInicio as string,
        fechaFin as string
      );

      res.json({
        success: true,
        data: jornadas
      });
    } catch (error) {
      console.error('Error en obtenerHistorial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Validación interna de ubicación
   */
  private static async validarUbicacionInterna(
    usuarioId: number,
    latitude: number,
    longitude: number
  ): Promise<{
    valida: boolean;
    distancia: number;
    tolerancia: number;
    ubicacion: { nombre: string; latitud: number; longitud: number } | null;
    tipoValidacion: 'ubicacion_especifica' | 'regional' | 'sin_restriccion';
  }> {
    try {
      // Primero intentar obtener ubicación específica del usuario
      const queryUsuario = `
        SELECT 
          ubicacion_trabajo_latitud, 
          ubicacion_trabajo_longitud, 
          nombre_ubicacion_trabajo,
          tolerancia_ubicacion_metros,
          regional_id
        FROM usuarios 
        WHERE id = ?
      `;
      
      const resultUsuario = await executeQuery(queryUsuario, [usuarioId]);
      
      if (resultUsuario.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      const usuario = resultUsuario[0] as UsuarioUbicacion;
      
      // Si el usuario tiene ubicación específica asignada
      if (usuario.ubicacion_trabajo_latitud && usuario.ubicacion_trabajo_longitud) {
        const distancia = JornadaController.calcularDistancia(
          latitude,
          longitude,
          usuario.ubicacion_trabajo_latitud,
          usuario.ubicacion_trabajo_longitud
        );
        
        const tolerancia = usuario.tolerancia_ubicacion_metros || 50;
        const valida = distancia <= tolerancia;
        
        return {
          valida,
          distancia,
          tolerancia,
          ubicacion: {
            nombre: usuario.nombre_ubicacion_trabajo || 'Ubicación de trabajo',
            latitud: usuario.ubicacion_trabajo_latitud,
            longitud: usuario.ubicacion_trabajo_longitud
          },
          tipoValidacion: 'ubicacion_especifica'
        };
      }
      
      // Si no tiene ubicación específica, usar ubicación de la regional
      if (usuario.regional_id) {
        const regional = await RegionalModel.obtenerPorUsuario(usuarioId);
        
        if (regional && typeof regional.latitud === 'number' && typeof regional.longitud === 'number') {
          const distancia = JornadaController.calcularDistancia(
            latitude,
            longitude,
            regional.latitud,
            regional.longitud
          );
          
          const tolerancia = 50; // 50 metros de tolerancia para regionales
          const valida = distancia <= tolerancia;
          
          return {
            valida,
            distancia,
            tolerancia,
            ubicacion: {
              nombre: regional.nombre,
              latitud: regional.latitud,
              longitud: regional.longitud
            },
            tipoValidacion: 'regional'
          };
        }
      }
      
      // Si no hay ubicación específica ni regional configurada
      return {
        valida: true,
        distancia: 0,
        tolerancia: 0,
        ubicacion: null,
        tipoValidacion: 'sin_restriccion'
      };
      
    } catch (error) {
      console.error('Error en validarUbicacionInterna:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de jornadas
   */
  static async obtenerEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Por ahora retornamos estadísticas dummy
      const estadisticas = {
        jornadasCompletadas: 0,
        horasTrabajadasTotal: 0,
        promedioHorasDiarias: 0,
        diasTrabajados: 0
      };

      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener resumen para administradores
   */
  static async obtenerResumenAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario || req.usuario.rol !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
        return;
      }

      // Por ahora retornamos resumen dummy
      const resumen = {
        empleadosActivos: 0,
        jornadasAbiertas: 0,
        horasTrabajadasHoy: 0
      };

      res.json({
        success: true,
        data: resumen
      });
    } catch (error) {
      console.error('Error en obtenerResumenAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Ejecutar auto-cierre manual
   */
  static async ejecutarAutoCierre(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario || req.usuario.rol !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
        return;
      }

      const resultado = await JornadaModel.ejecutarAutoCierre();

      res.json({
        success: true,
        message: 'Auto-cierre ejecutado exitosamente',
        data: resultado
      });
    } catch (error) {
      console.error('Error en ejecutarAutoCierre:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar reporte Excel
   */
  static async generarReporteExcel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.usuario || req.usuario.rol !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
        return;
      }

      const buffer = await JornadaModel.generarReporteExcel();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-jornadas.xlsx');
      res.send(buffer);
    } catch (error) {
      console.error('Error en generarReporteExcel:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Calcular distancia entre dos puntos usando fórmula de Haversine
   */
  private static calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}