import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';


const router = Router();
// Logout (solo para frontend, no hace nada en backend)
router.post('/logout', (req, res) => {
  // Aquí podrías invalidar el token en una lista negra si lo implementas
  res.status(200).json({ success: true, message: 'Sesión cerrada' });
});

// Rutas públicas
router.post('/login', AuthController.login);
router.post('/registro', AuthController.registro);

// Rutas para restablecimiento de contraseña (públicas)
router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

// Rutas protegidas
router.get('/verify', authenticateToken, AuthController.verifyToken);
router.post('/change-password', authenticateToken, AuthController.changePassword);

export default router;
