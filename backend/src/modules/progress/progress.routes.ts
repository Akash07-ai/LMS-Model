import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { updateProgress, getProgress, getUserProgress, completeVideo, getCourseProgress } from './progress.controller';
import { getDashboard } from './dashboard.controller';

const router = Router();

router.get('/dashboard', authMiddleware, getDashboard);
router.post('/:videoId/complete', authMiddleware, completeVideo);
router.post('/:videoId', authMiddleware, updateProgress);
router.get('/course/:userId/:courseId', authMiddleware, getCourseProgress);
router.get('/:videoId', authMiddleware, getProgress);
router.get('/', authMiddleware, getUserProgress);

export default router;
