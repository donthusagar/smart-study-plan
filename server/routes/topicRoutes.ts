import { Router } from 'express';
import { getTopics, createTopic, updateTopic, deleteTopic } from '../controllers/topicController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', getTopics);
router.post('/', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

export default router;
