import { Router } from 'express';
import { RegionalController } from '../controllers/RegionalController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

router.get('/', RegionalController.getAll);
router.post('/', RegionalController.create);
router.put('/:id', RegionalController.update);
router.delete('/:id', RegionalController.delete);

export default router;
