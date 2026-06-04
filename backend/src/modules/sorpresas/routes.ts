import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { getSorpresas, getSorpresaById, getSorpresasDelMes } from './sorpresas.js';

const router = Router();

router.get('/', authMiddleware, (req, res, next) => {
  getSorpresas(req, res).catch(next);
});

router.get('/del-mes', authMiddleware, (req, res, next) => {
  getSorpresasDelMes(req, res).catch(next);
});

router.get('/:id', authMiddleware, (req, res, next) => {
  getSorpresaById(req, res).catch(next);
});

export default router;
