/* eslint-disable no-await-in-loop */
import { Response } from 'express';

import { RequestAuth, RequestAuthBody } from '@mytypes/requestAuth';
import Conversation from '@schemas/Conversation';

import { RequestError } from '@errors/request';
import { assertUserExists } from '@controllers/UserController/assertions';
import { getRepository } from 'typeorm';
import { User } from '@entity/user';
import { assertConversationWithUserNotExists } from './assertions';

interface Create {
  toUserEmail: string;
}

type IndexRequest = RequestAuth;
type CreateRequest = RequestAuthBody<Create>;

class ConversationController {
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;

    const conversations = await Conversation.find({
      $or: [{ userId }, { toUserId: userId }],
    })
      .select('_id toUserId')
      .populate({
        path: 'messages',
        select: '_id text date',
      })
      .slice('messages', -1);

    const conversationsFormatted = [];

    for (const conversation of conversations) {
      const user = await getRepository(User).findOne({
        where: { id: conversation.toUserId },
      });

      conversationsFormatted.push({
        _id: conversation._id,
        lastMessage: conversation.messages[0],
        user,
      });
    }

    return res.json(conversationsFormatted);
  }

  async create(req: CreateRequest, res: Response) {
    const userId = req.userId as number;
    const { toUserEmail } = req.body;

    let toUserId: number;

    try {
      const user = await assertUserExists({ email: toUserEmail });
      toUserId = user.id;

      await assertConversationWithUserNotExists(userId, toUserId);
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ message });
    }

    const conversation = await Conversation.create({
      userId,
      toUserId,
      messages: [],
    });

    return res.json(conversation);
  }
}

export default new ConversationController();
