import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { updateProgress, getProgress, getUserProgress } from './progress.controller';

const router = Router();

router.post('/:videoId', authMiddleware, updateProgress);
router.get('/:videoId', authMiddleware, getProgress);
router.get('/', authMiddleware, getUserProgress);

export default router;
