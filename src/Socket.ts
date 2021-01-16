/* eslint-disable no-console */
import { indexConversations } from '@controllers/ConversationController/a';
import { RequestError } from '@errors/request';
import { validateTokenAndGetUser } from '@utils/auth';
import http from 'http';
import socket from 'socket.io';

import App from './App';

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

      client.emit('error-validation', {
        message,
      });

      client.disconnect();
    }
  }

  // other file

  async loadConversations(client: socket.Socket) {
    const { userId } = this.clients[client.id];
    console.log('akki');

    const conversations = await indexConversations({ userId });

    client.emit('load-conversations', conversations);
  }
}

export default new Socket().server;
