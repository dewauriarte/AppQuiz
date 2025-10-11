import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '@/utils/jwt';

export interface SocketUser {
  userId: number;
  username: string;
  role: string;
}

export interface CustomSocket extends Socket {
  user?: SocketUser;
}

export function initializeSocket(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticación
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAccessToken(token);
      socket.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      };

      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Logging de conexiones
  io.on('connection', (socket: CustomSocket) => {
    console.log(`✅ Socket connected: ${socket.id} | User: ${socket.user?.username}`);

    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });

    socket.on('error', (error) => {
      console.error(`🔥 Socket error: ${socket.id}`, error);
    });
  });

  return io;
}

