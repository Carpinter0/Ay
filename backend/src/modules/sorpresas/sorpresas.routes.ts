import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { getSorpresasDelMesController, getSorpresaByIdController } from './sorpresas.controller';

const router = Router();

// GET /api/v1/sorpresas/del-mes
router.get('/del-mes', auth, getSorpresasDelMesController);

// GET /api/v1/sorpresas/:id
router.get('/:id', auth, getSorpresaByIdController);

export default router;
