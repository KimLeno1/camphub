import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();

  connect(userId: string) {
    if (this.socket) return;
    
    // In dev it's same origin, in prod it's same origin
    this.socket = io({
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.socket?.emit('authenticate', { userId });
    });

    this.socket.onAny((event, ...args) => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach(cb => cb(args[0]));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
