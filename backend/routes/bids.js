import express from "express";
import { getAllBids, createBid } from "../controllers/bids.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();

router.get("/:itemId/bids", getAllBids);

router.post("/:itemId/bids", authentication, createBid);

export default router;
