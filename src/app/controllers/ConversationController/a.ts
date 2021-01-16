/* eslint-disable no-await-in-loop */
import { User } from '@entity/user';
import Conversation from '@schemas/Conversation';
import { getRepository } from 'typeorm';

interface IndexParams {
  userId: number;
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
