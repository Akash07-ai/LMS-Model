import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { getAllSubjects, getSubjectTree, getSubjectWithSections, getNextUnlockedVideo, getFirstVideo } from './subjects.controller';

const router = Router();

router.get('/', authMiddleware, getAllSubjects);
router.get('/:subjectId/tree', authMiddleware, getSubjectTree);
router.get('/:subjectId/first-video', authMiddleware, getFirstVideo);
router.get('/:subjectId', authMiddleware, getSubjectWithSections);
router.get('/:subjectId/next-video', authMiddleware, getNextUnlockedVideo);

export default router;
