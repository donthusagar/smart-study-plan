import { Router } from 'express';
import { chatWithAI } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/chat', chatWithAI);

export default router;
