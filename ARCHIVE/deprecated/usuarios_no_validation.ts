import { Router } from 'express';
import { UsuariosController } from '../controllers/UsuariosController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas sin validadores
router.get('/', UsuariosController.getAll);
router.get('/search', UsuariosController.search);
router.get('/departamento/:departamento', UsuariosController.getByDepartamento);
router.get('/:id', UsuariosController.getById);
router.post('/', UsuariosController.create);
router.put('/:id', UsuariosController.update);
router.put('/:id/status', UsuariosController.toggleStatus);
router.post('/:id/reset-password', UsuariosController.resetPassword);
router.delete('/:id', UsuariosController.delete);

export default router;
