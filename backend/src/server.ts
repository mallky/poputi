import { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors';
import { handleConnection } from './websocket/handlers';
import authRoutes from './routes/auth';

// Create Express app
const app = express();

// Basic CORS setup
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api/auth', authRoutes);

// Start HTTP server
const HTTP_PORT = 8081;
app.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`REST API server is running on http://localhost:${HTTP_PORT}`);
});

// Start WebSocket server
const WS_PORT = 8080;
const wss = new WebSocketServer({ 
    port: WS_PORT,
    host: '0.0.0.0'
});

wss.on('connection', handleConnection);

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);
