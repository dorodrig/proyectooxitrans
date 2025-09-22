import { Response } from 'express';
import { JornadaModel } from '../models/JornadaModel';
import { RegionalModel } from '../models/RegionalModel';
import { AuthenticatedRequest } from '../types/auth';

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
    regional: any;
  }> {
    // Obtener regional del usuario
    const regional = await RegionalModel.obtenerPorUsuario(usuarioId);
    
    if (!regional || typeof regional.latitud !== 'number' || typeof regional.longitud !== 'number') {
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

    const tolerancia = 50; // 50 metros de tolerancia
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