/* eslint-disable no-console */
import { RequestError } from '@errors/request';
import { validateTokenAndGetUser } from '@utils/auth';
import http from 'http';
import socket, { Socket } from 'socket.io';

import App from './App';

class Socket {
  server: http.Server;

  socket: socket.Server;

  constructor() {
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

      // this.handleTest(client);
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
}

export default new Socket().server;
