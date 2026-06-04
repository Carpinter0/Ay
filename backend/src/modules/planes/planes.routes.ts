import { Router } from 'express';
import { getPlanesController } from './planes.controller';

const router = Router();

// GET /api/v1/planes — public, returns all active plans
router.get('/', getPlanesController);

export default router;
