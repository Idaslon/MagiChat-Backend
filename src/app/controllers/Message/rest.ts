import { Response } from 'express';

import { RequestAuth, RequestAuthParams } from '@mytypes/requestAuth';
import { RequestError } from '@errors/request';

import { createMessage, indexMessages } from './functions';

type Index = {
  conversationId: string;
};

interface Create {
  text: string;
}

type IndexRequest = RequestAuthParams<Index>;
type CreateRequest = RequestAuth<Create, Index>;

class MessageRestController {
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;
    const { conversationId } = req.params;

    try {
      const messages = await indexMessages({
        userId,
        conversationId,
      });

      return res.json(messages);
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ message });
    }
  }

  async create(req: CreateRequest, res: Response) {
    const userId = req.userId as number;

    const { conversationId } = req.params;
    const { text } = req.body;

    try {
      const message = await createMessage({
        text,
        userId,
        conversationId,
      });

      return res.json(message);
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ message });
    }
  }
}

export default new MessageRestController();
