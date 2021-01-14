/* eslint-disable no-console */
import http from 'http';
import socket from 'socket.io';
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
    console.log(this.socket.sockets.sockets.size);

    this.socket.on('connection', (client: socket.Socket) => {
      console.log('Connected', client.id);

      console.log(this.socket.sockets.sockets.size);

      // this.handleDisconnect(client);
    });

    // do not know
    // this.socket.on('disconnect', () => {
    //   this.socket.removeAllListeners();
    // });
  }

  handleDisconnect(client: socket.Socket) {
    client.on('disconnect', () => console.log('Disconnected', client.id));
  }
}

export default new Socket().server;
