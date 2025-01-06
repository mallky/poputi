import { WebSocketServer } from "ws";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { handleConnection } from "./websocket/handlers";
import authRoutes from "./routes/auth";

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

// Start HTTP server
const HTTP_PORT = 8081;
app.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`REST API server is running on http://localhost:${HTTP_PORT}`);
});

// Start WebSocket server
const WS_PORT = 8080;
const wss = new WebSocketServer({
  port: WS_PORT,
  host: "0.0.0.0",
});

wss.on("connection", handleConnection);

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);
