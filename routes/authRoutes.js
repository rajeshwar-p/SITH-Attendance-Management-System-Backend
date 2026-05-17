import express from "express";
import { sendOTP, resetPassword } from "../controllers/authController.js";
// 🔥 controllers import
import {
  login,
  verifyAdmin,
  createUser
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/reset-password", resetPassword);
router.post("/verify-admin", verifyAdmin);
router.post("/create-user", createUser);

export default router;