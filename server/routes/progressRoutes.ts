import { Router } from 'express';
import { getProgress } from '../controllers/progressController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', getProgress);

export default router;
