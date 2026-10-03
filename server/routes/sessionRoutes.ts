import { Router } from 'express';
import { getSessions, createSession, generateSmartPlan, updateSession, deleteSession } from '../controllers/sessionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', getSessions);
router.post('/', createSession);
router.post('/generate', generateSmartPlan);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
