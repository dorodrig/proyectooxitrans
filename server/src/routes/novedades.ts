import { Router } from 'express';
import { NovedadesController } from '../controllers/NovedadesController';

const router = Router();

router.post('/', NovedadesController.create);
router.get('/', NovedadesController.getAll);
router.get('/usuario/:usuarioId', NovedadesController.getByUsuario);

export default router;
