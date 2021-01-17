/* eslint-disable no-console */
import { indexConversations, showConversation } from '@controllers/ConversationController/functions';
import { createMessage, indexMessages } from '@controllers/MessageController/functions';
import { RequestError } from '@errors/request';
import http from 'http';
import socket from 'socket.io';

import { validateTokenAndGetUser } from '@utils/auth';

import App from './App';

// Other File

interface LoadChatParamsData {
  conversationId: string;
}

interface CreateChatMessageParamsData {
  conversationId: string;
  text: string;
}
//

class Socket {
  server: http.Server;

  socket: socket.Server;

  clients: { [key: string]: { userId: number } };

  constructor() {
    this.clients = {};

    this.server = http.createServer(App);
    this.socket = socket(this.server);

    this.initClientConnection();
  }

  initClientConnection() {
    this.socket.removeAllListeners();

    console.log(this.socket.sockets.sockets.size);

    this.socket.on('connection', async (client: socket.Socket) => {
      this.handleDisconnect(client);

      await this.handleValidateConnection(client);
      await this.loadConversations(client);

      client.on('load-chat-request', (data) => this.loadChat(client, data));
      client.on('create-chat-message', (data) => this.createChatMessage(client, data));

      // client.emit('test', { ok: true });
    });
  }

  handleDisconnect(client: socket.Socket) {
    client.on('disconnect', () => {
      console.log('Disconnected', client.id);
    });
  }

  async handleValidateConnection(client: socket.Socket) {
    try {
      const query = client.handshake.query as { token?: string };

      const { token } = query;
      const user = await validateTokenAndGetUser(token);

      // [to-do] need to check?
      this.clients[client.id] = {
        userId: user.id,
      };

      console.log('Connected', client.id, user);
    } catch (e) {
      const { message } = e as RequestError;
      console.error('Error:', message);

      client.emit('validation-error', {
        message,
      });

      client.disconnect();
    }
  }

  // other file

  async loadConversations(client: socket.Socket) {
    const { userId } = this.clients[client.id];

    const conversations = await indexConversations({ userId });

    client.emit('load-conversations', conversations);
  }

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

  async createChatMessage(client: socket.Socket, data: CreateChatMessageParamsData) {
    const { userId } = this.clients[client.id];
    const { conversationId, text } = data;
    console.log('vai criar');

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

      client.emit('load-chat-message', messageFormatted);
    } catch (e) {
      const { message } = e as RequestError;
      console.error('Error:', message);

      client.emit('create-chat-message-error', {
        message,
      });
    }
  }
}

export default new Socket().server;
