import { Request, Response } from 'express';
import { JornadaModel } from '../models/JornadaModel';
import { RegionalModel } from '../models/RegionalModel';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/auth';

export class JornadaController {
  
  /**
   * Obtener jornada actual del usuario autenticado
   */
  static async obtenerJornadaActual(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user!.id;
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
   * Registrar evento de tiempo en jornada laboral
   */
  static async registrarTiempo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const usuarioId = req.user!.id;
      const { tipo, timestamp, ubicacion, observaciones } = req.body;

      // Validar ubicación si es entrada o salida
      if (tipo === 'entrada' || tipo === 'salida') {
        const validacionUbicacion = await JornadaController.validarUbicacionInterna(
          usuarioId, 
          ubicacion.latitude, 
          ubicacion.longitude
        );
        
        if (!validacionUbicacion.valida) {
          res.status(400).json({
            success: false,
            message: `Ubicación fuera del rango permitido. Distancia: ${validacionUbicacion.distancia.toFixed(0)}m (máximo: ${validacionUbicacion.tolerancia}m)`,
            data: validacionUbicacion
          });
          return;
        }
      }

      // Registrar el evento
      let jornada;
      if (tipo === 'entrada') {
        jornada = await JornadaModel.iniciarJornada(
          usuarioId,
          ubicacion.latitude,
          ubicacion.longitude,
          ubicacion.accuracy,
          new Date(timestamp)
        );
      } else {
        jornada = await JornadaModel.registrarEvento(
          usuarioId,
          tipo,
          ubicacion.latitude,
          ubicacion.longitude,
          ubicacion.accuracy,
          observaciones,
          new Date(timestamp)
        );
      }

      res.json({
        success: true,
        message: `${tipo.replace('_', ' ')} registrada exitosamente`,
        data: jornada
      });

    } catch (error: any) {
      console.error('Error en registrarTiempo:', error);
      
      // Manejar errores específicos de validación de negocio
      if (error.message.includes('Ya existe una jornada')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message.includes('No existe jornada iniciada')) {
        res.status(400).json({
          success: false,
          message: 'Debes registrar la entrada primero'
        });
        return;
      }

      if (error.message.includes('exceder')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Validar ubicación actual contra regional asignada
   */
  static async validarUbicacion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const usuarioId = req.user!.id;
      const { latitude, longitude } = req.body;

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
   * Obtener historial de jornadas del usuario
   */
  static async obtenerHistorial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: errors.array()
        });
        return;
      }

      const usuarioId = req.user!.id;
      const { fechaInicio, fechaFin, limite = 30 } = req.query;

      const historial = await JornadaModel.obtenerHistorial(
        usuarioId,
        fechaInicio as string,
        fechaFin as string,
        parseInt(limite as string)
      );

      res.json({
        success: true,
        data: historial
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
   * Obtener estadísticas de jornadas del usuario
   */
  static async obtenerEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: errors.array()
        });
        return;
      }

      const usuarioId = req.user!.id;
      const { mes, año } = req.query;

      const estadisticas = await JornadaModel.obtenerEstadisticas(
        usuarioId,
        mes ? parseInt(mes as string) : undefined,
        año ? parseInt(año as string) : undefined
      );

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
   * Forzar cierre de jornada (solo administradores)
   */
  static async forzarCierre(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar que el usuario sea administrador
      if (req.user!.rol !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const jornadaId = parseInt(req.params.id);
      const { observaciones } = req.body;

      const jornada = await JornadaModel.forzarCierre(jornadaId, observaciones);

      res.json({
        success: true,
        message: 'Jornada cerrada forzosamente',
        data: jornada
      });

    } catch (error: any) {
      console.error('Error en forzarCierre:', error);
      
      if (error.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          message: 'Jornada no encontrada'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener resumen de todas las jornadas (solo administradores)
   */
  static async obtenerResumenAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      if (!['admin', 'supervisor'].includes(req.user!.rol)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: errors.array()
        });
        return;
      }

      const { fecha, regional, departamento } = req.query;

      const resumen = await JornadaModel.obtenerResumenAdmin({
        fecha: fecha as string,
        regionalId: regional ? parseInt(regional as string) : undefined,
        departamento: departamento as string
      });

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
   * Ejecutar auto-cierre de jornadas de 8+ horas (solo administradores)
   */
  static async ejecutarAutoCierre(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar que el usuario sea administrador
      if (req.user!.rol !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
        return;
      }

      const result = await JornadaModel.ejecutarAutoCierre();

      res.json({
        success: true,
        message: `Se cerraron automáticamente ${result.jornadasCerradas} jornadas`,
        data: result
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
   * Generar reporte Excel de jornadas
   */
  static async generarReporteExcel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      if (!['admin', 'supervisor'].includes(req.user!.rol)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: errors.array()
        });
        return;
      }

      const { fechaInicio, fechaFin, usuarioId, departamento } = req.query;

      const reporteBuffer = await JornadaModel.generarReporteExcel({
        fechaInicio: fechaInicio as string,
        fechaFin: fechaFin as string,
        usuarioId: usuarioId ? parseInt(usuarioId as string) : undefined,
        departamento: departamento as string
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_jornadas_${fechaInicio}_${fechaFin}.xlsx"`);
      res.send(reporteBuffer);

    } catch (error) {
      console.error('Error en generarReporteExcel:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Método auxiliar para validar ubicación
   */
  private static async validarUbicacionInterna(
    usuarioId: number, 
    latitude: number, 
    longitude: number
  ): Promise<{
    valida: boolean;
    distancia: number;
    tolerancia: number;
    regional: any;
  }> {
    // Obtener regional del usuario
    const regional = await RegionalModel.obtenerPorUsuario(usuarioId);
    
    if (!regional || !regional.latitud || !regional.longitud) {
      // Si no hay regional asignada o no tiene coordenadas, permitir cualquier ubicación
      return {
        valida: true,
        distancia: 0,
        tolerancia: 10,
        regional: null
      };
    }

    // Calcular distancia usando fórmula de Haversine
    const distancia = JornadaController.calcularDistancia(
      latitude,
      longitude,
      regional.latitud,
      regional.longitud
    );

    const tolerancia = 10; // 10 metros de tolerancia
    const valida = distancia <= tolerancia;

    return {
      valida,
      distancia,
      tolerancia,
      regional: {
        id: regional.id,
        nombre: regional.nombre,
        latitud: regional.latitud,
        longitud: regional.longitud
      }
    };
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
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon1 - lon2) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en metros
  }
}