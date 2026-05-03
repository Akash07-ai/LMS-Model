import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as dashboardController from './dashboard.controller';

const router = Router();

router.get('/dashboard-data', authMiddleware, dashboardController.getDashboardData);
router.get('/user-progress', authMiddleware, dashboardController.getUserProgress);
router.get('/recommendations', authMiddleware, dashboardController.getRecommendations);
router.get('/notifications', authMiddleware, dashboardController.getNotifications);
router.get('/achievements', authMiddleware, dashboardController.getAchievements);

export default router;
