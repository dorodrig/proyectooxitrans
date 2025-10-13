// ====================================
// 🛡️ SERVICIO DE MANEJO DE ERRORES
// Gestión centralizada de errores y excepciones
// ====================================

import type { ValidacionResult } from './validadorColombiano';

export interface ErrorInfo {
  codigo: string;
  titulo: string;
  mensaje: string;
  tipo: 'network' | 'validation' | 'authentication' | 'authorization' | 'server' | 'client' | 'unknown';
  esRecuperable: boolean;
  sugerencias?: string[];
  accionesDisponibles?: ErrorAction[];
}

export interface ErrorAction {
  texto: string;
  tipo: 'primary' | 'secondary' | 'danger';
  callback: () => void | Promise<void>;
}

export class ManejadorErrores {
  
  // ======== ANÁLISIS DE ERRORES HTTP ========
  static analizarErrorHttp(error: any): ErrorInfo {
    // Error de red
    if (!error.response) {
      return {
        codigo: 'NETWORK_ERROR',
        titulo: 'Error de Conexión',
        mensaje: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        tipo: 'network',
        esRecuperable: true,
        sugerencias: [
          'Verifica tu conexión a internet',
          'Intenta recargar la página',
          'Si el problema persiste, contacta al administrador'
        ]
      };
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return this.manejarError400(data);
      case 401:
        return this.manejarError401(data);
      case 403:
        return this.manejarError403(data);
      case 404:
        return this.manejarError404(data);
      case 422:
        return this.manejarError422(data);
      case 429:
        return this.manejarError429(data);
      case 500:
        return this.manejarError500(data);
      case 502:
      case 503:
      case 504:
        return this.manejarErrorServidor(status, data);
      default:
        return this.manejarErrorDesconocido(status, data);
    }
  }

  // ======== ERRORES ESPECÍFICOS ========
  private static manejarError400(data: any): ErrorInfo {
    return {
      codigo: 'BAD_REQUEST',
      titulo: 'Solicitud Inválida',
      mensaje: data?.message || 'Los datos enviados no son válidos.',
      tipo: 'validation',
      esRecuperable: true,
      sugerencias: [
        'Verifica que todos los campos estén correctamente diligenciados',
        'Revisa el formato de los datos ingresados',
        'Intenta nuevamente con información válida'
      ]
    };
  }

  private static manejarError401(_data: any): ErrorInfo {
    return {
      codigo: 'UNAUTHORIZED',
      titulo: 'Sesión Expirada',
      mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      tipo: 'authentication',
      esRecuperable: true,
      sugerencias: [
        'Inicia sesión nuevamente',
        'Verifica tus credenciales'
      ],
      accionesDisponibles: [
        {
          texto: 'Iniciar Sesión',
          tipo: 'primary',
          callback: () => {
            window.location.href = '/login';
          }
        }
      ]
    };
  }

  private static manejarError403(_data: any): ErrorInfo {
    return {
      codigo: 'FORBIDDEN',
      titulo: 'Acceso Denegado',
      mensaje: 'No tienes permisos para realizar esta acción.',
      tipo: 'authorization',
      esRecuperable: false,
      sugerencias: [
        'Contacta al administrador del sistema',
        'Verifica que tu rol tenga los permisos necesarios'
      ]
    };
  }

  private static manejarError404(data: any): ErrorInfo {
    return {
      codigo: 'NOT_FOUND',
      titulo: 'Recurso No Encontrado',
      mensaje: data?.message || 'La información solicitada no existe o fue eliminada.',
      tipo: 'client',
      esRecuperable: true,
      sugerencias: [
        'Verifica que el ID o documento sea correcto',
        'El colaborador puede haber sido eliminado del sistema',
        'Intenta con un término de búsqueda diferente'
      ]
    };
  }

  private static manejarError422(data: any): ErrorInfo {
    const erroresValidacion = data?.errors || {};
    const primerError = Object.values(erroresValidacion)[0] as string[] | undefined;
    
    return {
      codigo: 'VALIDATION_ERROR',
      titulo: 'Error de Validación',
      mensaje: primerError?.[0] || data?.message || 'Los datos no pasaron la validación.',
      tipo: 'validation',
      esRecuperable: true,
      sugerencias: Object.keys(erroresValidacion).map(
        campo => `${campo}: ${erroresValidacion[campo][0]}`
      )
    };
  }

  private static manejarError429(_data: any): ErrorInfo {
    return {
      codigo: 'RATE_LIMIT',
      titulo: 'Demasiadas Solicitudes',
      mensaje: 'Has enviado muchas solicitudes. Espera un momento antes de intentar nuevamente.',
      tipo: 'client',
      esRecuperable: true,
      sugerencias: [
        'Espera 1-2 minutos antes de intentar nuevamente',
        'Evita hacer múltiples búsquedas consecutivas'
      ]
    };
  }

  private static manejarError500(_data: any): ErrorInfo {
    return {
      codigo: 'SERVER_ERROR',
      titulo: 'Error Interno del Servidor',
      mensaje: 'Ocurrió un error interno. Nuestro equipo ha sido notificado.',
      tipo: 'server',
      esRecuperable: true,
      sugerencias: [
        'Intenta nuevamente en unos minutos',
        'Si el problema persiste, reporta el error',
        'Guarda tu trabajo y recarga la página'
      ]
    };
  }

  private static manejarErrorServidor(status: number, _data: any): ErrorInfo {
    return {
      codigo: 'SERVICE_UNAVAILABLE',
      titulo: 'Servicio No Disponible',
      mensaje: `El servidor está temporalmente no disponible (${status}).`,
      tipo: 'server',
      esRecuperable: true,
      sugerencias: [
        'El servicio puede estar en mantenimiento',
        'Intenta nuevamente en 5-10 minutos',
        'Contacta al soporte si el problema continúa'
      ]
    };
  }

  private static manejarErrorDesconocido(status: number, _data: any): ErrorInfo {
    return {
      codigo: 'UNKNOWN_ERROR',
      titulo: 'Error Inesperado',
      mensaje: `Ocurrió un error inesperado (${status}). Por favor, reporta este problema.`,
      tipo: 'unknown',
      esRecuperable: true,
      sugerencias: [
        'Recarga la página e intenta nuevamente',
        'Reporta este error al equipo técnico',
        'Incluye el código de error en tu reporte'
      ]
    };
  }

  // ======== VALIDACIÓN DE DATOS FALTANTES ========
  static validarDatosRequeridos(datos: Record<string, any>, camposRequeridos: string[]): ValidacionResult {
    const camposFaltantes: string[] = [];
    
    for (const campo of camposRequeridos) {
      const valor = datos[campo];
      if (valor === null || valor === undefined || valor === '') {
        camposFaltantes.push(campo);
      }
    }

    if (camposFaltantes.length > 0) {
      return {
        esValido: false,
        mensaje: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}`,
        tipo: 'error',
        sugerencias: camposFaltantes.map(campo => `Complete el campo: ${campo}`)
      };
    }

    return {
      esValido: true,
      mensaje: 'Todos los campos requeridos están presentes',
      tipo: 'success'
    };
  }

  // ======== MENSAJES DE ERROR CONTEXTUALES ========
  static obtenerMensajeContextual(contexto: string, error: ErrorInfo): string {
    const mensajes = {
      busqueda: {
        network: 'No se pudo realizar la búsqueda. Verifica tu conexión.',
        validation: 'Los criterios de búsqueda no son válidos.',
        authentication: 'Debes iniciar sesión para realizar búsquedas.',
        not_found: 'No se encontraron colaboradores con los criterios especificados.',
        server: 'Error en el servidor durante la búsqueda.'
      },
      carga_datos: {
        network: 'No se pudieron cargar los datos del colaborador.',
        authentication: 'Tu sesión expiró durante la carga de datos.',
        not_found: 'El colaborador solicitado no existe.',
        server: 'Error del servidor al cargar la información.'
      },
      reportes: {
        network: 'No se pudo generar el reporte. Verifica tu conexión.',
        server: 'Error del servidor durante la generación del reporte.',
        validation: 'Los datos para el reporte no son válidos.'
      }
    };

    const mensajesContexto = (mensajes as any)[contexto];
    if (mensajesContexto && mensajesContexto[error.tipo]) {
      return mensajesContexto[error.tipo];
    }

    return error.mensaje;
  }

  // ======== RETRY AUTOMÁTICO ========
  static async reintentar<T>(
    operacion: () => Promise<T>,
    maxReintentos: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let ultimoError: any;
    
    for (let intento = 0; intento <= maxReintentos; intento++) {
      try {
        return await operacion();
      } catch (error) {
        ultimoError = error;
        
        const errorInfo = this.analizarErrorHttp(error);
        
        // No reintentar errores no recuperables
        if (!errorInfo.esRecuperable || intento === maxReintentos) {
          throw error;
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, delayMs * (intento + 1)));
      }
    }
    
    throw ultimoError;
  }

  // ======== LOGGING DE ERRORES ========
  static logearError(error: any, contexto?: string): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      contexto: contexto || 'unknown',
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      }
    };

    console.error('🚨 Error capturado:', errorInfo);

    // En producción, enviar a servicio de logging
    if (process.env.NODE_ENV === 'production') {
      this.enviarErrorAServicio(errorInfo);
    }
  }

  private static async enviarErrorAServicio(errorInfo: any): Promise<void> {
    try {
      // Implementar envío a servicio de monitoreo (Sentry, LogRocket, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      });
    } catch (err) {
      // Fallar silenciosamente para evitar loops infinitos
      console.warn('No se pudo enviar error al servicio de logging');
    }
  }

  // ======== FALLBACKS DE DATOS ========
  static obtenerDatosFallback(tipo: string): any {
    const fallbacks = {
      colaborador: {
        id: 0,
        nombre: 'Información no disponible',
        apellido: '',
        documento: 'N/A',
        telefono: 'No registrado',
        email: 'No registrado',
        activo: false,
        estado: 'inactivo',
        regional_id: 0,
        regional_nombre: 'No asignada'
      },
      jornadas: [],
      ubicaciones: []
    };

    return (fallbacks as any)[tipo] || null;
  }
}

export default ManejadorErrores;