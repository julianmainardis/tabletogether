import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Cambia por tu URL real si aplica

class SocketService {
  private socket: Socket | null = null;
  private tableId: string | null = null;
  private cartId: string | null = null;
  private sessionToken: string | null = null;
  private sessionId: string | null = null;
  private userName: string | null = null;

  connect(tableId: string, sessionToken: string, sessionId: string, userName: string) {
    if (
      this.socket?.connected &&
      this.tableId === tableId &&
      this.sessionToken === sessionToken &&
      this.sessionId === sessionId &&
      this.userName === userName
    ) {
      return;
    }
    this.tableId = tableId;
    this.sessionToken = sessionToken;
    this.sessionId = sessionId;
    this.userName = userName;
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SOCKET_URL, {
        path: '/socket.io',
        transports: ['websocket'],
        withCredentials: true,
        auth: { token: sessionToken },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true,
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onCartUpdate(callback: (items: any[]) => void) {
    if (!this.socket) return;
    this.socket.off('cartUpdate');
    this.socket.on('cartUpdate', callback);
  }

  offCartUpdate(callback: (items: any[]) => void) {
    if (!this.socket) return;
    this.socket.off('cartUpdate', callback);
  }

  emitAddItem(item: any) {
    if (!this.socket?.connected) return;
    this.socket.emit('cart:item:add', {
      cartId: this.cartId,
      sessionToken: this.sessionToken,
      item,
    });
  }

  emitRemoveItem(item: any) {
    if (!this.socket?.connected) return;
    this.socket.emit('cart:item:remove', {
      cartId: this.cartId,
      sessionToken: this.sessionToken,
      item,
    });
  }

  emitUpdateItem(item: any) {
    if (!this.socket?.connected) return;
    this.socket.emit('cart:item:update', {
      cartId: this.cartId,
      sessionToken: this.sessionToken,
      item,
    });
  }
}

export const socketService = new SocketService(); 