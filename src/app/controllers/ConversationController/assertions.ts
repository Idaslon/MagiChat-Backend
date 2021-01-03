import { RequestError } from '@errors/request';
import Conversation, { ConversationInterface } from '@schemas/Conversation';

interface ConversationExistsParams {
  _id: string;
}

export async function assertConversationExists(params: ConversationExistsParams) {
  const conversation = await Conversation.findOne(params);

  if (!conversation) {
    throw new RequestError('Conversation not found', 400);
  }

  return conversation;
}

export async function assertConversationWithUserNotExists(userId: number, toUserId: number) {
  const conversation = await Conversation.findOne({
    userId,
    toUserId,
  });

  if (conversation) {
    throw new RequestError('You already have a conversation with this user', 307);
  }

  return conversation;
}

export function assertUserOnConversation(conversation: ConversationInterface, userId: number) {
  if (conversation.userId !== userId && conversation.toUserId !== userId) {
    throw new RequestError('You are not in this conversation', 401);
  }
}
