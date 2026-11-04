import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export const getReceiveSocketId = getReceiverSocketId;

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("A user connected:", socket.id, "userId:", userId);

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Broadcast online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  io.emit("onlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id, "userId:", userId);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
