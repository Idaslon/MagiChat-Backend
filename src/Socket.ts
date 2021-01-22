/* eslint-disable no-console */
import {
  createConversation,
  indexConversations,
  showConversation,
} from '@controllers/ConversationController/functions';
import { createMessage, indexMessages } from '@controllers/MessageController/functions';
import { RequestError } from '@errors/request';
import http from 'http';
import socket from 'socket.io';

import { validateTokenAndGetUser } from '@utils/auth';

import App from './App';

// Other File

interface CreateConversationData {
  toUserEmail: string;
}

interface LoadChatParamsData {
  conversationId: string;
}

interface CreateChatMessageParamsData {
  conversationId: string;
  text: string;
}

//

interface Client {
  userId: number;
  socket: socket.Socket;
}

interface Clients {
  [key: string]: Client;
}

// const channes = {
//   conversation: {
//     create: {
//       request: 'conversation-create-request',
//       response: 'conversation-create-response',
//       error: 'conversation-create-error',
//     },
//     load: {
//       request: 'conversation-load-request',
//       response: 'conversation-load-response',
//       error: 'conversation-load-error',
//     },
//   },
// };

class Socket {
  server: http.Server;

  socket: socket.Server;

  clients: Clients;

  constructor() {
    this.clients = {};

    this.server = http.createServer(App);
    this.socket = socket(this.server);

    this.initClientConnection();
  }

  initClientConnection() {
    this.socket.removeAllListeners();

    this.socket.on('connection', async (client: socket.Socket) => {
      this.handleDisconnect(client);

      await this.handleValidateConnection(client);
      await this.loadConversations(client);

      client.on('create-conversation-request', (data) => this.createConversation(client, data));
      client.on('load-chat-request', (data) => this.loadChat(client, data));
      client.on('create-chat-message', (data) => this.createChatMessage(client, data));

      // client.emit('test', { ok: true });
    });
  }

  handleDisconnect(client: socket.Socket) {
    client.on('disconnect', () => {
      delete this.clients[client.id];
      console.log('Disconnected', client.id);
    });
  }

  async handleValidateConnection(client: socket.Socket) {
    console.log('akis');

    try {
      const query = client.handshake.query as { token?: string };

      const { token } = query;
      const user = await validateTokenAndGetUser(token);

      console.log('user', user);

      // [to-do] need to check?
      this.clients[client.id] = {
        userId: user.id,
        socket: client,
      };
    } catch (e) {
      const { message } = e as RequestError;
      console.error('Error:', message);

      client.emit('validation-error', {
        message,
      });

      client.disconnect();
    }
  }

  getClientByUserId(userId: number) {
    const keys = Object.keys(this.clients);

    for (const key of keys) {
      const client = this.clients[key];

      if (client.userId === userId) {
        return client;
      }
    }

    return undefined;
  }
  // other file

  async createConversation(client: socket.Socket, data: CreateConversationData) {
    const { userId } = this.clients[client.id];
    const { toUserEmail } = data;

    try {
      const conversation = await createConversation({
        userId,
        toUserEmail,
      });

      client.emit('create-conversation-response', conversation);

      const toUserClient = this.getClientByUserId(conversation.toUser.id);

      if (toUserClient) {
        console.log('toUserClientConnected');

        toUserClient.socket.emit('create-conversation-response', conversation);
      }
    } catch (e) {
      const { message } = e as RequestError;
      client.emit('create-conversation-error', { message });
    }
  }

  async loadConversations(client: socket.Socket) {
    const { userId } = this.clients[client.id];

    const conversations = await indexConversations({ userId });

    client.emit('load-conversations', conversations);
  }

  //

  async loadChat(client: socket.Socket, data: LoadChatParamsData) {
    const { userId } = this.clients[client.id];
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

      client.emit('load-chat', chat);
    } catch (e) {
      const { message } = e as RequestError;
      console.error('Error:', message);

      client.emit('load-chat-error', {
        message,
      });
    }
  }

  //

  async createChatMessage(client: socket.Socket, data: CreateChatMessageParamsData) {
    const { userId } = this.clients[client.id];
    const { conversationId, text } = data;

    try {
      const message = await createMessage({
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
    } catch (e) {
      const { message } = e as RequestError;
      console.error('Error:', message);

      client.emit('create-chat-message-error', { message });
    }
  }
}

export default new Socket().server;
