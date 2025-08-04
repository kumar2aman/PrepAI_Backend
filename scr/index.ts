import "dotenv/config"
import express from "express";
import cors from "cors";
import {  wsListener } from "./router/v1/live";
import { createServer } from "http";
import { WebSocketServer } from "ws";



const app = express();
const PORT = 8080;

// Create HTTP server to attach WebSocket to
const server = createServer(app);

// Create WebSocket server
export const wss = new WebSocketServer({ server, path: "/aireq" });


// ✅ Pass all required arguments to wsListener
wsListener(wss);

// CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// API routing
// app.use("/api/v1", router);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
