import { WebSocketMessage, User } from './types';

interface WebSocketCallbacks {
    onUserLocation: (user: User) => void;
    onUserDisconnect: (userId: string) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
    onOpen?: () => void;
}

class WebSocketService {
    private ws: WebSocket | null = null;
    private callbacks: WebSocketCallbacks | null = null;
    private userId: string | null = null;
    private messageQueue: string[] = [];

    public connect(callbacks: WebSocketCallbacks) {
        this.callbacks = callbacks;
        if (!this.userId) {
            this.userId = this.generateUserId();
        }
        this.initializeWebSocket();
    }

    private initializeWebSocket() {
        this.ws = new WebSocket(import.meta.env.VITE_WS_URL);
        
        this.ws.onopen = () => {
            // Send any queued messages
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                if (message) this.send(message);
            }
            this.callbacks?.onOpen?.();
        };
        
        this.ws.onmessage = (event) => {
            try {
                const messageString = event.data.toString();
                const data: WebSocketMessage = JSON.parse(messageString);
                
                switch (data.type) {
                    case 'user_location':
                        if (data.user && this.callbacks) {
                            this.callbacks.onUserLocation(data.user);
                        }
                        break;
                    case 'user_disconnect':
                        if (data.userId && this.callbacks) {
                            this.callbacks.onUserDisconnect(data.userId);
                        }
                        break;
                    case 'initial_users':
                        if (data.users && this.callbacks) {
                            data.users.forEach(user => {
                                this.callbacks?.onUserLocation(user);
                            });
                        }
                        break;
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onerror = (error) => {
            this.callbacks?.onError?.(error);
        };

        this.ws.onclose = () => {
            this.callbacks?.onClose?.();
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                this.initializeWebSocket();
            }, 3000);
        };
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.callbacks = null;
        // Don't reset userId to maintain consistency across reconnections
    }

    public sendLocation(coordinates: [number, number]) {
        if (!this.userId) return;

        const user: User = {
            id: this.userId,
            coordinates,
            type: 'self'
        };
        
        const message = JSON.stringify({
            type: 'user_location',
            user
        });

        this.send(message);
    }

    private send(message: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            this.messageQueue.push(message);
        }
    }

    private generateUserId(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}

export const webSocketService = new WebSocketService();
