import { Router } from 'express';

import ConversationRestController from '@controllers/Conversation/rest';
import MessageRestController from '@controllers/Message/rest';

import authMiddleware from '@middlewares/auth';

const authRoutes = Router();

authRoutes.use(authMiddleware);

authRoutes.get('/testAuth', async (req, res) => {
  return res.json({ message: 'You are authenticated!' });
});

authRoutes.get('/conversations', ConversationRestController.index);
authRoutes.post('/conversations', ConversationRestController.create);

authRoutes.get('/conversations/:conversationId/messages', MessageRestController.index);
authRoutes.post('/conversations/:conversationId/messages', MessageRestController.create);

export default authRoutes;
