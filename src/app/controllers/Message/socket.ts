import { showConversation } from '@controllers/Conversation/functions';
import { RequestError } from '@errors/request';
import { Socket } from 'socket.io';
import { createMessage, indexMessages } from './functions';

interface LoadChatParamsData {
  conversationId: string;
}

export interface CreateChatMessageParamsData {
  conversationId: string;
  text: string;
}

class MessageSocketController {
  async load(client: Socket, userId: number, data: LoadChatParamsData) {
    const { conversationId } = data;

    try {
      const conversation = await showConversation({
        _id: conversationId,
      });

      const messages = await indexMessages({
        userId,
        conversationId,
      });

      const chat = {
        conversation,
        messages,
      };

      client.emit('load-chat-response', chat);

      return chat;
    } catch (e) {
      const { message } = e as RequestError;
      console.error('Error:', message);

      client.emit('load-chat-error', { message });

      return undefined;
    }
  }

  async create(client: Socket, userId: number, data: CreateChatMessageParamsData) {
    const { conversationId, text } = data;

    try {
      const { message, conversation } = await createMessage({
        text,
        userId,
        conversationId,
      });

      const messageFormatted = {
        _id: message._id,
        text: message.text,
        date: message.date,
        senderUserId: message.senderUserId,
        conversationId,
      };

      client.emit('create-chat-message-response', messageFormatted);

      return { messageFormatted, conversation };
    } catch (e) {
      const { message } = e as RequestError;
      console.error('Error:', message);

      client.emit('create-chat-message-error', { message });

      return undefined;
    }
  }
}

export default new MessageSocketController();
