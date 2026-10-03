import { Router } from 'express';
import { getSubjects, createSubject, getSubjectById, updateSubject, deleteSubject } from '../controllers/subjectController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', getSubjects);
router.post('/', createSubject);
router.get('/:id', getSubjectById);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;
