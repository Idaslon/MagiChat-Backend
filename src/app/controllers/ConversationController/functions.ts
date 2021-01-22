/* eslint-disable no-await-in-loop */
import { assertUserExists } from '@controllers/UserController/assertions';
import { User } from '@entity/user';
import Conversation from '@schemas/Conversation';
import { getRepository } from 'typeorm';
import { assertConversationExists, assertConversationWithUserNotExists } from './assertions';

interface IndexParams {
  userId: number;
}

interface ShowParams {
  _id: string;
}

interface CreateParams {
  userId: number;
  toUserEmail: string;
}

export async function indexConversations(params: IndexParams) {
  const { userId } = params;

  const conversations = await Conversation.find({
    $or: [{ userId }, { toUserId: userId }],
  })
    .select('_id userId toUserId')
    .populate({
      path: 'messages',
      select: '_id text date',
    })
    .slice('messages', -1);

  const conversationsFormatted = [];

  for (const conversation of conversations) {
    const user = await getRepository(User).findOne({
      where: { id: conversation.userId },
    });

    const toUser = await getRepository(User).findOne({
      where: { id: conversation.toUserId },
    });

    conversationsFormatted.push({
      _id: conversation._id,
      lastMessage: conversation.messages[0],
      user,
      toUser,
    });
  }

  return conversationsFormatted;
}

export async function showConversation(params: ShowParams) {
  const { _id } = params;

  await assertConversationExists({ _id });

  const conversation = await Conversation.findById(_id).select('_id userId toUserId');

  const user = await getRepository(User).findOne({
    where: { id: conversation?.userId },
  });

  const toUser = await getRepository(User).findOne({
    where: { id: conversation?.toUserId },
  });

  const conversationFormatted = {
    _id: conversation?._id,
    user,
    toUser,
  };

  return conversationFormatted;
}

export async function createConversation(params: CreateParams) {
  const { userId, toUserEmail } = params;

  const user = await assertUserExists({ id: userId });
  const toUser = await assertUserExists({ email: toUserEmail });
  await assertConversationWithUserNotExists(userId, toUser.id);

  const conversation = await Conversation.create({
    userId,
    toUserId: toUser.id,
    messages: [],
  });

  const conversationFormatted = {
    _id: conversation._id,
    user,
    toUser,
  };

  return conversationFormatted;
}
