import { WebSocket } from 'ws';
import { User, WebSocketMessage } from './types';

const users = new Map<string, WebSocket>();

export function handleConnection(ws: WebSocket) {
    ws.on('message', (message: string) => {
        try {
            const data: WebSocketMessage = JSON.parse(message);
            
            switch (data.type) {
                case 'user_location':
                    if (data.user) {
                        handleUserLocation(data.user, ws);
                    }
                    break;
                    
                case 'user_disconnect':
                    if (data.userId) {
                        handleUserDisconnect(data.userId);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        // Find and remove disconnected user
        for (const [userId, socket] of users.entries()) {
            if (socket === ws) {
                handleUserDisconnect(userId);
                break;
            }
        }
    });
}

function handleUserLocation(user: User, ws: WebSocket) {
    // Store or update user's websocket connection
    users.set(user.id, ws);

    // Broadcast user location to all other users
    const message: WebSocketMessage = {
        type: 'user_location',
        user
    };

    broadcastToOthers(message, user.id);
}

function handleUserDisconnect(userId: string) {
    // Remove user from users map
    users.delete(userId);

    // Broadcast user disconnect to all users
    const message: WebSocketMessage = {
        type: 'user_disconnect',
        userId
    };

    broadcastToAll(message);
}

function broadcastToOthers(message: WebSocketMessage, excludeUserId: string) {
    const messageStr = JSON.stringify(message);
    users.forEach((ws, userId) => {
        if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
        }
    });
}

function broadcastToAll(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    users.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
        }
    });
}
