import express from "express";
import {
  register,
  login,
  profile,
  logout,
  passwordReset,
  passwordResetToken,
} from "../controllers/auth.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", authentication, profile);

router.post("/logout", logout);

router.post("/password-reset", passwordReset);

router.post("/reset-password/:token", passwordResetToken);

export default router;
