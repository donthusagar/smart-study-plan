import { Router } from 'express';
import { getPomodoros, createPomodoro } from '../controllers/pomodoroController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', getPomodoros);
router.post('/', createPomodoro);

export default router;
