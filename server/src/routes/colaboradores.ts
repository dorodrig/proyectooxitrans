import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { ColaboradoresController } from '../controllers/ColaboradoresController';
import { authenticateToken, requireAdminOrSupervisor } from '../middleware/auth';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Middleware de autorización para admin/supervisor
router.use(requireAdminOrSupervisor);

// Validaciones para búsqueda de colaboradores
const buscarValidation = [
  param('termino')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El término de búsqueda debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('El término solo puede contener letras, números y espacios'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser entre 1 y 100')
];

// Validaciones para historial de jornadas
const historialJornadasValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de colaborador inválido'),
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida (formato: YYYY-MM-DD)'),
  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida (formato: YYYY-MM-DD)'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser entre 1 y 100')
];

// Validaciones para ubicaciones GPS
const ubicacionesValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de colaborador inválido'),
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida (formato: YYYY-MM-DD)'),
  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida (formato: YYYY-MM-DD)'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('El límite debe ser entre 1 y 200')
];

// Validaciones para cálculo de horas extras
const horasExtrasValidation = [
  body('colaborador_id')
    .isInt({ min: 1 })
    .withMessage('ID de colaborador inválido'),
  body('fecha_inicio')
    .isISO8601()
    .withMessage('Fecha de inicio inválida (formato: YYYY-MM-DD)'),
  body('fecha_fin')
    .isISO8601()
    .withMessage('Fecha de fin inválida (formato: YYYY-MM-DD)')
    .custom((fechaFin, { req }) => {
      const fechaInicio = req.body.fecha_inicio;
      if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
        throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
      }
      return true;
    }),
  body('horas_legales_dia')
    .optional()
    .isFloat({ min: 1, max: 12 })
    .withMessage('Las horas legales por día deben estar entre 1 y 12')
];

/**
 * @route GET /api/colaboradores/buscar/:termino
 * @desc Buscar colaboradores por cédula o apellidos
 * @access Admin, Supervisor
 */
router.get('/buscar/:termino', buscarValidation, ColaboradoresController.buscarColaboradores);

/**
 * @route GET /api/colaboradores/:id/jornadas
 * @desc Obtener historial completo de jornadas de un colaborador
 * @access Admin, Supervisor
 */
router.get('/:id/jornadas', historialJornadasValidation, ColaboradoresController.getHistorialJornadas);

/**
 * @route GET /api/colaboradores/:id/ubicaciones
 * @desc Obtener registros de ubicaciones GPS de un colaborador
 * @access Admin, Supervisor
 */
router.get('/:id/ubicaciones', ubicacionesValidation, ColaboradoresController.getUbicacionesGPS);

/**
 * @route POST /api/colaboradores/horas-extras
 * @desc Calcular horas extras de un colaborador en un período
 * @access Admin, Supervisor
 */
router.post('/horas-extras', horasExtrasValidation, ColaboradoresController.calcularHorasExtras);

export default router;