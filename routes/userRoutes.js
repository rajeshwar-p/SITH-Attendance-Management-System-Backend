import express from "express";
import { getProfile, updateProfile, getStaffUsers } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.get("/staff", verifyToken, getStaffUsers);

export default router;