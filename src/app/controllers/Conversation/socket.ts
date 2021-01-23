import { Socket } from 'socket.io';

import { RequestError } from '@errors/request';
import { createConversation, indexConversations } from './functions';

interface CreateConversationData {
  toUserEmail: string;
}

class ConversationSocketController {
  async load(client: Socket, userId: number) {
    const conversations = await indexConversations({ userId });

    client.emit('load-conversations', conversations);

    return conversations;
  }

  async create(client: Socket, userId: number, data: CreateConversationData) {
    const { toUserEmail } = data;

    try {
      const conversation = await createConversation({
        userId,
        toUserEmail,
      });

      client.emit('create-conversation-response', conversation);

      return conversation;
    } catch (e) {
      const { message } = e as RequestError;
      client.emit('create-conversation-error', { message });

      return undefined;
    }
  }
}

export default new ConversationSocketController();
