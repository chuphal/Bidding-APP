import dotenv from "dotenv";
dotenv.config();

import async_error from "express-async-errors";

import cookieParser from "cookie-parser";
import express from "express";
import expressWinston from "express-winston";

// security
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import rateLimiter from "express-rate-limit";

import { app, server } from "./backend/socket/socket.js";
import authRouter from "./backend/routes/auth.js";
import itemsRouter from "./backend/routes/items.js";
import bidsRouter from "./backend/routes/bids.js";
import notificationsRouter from "./backend/routes/notifications.js";

import { notFoundMiddleware } from "./backend/middlewares/not-found.js";
import { errorHandlerMiddleware } from "./backend/middlewares/error-handler.js";
import { logger, requestLogger } from "./backend/logger/logger.js";
import pool from "./backend/db/dbConfig.js";

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
  })
);
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
// logger

app.use(
  expressWinston.logger({
    winstonInstance: requestLogger,
    statusLevels: true,
  })
);

app.get("/", (req, res) => {
  return res.send("Bidding App");
});

app.use("/api/v1/users", authRouter);
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/items", bidsRouter);
app.use("/api/v1/notifications", notificationsRouter);

app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
  })
);

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

export { app, server };
