import { Router } from 'express';
import { askAI } from './ai.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, askAI);

export default router;
