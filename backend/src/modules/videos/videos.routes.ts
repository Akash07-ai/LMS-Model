import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { getVideoById, getNextVideo, getPreviousVideo } from './videos.controller';

const router = Router();

router.get('/:videoId', authMiddleware, getVideoById);
router.get('/:videoId/next', authMiddleware, getNextVideo);
router.get('/:videoId/previous', authMiddleware, getPreviousVideo);

export default router;
