import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

// const socketIo = require('socket.io');
import { Server } from "socket.io";
import http from "http";
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://skillswap.yungying.com",
      "https://fs-g03.iecmu.com",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Users store: userId (string) → array of socket ids (string[])
const users: Record<string, string[]> = {};

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    // users[data.id] = socket.id;
    //one user can have multiple socket connections
    if (!users[data.id]) {
      users[data.id] = [];
    }

    users[data.id].push(socket.id);
  });
});

server.listen(process.env.WS_PORT, () => {
  console.log(`Server_WS is running on port ${process.env.WS_PORT}`);
});

function getSocketId(userId: string): string[] | undefined {
  return users[userId];
}

function getAllUsers() {
  return users;
}

export { io, getSocketId, app, getAllUsers };
