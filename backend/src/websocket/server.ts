import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage, User } from './types';

const wss = new WebSocketServer({ port: 8080 });

// Store connected clients
const clients = new Map<WebSocket, User>();

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  // Send current users to new client
  const currentUsers = Array.from(clients.values());
  ws.send(JSON.stringify({
    type: 'initial_users',
    users: currentUsers
  }));

  ws.on('message', (message: string) => {
    try {
      const data: WebSocketMessage & { user?: User } = JSON.parse(message.toString());
      
      if (data.type === 'user_location' && data.user) {
        // Store or update client info
        clients.set(ws, data.user);

        // Broadcast to all other clients
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'user_location',
              user: data.user
            }));
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    const user = clients.get(ws);
    if (user) {
      // Notify other clients about disconnection
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'user_disconnect',
            userId: user.id
          }));
        }
      });
      clients.delete(ws);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
