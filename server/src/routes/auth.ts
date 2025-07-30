import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/login', AuthController.login);
router.post('/registro', AuthController.registro);

// Rutas protegidas
router.get('/verify', authenticateToken, AuthController.verifyToken);
router.post('/change-password', authenticateToken, AuthController.changePassword);

export default router;
