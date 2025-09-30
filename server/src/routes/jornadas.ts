import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { JornadaController } from '../controllers/jornadaController';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * @route   GET /api/jornadas/actual
 * @desc    Obtener jornada actual del usuario autenticado
 * @access  Private
 */
router.get('/actual', JornadaController.obtenerJornadaActual);

/**
 * @route   POST /api/jornadas/registrar
 * @desc    Registrar evento de tiempo en jornada laboral
 * @access  Private
 */
router.post('/registrar',
  [
    body('tipo')
      .isIn(['entrada', 'descanso_manana_inicio', 'descanso_manana_fin', 
             'almuerzo_inicio', 'almuerzo_fin', 'descanso_tarde_inicio', 
             'descanso_tarde_fin', 'salida'])
      .withMessage('Tipo de registro no válido'),
    
    body('timestamp')
      .isISO8601()
      .withMessage('Timestamp debe ser una fecha válida'),
    
    body('ubicacion.latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud debe estar entre -90 y 90'),
    
    body('ubicacion.longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud debe estar entre -180 y 180'),
    
    body('ubicacion.accuracy')
      .isFloat({ min: 0 })
      .withMessage('Precisión debe ser un número positivo'),
    
    body('observaciones')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Observaciones no pueden exceder 500 caracteres'),
    
    validateRequest
  ],
  JornadaController.registrarTiempo
);

/**
 * @route   POST /api/jornadas/validar-ubicacion
 * @desc    Validar ubicación actual contra regional asignada
 * @access  Private
 */
router.post('/validar-ubicacion',
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud debe estar entre -90 y 90'),
    
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud debe estar entre -180 y 180'),
    
    validateRequest
  ],
  JornadaController.validarUbicacion
);

/**
 * @route   GET /api/jornadas/historial
 * @desc    Obtener historial de jornadas del usuario
 * @access  Private
 */
router.get('/historial',
  [
    query('fechaInicio')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe ser una fecha válida'),
    
    query('fechaFin')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe ser una fecha válida'),
    
    query('limite')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Límite debe estar entre 1 y 100'),
    
    validateRequest
  ],
  JornadaController.obtenerHistorial
);

/**
 * @route   GET /api/jornadas/estadisticas
 * @desc    Obtener estadísticas de jornadas del usuario
 * @access  Private
 */
router.get('/estadisticas',
  [
    query('mes')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Mes debe estar entre 1 y 12'),
    
    query('año')
      .optional()
      .isInt({ min: 2020, max: 2030 })
      .withMessage('Año debe estar entre 2020 y 2030'),
    
    validateRequest
  ],
  JornadaController.obtenerEstadisticas
);

/**
 * @route   POST /api/jornadas/:id/forzar-cierre
 * @desc    Forzar cierre de jornada (solo administradores)
 * @access  Private (Admin only)
 */
router.post('/:id/forzar-cierre',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de jornada debe ser un número positivo'),
    
    body('observaciones')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Observaciones no pueden exceder 500 caracteres'),
    
    validateRequest
  ],
  JornadaController.forzarCierre
);

/**
 * @route   GET /api/jornadas/admin/resumen
 * @desc    Obtener resumen de todas las jornadas (solo administradores)
 * @access  Private (Admin only)
 */
router.get('/admin/resumen',
  [
    query('fecha')
      .optional()
      .isISO8601()
      .withMessage('Fecha debe ser válida'),
    
    query('regional')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de regional debe ser un número positivo'),
    
    query('departamento')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Departamento debe tener entre 1 y 100 caracteres'),
    
    validateRequest
  ],
  JornadaController.obtenerResumenAdmin
);

/**
 * @route   POST /api/jornadas/admin/auto-cerrar
 * @desc    Ejecutar auto-cierre de jornadas de 8+ horas (solo administradores)
 * @access  Private (Admin only)
 */
router.post('/admin/auto-cerrar', JornadaController.ejecutarAutoCierre);

/**
 * @route   GET /api/jornadas/reportes/excel
 * @desc    Generar reporte Excel de jornadas
 * @access  Private (Admin/Supervisor)
 */
router.get('/reportes/excel',
  [
    query('fechaInicio')
      .isISO8601()
      .withMessage('Fecha de inicio es requerida'),
    
    query('fechaFin')
      .isISO8601()
      .withMessage('Fecha de fin es requerida'),
    
    query('usuarioId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número positivo'),
    
    query('departamento')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Departamento debe tener entre 1 y 100 caracteres'),
    
    validateRequest
  ],
  JornadaController.generarReporteExcel
);

export default router;