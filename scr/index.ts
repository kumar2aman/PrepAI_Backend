import express from "express";
import cors from "cors";
import { router, wsListener } from "./router/v1/live";
import { createServer } from "http";
import { WebSocketServer } from "ws";



const app = express();

const PORT = 8080;

 const server = createServer(app)


export const wss = new WebSocketServer({server, path:"/aireq"})

wsListener(wss)
// app.use(express.json()); // This replaces bodyParser.json()
// app.use(express.urlencoded({ extended: true })); // For form data

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));



app.use("/api/v1", router);

server.listen(PORT, () => {
  console.log("Server is running on port 8080");
});