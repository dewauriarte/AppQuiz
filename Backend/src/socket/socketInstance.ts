import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function setSocketIO(socketServer: SocketIOServer): void {
  io = socketServer;
}

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO no inicializado. Llama a setSocketIO primero.');
  }
  return io;
}

export function hasSocketIO(): boolean {
  return io !== null;
}

