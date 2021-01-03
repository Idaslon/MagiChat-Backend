import { Router } from 'express';

import ConversationController from '@controllers/ConversationController';
import authMiddleware from '@middlewares/auth';
import MessageController from '@controllers/MessageController';

const authRoutes = Router();

authRoutes.use(authMiddleware);

authRoutes.get('/testAuth', async (req, res) => {
  return res.json({ message: 'You are authenticated!' });
});

authRoutes.get('/conversations', ConversationController.index);
authRoutes.post('/conversations', ConversationController.create);

authRoutes.get('/conversations/:conversationId/messages', MessageController.index);
authRoutes.post('/conversations/:conversationId/messages', MessageController.create);

export default authRoutes;
