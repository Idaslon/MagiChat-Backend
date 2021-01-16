/* eslint-disable no-await-in-loop */
import { User } from '@entity/user';
import Conversation from '@schemas/Conversation';
import { getRepository } from 'typeorm';
import { assertConversationExists } from './assertions';

interface IndexParams {
  userId: number;
}

interface ShowParams {
  _id: string;
}

export async function indexConversations(params: IndexParams) {
  const { userId } = params;

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
