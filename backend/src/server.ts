import { WebSocketServer } from "ws";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { handleConnection } from "./websocket/handlers";
import authRoutes from "./routes/auth";
import fs from "fs";
import https from "https";
import http from "http";
import path from "path";

// Create Express app
const app = express();

// Basic CORS setup
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mallky API",
      version: "1.0.0",
      description: "API documentation for Mallky application",
    },
    servers: [
      {
        url: "https://mallky.ru:8081",
        description: "Production server",
      },
      {
        url: "http://localhost:8081",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

// REST API routes
app.use("/api/auth", authRoutes);

const HTTP_PORT = 8081;
// WebSocket server
const WS_PORT = 8080;

let wss,
  wssServer: https.Server | null = null,
  server;

try {
  // Попытка запустить HTTPS сервер
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "../ssl/privkey.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../ssl/fullchain.pem")),
  };
  server = https.createServer(sslOptions, app);
  console.log("SSL certificates found, starting HTTPS server");

  wssServer = https.createServer(sslOptions);
  wss = new WebSocketServer({
    server: wssServer, // Используем HTTPS сервер для вебсокетов
  });
  console.log("SSL certificates found, starting WebSocket server with SSL");
} catch (error) {
  // Если сертификаты не найдены, запускаем HTTP сервер
  console.log("SSL certificates not found, starting HTTP server:", error);
  server = http.createServer(app);

  console.log(
    "SSL certificates not found, starting WebSocket server without SSL:",
    error
  );
  wss = new WebSocketServer({ port: WS_PORT, host: "0.0.0.0" });
}

if (wssServer) {
  wssServer.listen(WS_PORT);
}

wss.on("connection", handleConnection);

server.listen(HTTP_PORT, "0.0.0.0", () => {
  const protocol = server instanceof https.Server ? "https" : "http";
  console.log(
    `REST API server is running on ${protocol}://localhost:${HTTP_PORT}`
  );
  console.log(
    `WebSocket server is running on ${
      protocol === "https" ? "wss" : "ws"
    }://localhost:${WS_PORT}`
  );
});
