import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/security';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';
import { getDashboard, getRecommendations, getNotifications, getAchievements } from './modules/progress/dashboard.controller';
import { getUserProgress } from './modules/progress/progress.controller';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import subjectRoutes from './modules/subjects/subjects.routes';
import videoRoutes from './modules/videos/videos.routes';
import progressRoutes from './modules/progress/progress.routes';
import codingRoutes from './modules/coding/coding.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import aiRoutes from './modules/ai/ai.routes';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/subjects', subjectRoutes);
app.use('/videos', videoRoutes);
app.use('/progress', progressRoutes);
app.use('/coding', codingRoutes);
app.use('/', dashboardRoutes);
app.use('/ai', aiRoutes);

app.get('/dashboard-data', authMiddleware, getDashboard);
app.get('/user-progress', authMiddleware, getUserProgress);
app.get('/recommendations', authMiddleware, getRecommendations);
app.get('/notifications', authMiddleware, getNotifications);
app.get('/achievements', authMiddleware, getAchievements);

app.use(errorHandler);

export default app;
