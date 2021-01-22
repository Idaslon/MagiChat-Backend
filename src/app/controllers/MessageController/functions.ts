/* eslint-disable no-await-in-loop */
import { assertConversationExists, assertUserOnConversation } from '@controllers/ConversationController/assertions';
import Conversation from '@schemas/Conversation';
import Message from '@schemas/Message';

interface IndexMessagesParams {
  userId: number;
  conversationId: string;
}

interface CreateMessageParams {
  userId: number;
  conversationId: string;
  text: string;
}

export async function indexMessages(params: IndexMessagesParams) {
  const { userId, conversationId } = params;

  const conversation = await assertConversationExists({ _id: conversationId });
  assertUserOnConversation(conversation, userId);

  const conversationMessages = await Conversation.findById(conversationId).select('_id toUserId').populate({
    path: 'messages',
    select: '_id text date senderUserId',
  });

  return conversationMessages?.messages;
}

export async function createMessage(params: CreateMessageParams) {
  const { conversationId, userId, text } = params;

  const conversation = await assertConversationExists({ _id: conversationId });

  const message = await Message.create({
    text,
    date: new Date(),
    senderUserId: userId,
  });

  await Conversation.updateOne(
    {
      _id: conversationId,
    },
    {
      $push: { messages: message._id },
    }
  );

  return { message, conversation };
}
