import { Router } from 'express';
import { query } from 'express-validator';
import { ReportesController } from '../controllers/ReportesController';
import { authenticateToken, requireAdminOrSupervisor } from '../middleware/auth';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Middleware de autorización para admin/supervisor
router.use(requireAdminOrSupervisor);

// Validaciones para reporte de jornadas completo
const reporteJornadasValidation = [
  query('fechaInicio')
    .notEmpty()
    .withMessage('Fecha de inicio es requerida')
    .isISO8601()
    .withMessage('Fecha de inicio inválida (formato: YYYY-MM-DD)'),
  query('fechaFin')
    .notEmpty()
    .withMessage('Fecha de fin es requerida')
    .isISO8601()
    .withMessage('Fecha de fin inválida (formato: YYYY-MM-DD)')
    .custom((fechaFin, { req }) => {
      const fechaInicio = req.query?.fechaInicio as string;
      if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
        throw new Error('La fecha fin no puede ser anterior a la fecha inicio');
      }
      
      // Validar que no sea un rango mayor a 3 meses
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diffTime = Math.abs(fin.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 90) {
          throw new Error('El rango de fechas no puede ser mayor a 90 días');
        }
      }
      
      return true;
    }),
  query('formato')
    .optional()
    .isIn(['xlsx', 'csv'])
    .withMessage('Formato debe ser xlsx o csv')
];

// ==========================================
// RUTAS DE REPORTES
// ==========================================

/**
 * GET /api/reportes/jornadas-completo
 * Generar reporte completo de jornadas por rango de fechas
 * Query params:
 * - fechaInicio: string (YYYY-MM-DD) - Fecha inicio del reporte
 * - fechaFin: string (YYYY-MM-DD) - Fecha fin del reporte  
 * - formato: string (xlsx|csv) - Formato de descarga (default: xlsx)
 */
router.get('/jornadas-completo', reporteJornadasValidation, ReportesController.generarReporteJornadasCompleto);

/**
 * GET /api/reportes/preview-jornadas
 * Vista previa del reporte (primeras 10 filas)
 */
router.get('/preview-jornadas', reporteJornadasValidation, ReportesController.previewReporteJornadas);

export default router;