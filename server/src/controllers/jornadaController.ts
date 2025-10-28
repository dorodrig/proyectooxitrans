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
      console.log('🚀 [ENDPOINT] validarUbicacion iniciado');
      console.log('🚀 [ENDPOINT] req.usuario:', req.usuario);
      console.log('🚀 [ENDPOINT] req.body:', req.body);
      
      if (!req.usuario) {
        console.log('❌ [ENDPOINT] Usuario no autenticado');
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const usuarioId = parseInt(req.usuario.id.toString(), 10); // Asegurar que sea número
      const { latitude, longitude } = req.body;
      
      console.log('🚀 [ENDPOINT] Datos para validación:', { 
        usuarioId, 
        usuarioIdType: typeof usuarioId,
        latitude, 
        longitude 
      });

      if (!latitude || !longitude) {
        console.log('❌ [ENDPOINT] Faltan coordenadas');
        res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridos'
        });
        return;
      }

      if (isNaN(usuarioId)) {
        console.log('❌ [ENDPOINT] usuarioId no es un número válido:', req.usuario.id);
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      console.log('🚀 [ENDPOINT] Llamando a validarUbicacionInterna...');
      const validacion = await JornadaController.validarUbicacionInterna(
        usuarioId,
        latitude,
        longitude,
        req
      );

      console.log('🚀 [ENDPOINT] Resultado de validación:', validacion);
      
      res.json({
        success: true,
        data: validacion
      });
    } catch (error) {
      console.error('❌ [ENDPOINT] Error en validarUbicacion:', error);
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
    longitude: number,
    req: AuthenticatedRequest
  ): Promise<{
    valida: boolean;
    distancia: number;
    tolerancia: number;
    ubicacion: { nombre: string; latitud: number; longitud: number } | null;
    tipoValidacion: 'ubicacion_especifica' | 'regional' | 'sin_restriccion' | 'visita_flexible';
  }> {
    try {
      console.log('🎯 [DEBUG] Validando ubicación para usuario:', usuarioId);
      console.log('🎯 [DEBUG] Coordenadas recibidas:', { latitude, longitude });
      
      // Verificar el tipo de usuario desde el request autenticado
      const tipoUsuario = req.usuario?.tipo_usuario;
      console.log('👤 [DEBUG] Tipo de usuario:', tipoUsuario);
      
      // Si es usuario de visita, aplicar reglas más flexibles
      if (tipoUsuario === 'visita') {
        console.log('🚗 [VISITA] Usuario de visita detectado - aplicando validación flexible');
        
        // Para usuarios de visita, usar tolerancia muy amplia o solo verificar que esté en Colombia
        const toleranciaVisita = 5000; // 5km de tolerancia para visitas
        
        // Obtener la regional del usuario para referencia
        const regional = await RegionalModel.obtenerPorUsuario(usuarioId);
        
        if (regional && regional.latitud && regional.longitud) {
          const regionalLat = typeof regional.latitud === 'string' ? parseFloat(regional.latitud) : Number(regional.latitud);
          const regionalLng = typeof regional.longitud === 'string' ? parseFloat(regional.longitud) : Number(regional.longitud);
          
          if (!isNaN(regionalLat) && !isNaN(regionalLng)) {
            const distancia = JornadaController.calcularDistancia(
              latitude,
              longitude,
              regionalLat,
              regionalLng
            );
            
            console.log('🚗 [VISITA] Validación flexible:', {
              distancia: Math.round(distancia),
              tolerancia: toleranciaVisita,
              valida: distancia <= toleranciaVisita,
              mensaje: 'Usuario de visita - tolerancia amplia aplicada'
            });
            
            return {
              valida: distancia <= toleranciaVisita,
              distancia,
              tolerancia: toleranciaVisita,
              ubicacion: {
                nombre: `${regional.nombre} (Visita)`,
                latitud: regionalLat,
                longitud: regionalLng
              },
              tipoValidacion: 'visita_flexible'
            };
          }
        }
        
        // Si no hay regional o hay error, permitir acceso para visitas
        console.log('🚗 [VISITA] Sin restricción de ubicación para usuario de visita');
        return {
          valida: true,
          distancia: 0,
          tolerancia: toleranciaVisita,
          ubicacion: {
            nombre: 'Ubicación de visita',
            latitud: latitude,
            longitud: longitude
          },
          tipoValidacion: 'visita_flexible'
        };
      }
      
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
      console.log('🎯 [DEBUG] Datos del usuario:', resultUsuario);
      
      if (resultUsuario.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      // Query adicional para debugging - verificar la relación usuario-regional
      const debugQuery = `
        SELECT 
          u.id as usuario_id,
          u.nombre as usuario_nombre,
          u.regional_id,
          r.id as regional_id_real,
          r.nombre as regional_nombre,
          r.latitud as regional_latitud,
          r.longitud as regional_longitud
        FROM usuarios u
        LEFT JOIN regionales r ON u.regional_id = r.id
        WHERE u.id = ?
      `;
      const debugResult = await executeQuery(debugQuery, [usuarioId]);
      console.log('🎯 [DEBUG] Relación usuario-regional:', debugResult);
      
      const usuario = resultUsuario[0] as UsuarioUbicacion;
      
      // Si el usuario tiene ubicación específica asignada
      if (usuario.ubicacion_trabajo_latitud && usuario.ubicacion_trabajo_longitud) {
        const distancia = JornadaController.calcularDistancia(
          latitude,
          longitude,
          usuario.ubicacion_trabajo_latitud,
          usuario.ubicacion_trabajo_longitud
        );
        
        const tolerancia = usuario.tolerancia_ubicacion_metros || 5;
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
        console.log('🎯 [DEBUG] Usuario tiene regional_id:', usuario.regional_id);
        const regional = await RegionalModel.obtenerPorUsuario(usuarioId);
        console.log('🎯 [DEBUG] Regional obtenida:', regional);
        
        if (regional && regional.latitud && regional.longitud) {
          console.log('🎯 [DEBUG] Tipos de coordenadas originales:', {
            latitud_original: regional.latitud,
            longitud_original: regional.longitud,
            latitud_tipo: typeof regional.latitud,
            longitud_tipo: typeof regional.longitud
          });
          
          // Convertir coordenadas de string a number si es necesario
          const regionalLat = typeof regional.latitud === 'string' ? parseFloat(regional.latitud) : Number(regional.latitud);
          const regionalLng = typeof regional.longitud === 'string' ? parseFloat(regional.longitud) : Number(regional.longitud);
          
          console.log('🎯 [DEBUG] Coordenadas convertidas:', {
            latitud_convertida: regionalLat,
            longitud_convertida: regionalLng,
            latitud_es_numero: !isNaN(regionalLat),
            longitud_es_numero: !isNaN(regionalLng)
          });
          
          if (!isNaN(regionalLat) && !isNaN(regionalLng)) {
            console.log('🎯 [DEBUG] Coordenadas de la regional válidas:', { 
              latitud: regionalLat, 
              longitud: regionalLng 
            });
            
            const distancia = JornadaController.calcularDistancia(
              latitude,
              longitude,
              regionalLat,
              regionalLng
            );
          
          console.log('🎯 [DEBUG] Distancia calculada:', distancia);
          
          // 🚀 TOLERANCIA INTELIGENTE BASADA EN DISPOSITIVO
          const tolerancia = JornadaController.calcularToleranciaInteligente(req, distancia);
          const valida = distancia <= tolerancia;
          
          console.log('🎯 [DEBUG] Validación:', { 
            distancia: Math.round(distancia), 
            tolerancia, 
            valida,
            regional_nombre: regional.nombre,
            usuario_coords: { latitude, longitude },
            regional_coords: { latitud: regional.latitud, longitud: regional.longitud }
          });
          
            return {
              valida,
              distancia,
              tolerancia,
              ubicacion: {
                nombre: regional.nombre,
                latitud: regionalLat,
                longitud: regionalLng
              },
              tipoValidacion: 'regional'
            };
          } else {
            console.log('🎯 [DEBUG] Coordenadas no válidas después de conversión');
          }
        } else {
          console.log('🎯 [DEBUG] Regional sin coordenadas o son null/undefined');
        }
      } else {
        console.log('🎯 [DEBUG] Usuario sin regional_id asignada');
      }
      
      // Si no hay ubicación específica ni regional configurada
      console.log('🎯 [DEBUG] Sin ubicación específica ni regional - permitiendo acceso');
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
   * 🚀 TOLERANCIA INTELIGENTE GPS
   * Calcula tolerancia dinámica basada en tipo de dispositivo y precisión GPS
   */
  private static calcularToleranciaInteligente(req: AuthenticatedRequest, distancia: number): number {
    // Analizar headers para detectar tipo de dispositivo
    const userAgent = req.get('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isDesktop = !isMobile && /Windows|Mac|Linux/i.test(userAgent);
    
    // Tolerancias base
    const TOLERANCIA_MOVIL = 50;     // 50m para móviles con GPS
    const TOLERANCIA_LAPTOP = 750;   // 750m para laptops con WiFi
    const TOLERANCIA_OFICINA = 100;  // 100m para oficinas
    
    // Detección de contexto
    let tolerancia: number;
    
    if (isMobile) {
      // Móvil: GPS real disponible, tolerancia estricta
      tolerancia = TOLERANCIA_MOVIL;
      console.log('📱 [TOLERANCIA] Dispositivo móvil detectado - GPS precisión:', tolerancia + 'm');
    } else if (isDesktop) {
      // Desktop/Laptop: Usar WiFi/IP, tolerancia relajada
      tolerancia = TOLERANCIA_LAPTOP;
      console.log('💻 [TOLERANCIA] Laptop/Desktop detectado - WiFi tolerancia:', tolerancia + 'm');
    } else {
      // Desconocido: tolerancia intermedia
      tolerancia = TOLERANCIA_OFICINA;
      console.log('❓ [TOLERANCIA] Dispositivo desconocido - tolerancia por defecto:', tolerancia + 'm');
    }
    
    // Ajuste dinámico basado en distancia actual
    if (distancia > 200 && distancia < 1000) {
      // Si estás "cerca pero no tanto", dar un poco más de tolerancia
      tolerancia = Math.max(tolerancia, distancia * 1.2);
      console.log('📊 [TOLERANCIA] Ajuste dinámico aplicado:', Math.round(tolerancia) + 'm');
    }
    
    // Log final
    console.log('✅ [TOLERANCIA] Final:', {
      userAgent: userAgent.substring(0, 50) + '...',
      isMobile,
      isDesktop,
      distanciaReal: Math.round(distancia),
      toleranciaAplicada: Math.round(tolerancia),
      aprobado: distancia <= tolerancia
    });
    
    return Math.round(tolerancia);
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