import dotenv from "dotenv";
dotenv.config();

import async_error from "express-async-errors";
import path from "path";
import cookieParser from "cookie-parser";
import express from "express";

import helmet from "helmet";
import { app, server, io } from "./socket/socket.js";
import { Server } from "socket.io";
import cors from "cors";
import xss from "xss-clean";

import authRouter from "./routes/auth.js";
import itemsRouter from "./routes/items.js";
import bidsRouter from "./routes/bids.js";
import notificationsRouter from "./routes/notifications.js";

import pool from "./db/dbConfig.js";
import { notFoundMiddleware } from "./middlewares/not-found.js";
import { errorHandlerMiddleware } from "./middlewares/error-handler.js";

app.use(cookieParser());
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "http://cdnjs.cloudflare.com",
          "https://cdn.socket.io",
        ],
        objectSrc: ["'none'"],
      },
    },
  })
);
app.use(cors());

pool.connect();
app.use(xss());

const __dirname = path.resolve();

app.use("/backend/public", express.static(__dirname + "/backend/public"));

// io.on("connection", (socket) => {
//   socket.on("message", (message) => {
//     console.log(" message from frontend", message);
//     io.emit("message from backend", message);
//   });
// });

app.get("/*", (req, res) => {
  return res.sendFile(__dirname + "/backend/public/index.html");
});

app.use("/api/v1/users", authRouter);
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/items", bidsRouter);
app.use("/api/v1/notifications", notificationsRouter);

// error handlers;
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = () => {
  try {
    server.listen(port, () => {
      console.log(`Server is listenting on port ${port}`);
    });
  } catch (error) {
    console.log("start error", error);
  }
};

start();
