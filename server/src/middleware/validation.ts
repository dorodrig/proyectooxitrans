import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Middleware para validar los resultados de express-validator
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Validaciones para registro de tiempo
 */
export const validarRegistroTiempo = [
  body('tipo')
    .isIn(['entrada', 'almuerzo_inicio', 'almuerzo_fin', 'descanso_manana_inicio', 'descanso_manana_fin', 'descanso_tarde_inicio', 'descanso_tarde_fin', 'salida'])
    .withMessage('Tipo de registro no válido'),
  
  body('timestamp')
    .isISO8601()
    .withMessage('Timestamp debe ser una fecha válida'),
  
  body('ubicacion.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe estar entre -90 y 90'),
  
  body('ubicacion.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe estar entre -180 y 180'),
  
  validateRequest
];

/**
 * Validaciones para validar ubicación
 */
export const validarUbicacion = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe estar entre -90 y 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe estar entre -180 y 180'),
  
  validateRequest
];

/**
 * Validaciones para fechas de consulta
 */
export const validarFechas = [
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser válida'),
  
  body('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser válida'),
  
  validateRequest
];
