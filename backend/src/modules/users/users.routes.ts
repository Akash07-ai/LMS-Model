import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { getCurrentUser } from './users.controller';

const router = Router();

router.get('/me', authMiddleware, getCurrentUser);

export default router;
