// ================================================
// Controlador para Tiempo Laboral Global OXITRANS
// ================================================

import { Request, Response } from 'express';
import { JornadaConfigModel, jornadaConfigModel, JornadaConfigData } from '../models/JornadaConfigModel';
import { AuthenticatedRequest } from '../types/auth';

class JornadaConfigController {
  private jornadaConfigModel: JornadaConfigModel;

  constructor() {
    this.jornadaConfigModel = jornadaConfigModel;
  }

  /**
   * Obtener configuración de jornada para un usuario específico
   * GET /api/jornada-config/:usuarioId
   */
  obtenerConfiguracion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { usuarioId } = req.params;
      const usuarioIdNum = parseInt(usuarioId);

      if (isNaN(usuarioIdNum) || usuarioIdNum <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de usuario inválido'
        });
        return;
      }

      // Verificar que el usuario autenticado puede acceder a esta configuración
      const usuarioAutenticado = req.usuario!;
      if (usuarioAutenticado.id !== usuarioIdNum && usuarioAutenticado.rol !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a esta configuración'
        });
        return;
      }

      const configuracion = await this.jornadaConfigModel.obtenerPorUsuarioId(usuarioIdNum);

      if (!configuracion) {
        res.status(404).json({
          success: false,
          error: 'No se encontró configuración para este usuario'
        });
        return;
      }

      res.json({
        success: true,
        data: configuracion
      });

    } catch (error) {
      console.error('Error obteniendo configuración de jornada:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Crear nueva configuración de jornada laboral
   * POST /api/jornada-config
   */
  crearConfiguracion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { horaEntrada, tiempoTrabajoDia, usuarioId, activa = true } = req.body;

      // Validaciones
      const errorsValidacion = this.validarDatos({ horaEntrada, tiempoTrabajoDia, usuarioId });
      if (errorsValidacion.length > 0) {
        res.status(400).json({
          success: false,
          error: errorsValidacion.join(', ')
        });
        return;
      }

      // Verificar permisos (solo admin o el propio usuario)
      const usuarioAutenticado = req.usuario!;
      if (usuarioAutenticado.id !== usuarioId && usuarioAutenticado.rol !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para crear esta configuración'
        });
        return;
      }

      // Verificar que no existe ya una configuración para este usuario
      const configuracionExistente = await this.jornadaConfigModel.obtenerPorUsuarioId(usuarioId);
      if (configuracionExistente) {
        res.status(409).json({
          success: false,
          error: 'Ya existe una configuración para este usuario. Use PUT para actualizar.'
        });
        return;
      }

      // Calcular hora de fin automáticamente
      const finJornadaLaboral = this.calcularHoraFin(horaEntrada, tiempoTrabajoDia);

      const datosConfiguracion: Omit<JornadaConfigData, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
        horaEntrada,
        tiempoTrabajoDia: parseFloat(tiempoTrabajoDia),
        finJornadaLaboral,
        usuarioId: parseInt(usuarioId),
        activa: Boolean(activa)
      };

      const configuracionCreada = await this.jornadaConfigModel.crear(datosConfiguracion);

      res.status(201).json({
        success: true,
        data: configuracionCreada,
        message: 'Configuración de jornada laboral creada exitosamente'
      });

    } catch (error) {
      console.error('Error creando configuración de jornada:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar configuración de jornada laboral existente
   * PUT /api/jornada-config/:id
   */
  actualizarConfiguracion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const configId = parseInt(id);

      if (isNaN(configId) || configId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de configuración inválido'
        });
        return;
      }

      // Verificar que la configuración existe
      const configuracionExistente = await this.jornadaConfigModel.obtenerPorId(configId);
      if (!configuracionExistente) {
        res.status(404).json({
          success: false,
          error: 'Configuración no encontrada'
        });
        return;
      }

      // Verificar permisos
      const usuarioAutenticado = req.usuario!;
      if (usuarioAutenticado.id !== configuracionExistente.usuarioId && usuarioAutenticado.rol !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para actualizar esta configuración'
        });
        return;
      }

      const { horaEntrada, tiempoTrabajoDia, activa } = req.body;

      // Validaciones de los datos que se van a actualizar
      const datosActualizacion: Partial<JornadaConfigData> = {};

      if (horaEntrada !== undefined) {
        if (!this.validarHora(horaEntrada)) {
          res.status(400).json({
            success: false,
            error: 'Hora de entrada inválida. Use formato HH:MM'
          });
          return;
        }
        datosActualizacion.horaEntrada = horaEntrada;
      }

      if (tiempoTrabajoDia !== undefined) {
        const tiempoNum = parseFloat(tiempoTrabajoDia);
        if (isNaN(tiempoNum) || tiempoNum <= 0 || tiempoNum > 12) {
          res.status(400).json({
            success: false,
            error: 'Tiempo de trabajo debe estar entre 0.5 y 12 horas'
          });
          return;
        }
        datosActualizacion.tiempoTrabajoDia = tiempoNum;
      }

      if (activa !== undefined) {
        datosActualizacion.activa = Boolean(activa);
      }

      // Recalcular hora de fin si se modificó entrada o tiempo de trabajo
      if (datosActualizacion.horaEntrada || datosActualizacion.tiempoTrabajoDia) {
        const horaEntradaFinal = datosActualizacion.horaEntrada || configuracionExistente.horaEntrada;
        const tiempoTrabajoFinal = datosActualizacion.tiempoTrabajoDia || configuracionExistente.tiempoTrabajoDia;
        
        datosActualizacion.finJornadaLaboral = this.calcularHoraFin(horaEntradaFinal, tiempoTrabajoFinal);
      }

      const configuracionActualizada = await this.jornadaConfigModel.actualizar(configId, datosActualizacion);

      res.json({
        success: true,
        data: configuracionActualizada,
        message: 'Configuración actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando configuración de jornada:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Eliminar configuración de jornada laboral
   * DELETE /api/jornada-config/:id
   */
  eliminarConfiguracion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const configId = parseInt(id);

      if (isNaN(configId) || configId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de configuración inválido'
        });
        return;
      }

      // Verificar que la configuración existe
      const configuracionExistente = await this.jornadaConfigModel.obtenerPorId(configId);
      if (!configuracionExistente) {
        res.status(404).json({
          success: false,
          error: 'Configuración no encontrada'
        });
        return;
      }

      // Verificar permisos (solo admin puede eliminar)
      const usuarioAutenticado = req.usuario!;
      if (usuarioAutenticado.rol !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden eliminar configuraciones'
        });
        return;
      }

      await this.jornadaConfigModel.eliminar(configId);

      res.json({
        success: true,
        message: 'Configuración eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando configuración de jornada:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener todas las configuraciones (solo para administradores)
   * GET /api/jornada-config/todas
   */
  obtenerTodasConfiguraciones = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Verificar permisos de administrador
      const usuarioAutenticado = req.usuario!;
      if (usuarioAutenticado.rol !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden acceder a todas las configuraciones'
        });
        return;
      }

      const configuraciones = await this.jornadaConfigModel.obtenerTodas();

      res.json({
        success: true,
        data: configuraciones,
        total: configuraciones.length
      });

    } catch (error) {
      console.error('Error obteniendo todas las configuraciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  // ================================================
  // Métodos de utilidad privados
  // ================================================

  /**
   * Validar datos de entrada
   */
  private validarDatos(datos: { horaEntrada: string; tiempoTrabajoDia: number; usuarioId: number }): string[] {
    const errores: string[] = [];

    if (!datos.horaEntrada || !this.validarHora(datos.horaEntrada)) {
      errores.push('Hora de entrada inválida. Use formato HH:MM');
    }

    if (!datos.tiempoTrabajoDia || isNaN(datos.tiempoTrabajoDia) || datos.tiempoTrabajoDia <= 0 || datos.tiempoTrabajoDia > 12) {
      errores.push('Tiempo de trabajo debe estar entre 0.5 y 12 horas');
    }

    if (!datos.usuarioId || isNaN(datos.usuarioId) || datos.usuarioId <= 0) {
      errores.push('ID de usuario inválido');
    }

    return errores;
  }

  /**
   * Validar formato de hora HH:MM
   */
  private validarHora(hora: string): boolean {
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return horaRegex.test(hora);
  }

  /**
   * Calcular hora de fin basada en entrada y tiempo de trabajo
   */
  private calcularHoraFin(horaEntrada: string, tiempoTrabajoDia: number): string {
    try {
      const [horas, minutos] = horaEntrada.split(':').map(Number);
      const fechaInicio = new Date();
      fechaInicio.setHours(horas, minutos, 0, 0);
      
      // Agregar tiempo de trabajo + 1 hora de almuerzo
      const tiempoTotalMs = (tiempoTrabajoDia + 1) * 60 * 60 * 1000;
      const fechaFin = new Date(fechaInicio.getTime() + tiempoTotalMs);
      
      return `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculando hora de fin:', error);
      return '17:00'; // Valor por defecto
    }
  }

  // ================================================
  // MÉTODOS PARA CONFIGURACIÓN GLOBAL EMPRESARIAL
  // ================================================

  /**
   * Obtener tiempo laboral global OXITRANS
   * GET /api/jornada-config/global
   */
  obtenerConfiguracionGlobal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🔍 [tiempoLaboral] Obteniendo configuración global OXITRANS');
      
      // Permitir acceso a cualquier usuario autenticado
      // const usuarioAutenticado = req.usuario!;
      // No se realiza verificación de rol

      const configuracion = await this.jornadaConfigModel.obtenerConfiguracionGlobal();

      if (configuracion) {
        // Retornar datos en formato BD parseando números correctamente
        const tiempoLaboralData = {
          id: configuracion.id,
          hora_entrada: configuracion.horaEntrada,
          tiempo_trabajo_dia: parseFloat(configuracion.tiempoTrabajoDia.toString()),
          fin_jornada_laboral: configuracion.finJornadaLaboral,
          fecha_actualizacion: configuracion.fechaActualizacion
        };

        console.log('✅ [tiempoLaboral] Configuración global encontrada:', tiempoLaboralData);
        
        res.json({
          success: true,
          data: tiempoLaboralData
        });
      } else {
        console.log('📝 [tiempoLaboral] No existe configuración global');
        
        res.json({
          success: true,
          data: null
        });
      }

    } catch (error) {
      console.error('❌ [tiempoLaboral] Error obteniendo configuración global:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar/Crear configuración global OXITRANS
   * POST /api/jornada-config/global
   */
  crearConfiguracionGlobal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    console.log('🚀 [tiempoLaboral] ===== ACTUALIZANDO TIEMPO LABORAL GLOBAL =====');
    
    try {
      const { hora_entrada, tiempo_trabajo_dia, fin_jornada_laboral } = req.body;

      // Solo admins pueden crear/actualizar configuración global
      const usuarioAutenticado = req.usuario!;
      if (usuarioAutenticado.rol !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden configurar el tiempo laboral global'
        });
        return;
      }

      // Validaciones con parsing seguro
      const tiempoTrabajoNum = parseFloat(tiempo_trabajo_dia?.toString() || '0');
      const errorsValidacion = this.validarTiempoLaboralGlobal({ 
        hora_entrada, 
        tiempo_trabajo_dia: tiempoTrabajoNum 
      });
      if (errorsValidacion.length > 0) {
        res.status(400).json({
          success: false,
          error: errorsValidacion.join(', ')
        });
        return;
      }

      // Verificar si existe configuración global
      const configuracionExistente = await this.jornadaConfigModel.obtenerConfiguracionGlobal();
      
      let configuracionActualizada;
      
      if (configuracionExistente) {
        // Actualizar configuración existente
        const datosActualizacion = {
          horaEntrada: hora_entrada,
          tiempoTrabajoDia: tiempoTrabajoNum,
          finJornadaLaboral: fin_jornada_laboral || this.calcularHoraFin(hora_entrada, tiempoTrabajoNum),
          activa: true
        };

        configuracionActualizada = await this.jornadaConfigModel.actualizarConfiguracionGlobal(
          configuracionExistente.id!, 
          datosActualizacion
        );
      } else {
        // Crear nueva configuración global
        const datosConfiguracion = {
          horaEntrada: hora_entrada,
          tiempoTrabajoDia: tiempoTrabajoNum,
          finJornadaLaboral: fin_jornada_laboral || this.calcularHoraFin(hora_entrada, tiempoTrabajoNum),
          activa: true,
          usuarioId: 0 // Configuración global (usuarioId 0 indica configuración empresarial)
        };

        configuracionActualizada = await this.jornadaConfigModel.crear(datosConfiguracion);
      }

      // Retornar datos en formato BD parseando números correctamente
      const respuesta = {
        id: configuracionActualizada.id,
        hora_entrada: configuracionActualizada.horaEntrada,
        tiempo_trabajo_dia: parseFloat(configuracionActualizada.tiempoTrabajoDia.toString()),
        fin_jornada_laboral: configuracionActualizada.finJornadaLaboral,
        fecha_actualizacion: configuracionActualizada.fechaActualizacion || new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        message: 'Tiempo laboral global actualizado exitosamente',
        data: respuesta
      });

    } catch (error: any) {
      console.error('❌ [jornadaConfigController] ERROR COMPLETO creando configuración global:', error);
      console.error('❌ [jornadaConfigController] Stack trace:', error.stack);
      console.error('❌ [jornadaConfigController] Error message:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar configuración GLOBAL empresarial existente
   * PUT /api/jornada-config/global/:id
   */
  actualizarConfiguracionGlobal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const configId = parseInt(id);

      if (isNaN(configId) || configId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de configuración inválido'
        });
        return;
      }

      // Solo admins pueden actualizar configuración global
      const usuarioAutenticado = req.usuario!;
      if (usuarioAutenticado.rol !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden actualizar configuración empresarial'
        });
        return;
      }

      const { horaEntrada, tiempoTrabajoDia, activa } = req.body;

      // Validar que al menos un campo esté presente
      if (!horaEntrada && !tiempoTrabajoDia && activa === undefined) {
        res.status(400).json({
          success: false,
          error: 'Debe proporcionar al menos un campo para actualizar'
        });
        return;
      }

      // Validaciones de los campos proporcionados
      const errorsValidacion = this.validarDatosGlobales({ horaEntrada, tiempoTrabajoDia });
      if (errorsValidacion.length > 0) {
        res.status(400).json({
          success: false,
          error: errorsValidacion.join(', ')
        });
        return;
      }

      // Preparar datos para actualizar
      const datosActualizacion: any = {};
      
      if (horaEntrada) {
        datosActualizacion.horaEntrada = horaEntrada;
      }
      
      if (tiempoTrabajoDia) {
        datosActualizacion.tiempoTrabajoDia = parseFloat(tiempoTrabajoDia);
      }
      
      if (activa !== undefined) {
        datosActualizacion.activa = Boolean(activa);
      }

      // Recalcular hora de fin si se cambia entrada o tiempo
      if (horaEntrada || tiempoTrabajoDia) {
        // Obtener configuración actual para completar datos faltantes
        const configActual = await this.jornadaConfigModel.obtenerPorId(configId);
        if (!configActual) {
          res.status(404).json({
            success: false,
            error: 'Configuración global no encontrada'
          });
          return;
        }

        const horaEntradaFinal = horaEntrada || configActual.horaEntrada;
        const tiempoTrabajoFinal = tiempoTrabajoDia || configActual.tiempoTrabajoDia;
        
        datosActualizacion.finJornadaLaboral = this.calcularHoraFin(horaEntradaFinal, tiempoTrabajoFinal);
      }

      const configuracionActualizada = await this.jornadaConfigModel.actualizarConfiguracionGlobal(configId, datosActualizacion);

      res.json({
        success: true,
        message: 'Configuración global empresarial actualizada exitosamente',
        data: configuracionActualizada
      });

    } catch (error) {
      console.error('Error actualizando configuración global:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Validar datos para tiempo laboral global OXITRANS
   */
  private validarTiempoLaboralGlobal(data: { hora_entrada?: string; tiempo_trabajo_dia?: number }): string[] {
    const errores: string[] = [];

    if (data.hora_entrada && !this.validarHora(data.hora_entrada)) {
      errores.push('Formato de hora de inicio inválido (debe ser HH:MM)');
    }

    if (data.tiempo_trabajo_dia !== undefined) {
      if (isNaN(data.tiempo_trabajo_dia) || data.tiempo_trabajo_dia <= 0) {
        errores.push('Las horas de trabajo deben ser un número positivo');
      }

      if (data.tiempo_trabajo_dia < 4) {
        errores.push('Mínimo 4 horas de trabajo por jornada laboral');
      }

      if (data.tiempo_trabajo_dia > 10) {
        errores.push('Máximo 10 horas por regulaciones laborales colombianas');
      }
    }

    return errores;
  }

  /**
   * Validar datos para configuración global (sin usuarioId) - LEGACY
   */
  private validarDatosGlobales(data: { horaEntrada?: string; tiempoTrabajoDia?: number }): string[] {
    const errores: string[] = [];

    if (data.horaEntrada && !this.validarHora(data.horaEntrada)) {
      errores.push('Formato de hora de entrada inválido (debe ser HH:MM)');
    }

    if (data.tiempoTrabajoDia !== undefined) {
      if (isNaN(data.tiempoTrabajoDia) || data.tiempoTrabajoDia <= 0) {
        errores.push('El tiempo de trabajo debe ser un número positivo');
      }

      if (data.tiempoTrabajoDia > 12) {
        errores.push('El tiempo de trabajo no puede exceder 12 horas por regulaciones laborales');
      }
    }

    return errores;
  }
}

export const jornadaConfigController = new JornadaConfigController();