import { Router } from 'express';

const router = Router();

// Rutas básicas sin validaciones
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint working' });
});

router.get('/verify', (req, res) => {
  res.json({ message: 'Verify endpoint working' });
});

export default router;
