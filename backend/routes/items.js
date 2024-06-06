import express from "express";
import authentication from "../middlewares/authentication.js";
import {
  getAllItems,
  getSingleItem,
  createItem,
  deleteItem,
  updateItem,
} from "../controllers/items.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/", getAllItems);

router.post("/", authentication, upload, createItem);

router.get("/:id", getSingleItem);

router.put("/:id", authentication, updateItem);

router.delete("/:id", authentication, deleteItem);

export default router;
