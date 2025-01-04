import { WebSocketServer } from 'ws';
import { handleConnection } from './websocket/handlers';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', handleConnection);

console.log('WebSocket server is running on ws://localhost:8080');
