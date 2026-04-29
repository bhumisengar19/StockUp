import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config/config';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: config.client.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    // console.log(`Socket connected: ${socket.id}`);
    
    // Join a room based on the organization/system if needed
    socket.join('collaboration-room');

    socket.on('disconnect', () => {
      // console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitDataUpdate = (module: string, action: string, data: any) => {
  if (io) {
    io.to('collaboration-room').emit('data_update', { module, action, data });
  }
};
