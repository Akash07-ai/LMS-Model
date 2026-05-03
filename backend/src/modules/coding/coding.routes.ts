import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as codingController from './coding.controller';

const router = Router();

router.get('/problems/:subjectId', authMiddleware, codingController.getProblemsBySubject);
router.get('/problem/:problemId', authMiddleware, codingController.getProblemById);
router.post('/run', authMiddleware, codingController.runCode);
router.post('/submit', authMiddleware, codingController.submitCode);
router.get('/submissions/:problemId', authMiddleware, codingController.getUserSubmissions);

export default router;
