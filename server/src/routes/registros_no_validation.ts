import { Router } from 'express';
import { RegistrosController } from '../controllers/RegistrosController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas sin validadores
router.get('/', RegistrosController.getAll);
router.get('/today', RegistrosController.getToday);
router.get('/estadisticas', RegistrosController.getEstadisticas);
router.post('/', RegistrosController.create);
router.post('/entrada', RegistrosController.registrarEntrada);
router.post('/salida', RegistrosController.registrarSalida);

export default router;
