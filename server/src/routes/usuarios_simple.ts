import { Router } from 'express';

const router = Router();

// Rutas básicas
router.get('/', (req, res) => {
  res.json({ message: 'Usuarios endpoint working' });
});

export default router;
