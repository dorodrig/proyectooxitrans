// ================================================
// Rutas para Tiempo Laboral Global OXITRANS
// ================================================

import express from 'express';
import { jornadaConfigController } from '../controllers/jornadaConfigController';
import { authenticateToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting para configuración de tiempo laboral
const tiempoLaboralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máximo 30 requests por ventana por IP
  message: {
    success: false,
    error: 'Demasiadas solicitudes de configuración. Intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para escritura
const writeOperationsLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutos
  max: 10, // 10 operaciones de escritura por ventana
  message: {
    success: false,
    error: 'Demasiadas operaciones de escritura. Espere unos minutos.'
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Aplicar rate limiting a todas las rutas
router.use(tiempoLaboralLimiter);

// ================================================
// RUTAS GLOBALES - CONFIGURACIÓN ÚNICA OXITRANS
// ================================================

/**
 * @route   GET /api/jornada-config/global
 * @desc    Obtener tiempo laboral global OXITRANS
 * @access  Private (solo administradores)
 * @returns Configuración global de tiempo laboral
 */
router.get('/global', jornadaConfigController.obtenerConfiguracionGlobal);

/**
 * @route   POST /api/jornada-config/global
 * @desc    Crear/Actualizar tiempo laboral global OXITRANS
 * @access  Private (solo administradores)
 * @body    { horaInicio, horasTrabajo, horaSalida? }
 * @returns Configuración global actualizada
 */
router.post('/global', writeOperationsLimiter, jornadaConfigController.crearConfiguracionGlobal);

// ================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ================================================

router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ [tiempoLaboral] Error en rutas:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    usuario: (req as any).usuario?.id
  });

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

export default router;