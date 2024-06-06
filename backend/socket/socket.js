import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server); // user_id : socket_id

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A new user has connected. Socket_id : ", socket.id);
  const userId = socket.handshake.query.user_id || null;

  // for testing in postman

  // socket.on("userId", (message) => {
  //   const userId = JSON.parse(message).userId;
  //   userSocketMap[userId] = socket.id;
  //   console.log(userSocketMap);
  // });

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
  });
});

export { app, server, io };
