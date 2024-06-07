import { StatusCodes } from "http-status-codes";
import pool from "../db/dbConfig.js";
import { CustomAPIError } from "../errors/custom-api.js";
import { logger } from "express-winston";

export const getNotifications = async (req, res) => {
  try {
    const { userId, username, role } = req.user;

    const notifyArr = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    if (notifyArr.rowCount === 0) {
      logger.info("No new notifications for you.");
      res
        .status(StatusCodes.OK)
        .json({ notifications: "No new notifications for you." });
    } else {
      logger.info(`Notifications for ${username}`);
      res.status(StatusCodes.OK).json({
        msg: `Notifications for ${username}`,
        notifications: notifyArr.rows,
      });
    }
  } catch (error) {
    logger.error("Server ERROR", error);
    throw new CustomAPIError(error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const markNotifications = async (req, res) => {
  try {
    const { userId, username, role } = req.user;
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    logger.info("Notifications marked as read");
    res.status(StatusCodes.OK).json({ msg: "Notifications marked as read" });
  } catch (error) {
    logger.error("Server error", error);
    throw new CustomAPIError(error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
