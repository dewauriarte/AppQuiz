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
      // Ya hay un socket conectado
      return;
    }

    const { accessToken, user } = useAuthStore.getState();
    if (!accessToken) {
      // No hay token, no se puede conectar
      return;
    }

    // Solo log en desarrollo
    if (import.meta.env.DEV) {
      console.log('[SocketStore] Conectando socket para user:', user?.id);
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      // Solo log en desarrollo
      if (import.meta.env.DEV) {
        console.log('[SocketStore] ✅ Socket connected');
      }
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      // Solo log importante
      if (import.meta.env.DEV) {
        console.log('[SocketStore] ❌ Socket disconnected');
      }
      set({ isConnected: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SocketStore] Error de conexión:', error.message);
      set({ isConnected: false });
    });

    // Solo log de eventos importantes en desarrollo
    if (import.meta.env.DEV) {
      newSocket.onAny((event, ...args) => {
        // Solo loguear eventos de juego, no de conexión
        if (!event.includes('connect') && !event.includes('ping')) {
          console.log('[Socket]', event, args);
        }
      });
    }

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

