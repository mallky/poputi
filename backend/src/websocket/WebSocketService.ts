import WebSocket from 'ws';
import { WebSocketMessage, WebSocketHandlers } from './types';
import { WS_URL, RECONNECT_TIMEOUT } from './config';

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: WebSocketHandlers = {};

  constructor() {
    this.connect = this.connect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  connect(handlers: WebSocketHandlers): void {
    if (this.ws) {
      this.ws.close();
    }

    this.handlers = handlers;
    this.ws = new WebSocket(WS_URL);

    this.ws.on('message', this.handleMessage);
    this.ws.on('error', this.handleError);
    this.ws.on('close', this.handleClose);
  }

  private handleMessage(data: WebSocket.RawData): void {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'user_location':
          if (message.user && this.handlers.onUserLocation) {
            this.handlers.onUserLocation(message.user);
          }
          break;
        case 'user_disconnect':
          if (message.userId && this.handlers.onUserDisconnect) {
            this.handlers.onUserDisconnect(message.userId);
          }
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleError(error: Error): void {
    if (this.handlers.onError) {
      this.handlers.onError(error);
    }
  }

  private handleClose(): void {
    if (this.handlers.onClose) {
      this.handlers.onClose();
    }
    
    // Attempt to reconnect after timeout
    setTimeout(this.connect, RECONNECT_TIMEOUT, this.handlers);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
