import { Response } from 'express';

import { assertConversationExists, assertUserOnConversation } from '@controllers/ConversationController/assertions';
import { RequestAuth, RequestAuthParams } from '@mytypes/requestAuth';
import { RequestError } from '@errors/request';

import Conversation from '@schemas/Conversation';
import Message from '@schemas/Message';

type Index = {
  conversationId: string;
};

interface Create {
  text: string;
}

type IndexRequest = RequestAuthParams<Index>;
type CreateRequest = RequestAuth<Create, Index>;

class MessageController {
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;
    const { conversationId } = req.params;

    try {
      const conversation = await assertConversationExists({ _id: conversationId });
      assertUserOnConversation(conversation, userId);
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ message });
    }

    const conversationMessages = await Conversation.findById(conversationId).select('_id toUserId').populate({
      path: 'messages',
      select: '_id text date',
    });

    return res.json(conversationMessages?.messages);
  }

  async create(req: CreateRequest, res: Response) {
    const { conversationId } = req.params;
    const { text } = req.body;

    try {
      await assertConversationExists({ _id: conversationId });
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ message });
    }

    const message = await Message.create({
      text,
      date: new Date(),
    });

    await Conversation.updateOne(
      {
        _id: conversationId,
      },
      {
        $push: { messages: message._id },
      }
    );

    return res.json(message);
  }
}

export default new MessageController();
