import express from "express";
import authentication from "../middlewares/authentication.js";
import {
  getNotifications,
  markNotifications,
} from "../controllers/notifications.js";

const router = express.Router();

router.get("/", authentication, getNotifications);
router.post("/mark-read", authentication, markNotifications);

export default router;
