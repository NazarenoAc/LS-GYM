import { Router } from 'express';
import { sesionController } from './sesion.controller';

const router = Router();

// Todas cuelgan de /api/sesiones (ver app.ts)
router.get('/', sesionController.getAll);
router.get('/:id', sesionController.getById);
router.post('/', sesionController.create);
router.put('/:id', sesionController.update);
router.delete('/:id', sesionController.delete);

export default router;
