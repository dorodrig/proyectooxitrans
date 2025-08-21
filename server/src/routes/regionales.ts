import { Router } from 'express';
import { RegionalController } from '../controllers/RegionalController';

const router = Router();


router.get('/', RegionalController.getAll);
router.post('/', RegionalController.create);
router.put('/:id', RegionalController.update);
router.delete('/:id', RegionalController.delete);

export default router;
