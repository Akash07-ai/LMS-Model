import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/security';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import subjectRoutes from './modules/subjects/subjects.routes';
import videoRoutes from './modules/videos/videos.routes';
import progressRoutes from './modules/progress/progress.routes';
import codingRoutes from './modules/coding/coding.routes';

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

app.use(errorHandler);

export default app;
