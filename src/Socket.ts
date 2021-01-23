/* eslint-disable no-console */
import http from 'http';
import socket from 'socket.io';

import ConversationSocketController, { CreateConversationData } from '@controllers/Conversation/socket';
import MessageSocketController, { CreateChatMessageParamsData } from '@controllers/Message/socket';

import { RequestError } from '@errors/request';
import { validateTokenAndGetUser } from '@utils/auth';

import App from './App';

interface Client {
  userId: number;
  socket: socket.Socket;
}

interface Clients {
  [key: string]: Client;
}

interface NotifyClientParams {
  userId: number;
  channel: string;
  data: any;
}

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

      const clientData = await this.handleValidateConnection(client);

      if (!clientData) {
        return;
      }

      const { userId } = clientData;
      await ConversationSocketController.load(client, userId);

      client.on('create-conversation-request', (data) => this.createConversation(client, userId, data));

      client.on('load-chat-request', (data) => MessageSocketController.load(client, userId, data));
      client.on('create-chat-message', (data) => this.createChatMessage(client, userId, data));
    });
  }

  handleDisconnect(client: socket.Socket) {
    client.on('disconnect', () => {
      delete this.clients[client.id];
      console.log('Disconnected', client.id);
    });
  }

  async handleValidateConnection(client: socket.Socket) {
    try {
      const query = client.handshake.query as { token?: string };

      const { token } = query;
      const user = await validateTokenAndGetUser(token);

      console.log('user', user);

      const newClient = {
        userId: user.id,
        socket: client,
      };

      // [to-do] need to check?
      this.clients[client.id] = newClient;

      return newClient;
    } catch (e) {
      const { message } = e as RequestError;
      console.error('Error:', message);

      client.emit('validation-error', {
        message,
      });

      client.disconnect();

      return undefined;
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

  notifyClientIfConneted(params: NotifyClientParams) {
    const { userId, channel, data } = params;

    const client = this.getClientByUserId(userId);

    if (client) {
      client.socket.emit(channel, data);
    }
  }

  // other file

  async createConversation(client: socket.Socket, userId: number, data: CreateConversationData) {
    const conversation = await ConversationSocketController.create(client, userId, data);

    if (!conversation) {
      return;
    }

    this.notifyClientIfConneted({
      userId: conversation.toUser.id,
      channel: 'receive-conversation-response',
      data: conversation,
    });
  }

  async createChatMessage(client: socket.Socket, userId: number, data: CreateChatMessageParamsData) {
    const messageData = await MessageSocketController.create(client, userId, data);

    if (!messageData) {
      return;
    }

    const { conversation, messageFormatted } = messageData;
    const otherUserId = conversation.userId === userId ? conversation.toUserId : conversation.userId;

    this.notifyClientIfConneted({
      userId: otherUserId,
      channel: 'receive-chat-message-response',
      data: messageFormatted,
    });
  }
}

export default new Socket().server;
