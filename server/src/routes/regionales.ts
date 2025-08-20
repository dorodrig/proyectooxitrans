import { Router } from 'express';
import { RegionalController } from '../controllers/RegionalController';

const router = Router();

router.get('/', RegionalController.getAll);
router.post('/', RegionalController.create);

export default router;
