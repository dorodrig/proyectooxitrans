import { Router } from 'express';
import { body } from 'express-validator';
import { RegistrosController } from '../controllers/RegistrosController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones para crear registro
const createRegistroValidation = [
  body('usuarioId').isNumeric().withMessage('ID de usuario inválido'),
  body('tipo').isIn(['entrada', 'salida']).withMessage('Tipo de registro inválido'),
  body('latitud').optional().isNumeric().withMessage('Latitud inválida'),
  body('longitud').optional().isNumeric().withMessage('Longitud inválida'),
  body('notas').optional().trim().isLength({ max: 500 }).withMessage('Notas muy largas')
];

// Validaciones para registro rápido
const registroRapidoValidation = [
  body('usuarioId').isNumeric().withMessage('ID de usuario inválido'),
  body('latitud').optional().isNumeric().withMessage('Latitud inválida'),
  body('longitud').optional().isNumeric().withMessage('Longitud inválida')
];

// Rutas
router.get('/', RegistrosController.getAll);
router.get('/today', RegistrosController.getToday);
router.get('/estadisticas', RegistrosController.getEstadisticas);
router.post('/', createRegistroValidation, RegistrosController.create);
router.post('/entrada', registroRapidoValidation, RegistrosController.registrarEntrada);
router.post('/salida', registroRapidoValidation, RegistrosController.registrarSalida);

export default router;
