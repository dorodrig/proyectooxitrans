import { Router } from 'express';

const router = Router();

// Rutas básicas
router.get('/', (req, res) => {
  res.json({ message: 'Registros endpoint working' });
});

export default router;
