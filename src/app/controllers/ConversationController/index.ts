/* eslint-disable no-await-in-loop */
import { Response } from 'express';

import { RequestAuth, RequestAuthBody } from '@mytypes/requestAuth';

import { RequestError } from '@errors/request';
import { createConversation, indexConversations } from './functions';

interface Create {
  toUserEmail: string;
}

type IndexRequest = RequestAuth;
type CreateRequest = RequestAuthBody<Create>;

class ConversationController {
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;

    const conversations = await indexConversations({ userId });

    return res.json(conversations);
  }

  async create(req: CreateRequest, res: Response) {
    const userId = req.userId as number;
    const { toUserEmail } = req.body;

    try {
      const conversation = await createConversation({
        userId,
        toUserEmail,
      });

      return res.json(conversation);
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ message });
    }
  }
}

export default new ConversationController();
