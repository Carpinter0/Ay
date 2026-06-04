import { Router } from 'express';
import { getPlanes } from './planes.js';

const router = Router();

router.get('/', (req, res, next) => {
  getPlanes(req, res).catch(next);
});

export default router;
