import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './authStore';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const { socket } = get();
    if (socket) {
      console.log('[SocketStore] Ya hay un socket conectado');
      return;
    }

    const { accessToken, user } = useAuthStore.getState();
    if (!accessToken) {
      console.log('[SocketStore] No hay token, no se puede conectar');
      return;
    }

    console.log('[SocketStore] Conectando socket para user:', user?.id);

    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('[SocketStore] ✅ Socket connected, ID:', newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      console.log('[SocketStore] ❌ Socket disconnected');
      set({ isConnected: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SocketStore] Socket connection error:', error);
      set({ isConnected: false });
    });

    // Log para debug de eventos
    newSocket.onAny((event, ...args) => {
      console.log('[Socket Event]', event, args);
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));

