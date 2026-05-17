import express from "express";
import {
  createAttendance,
  getAttendanceByBatch,
  getAttendanceDetails,
  deleteAttendance,
  updateAttendance,
  checkAttendanceExists
} from "../controllers/attendanceController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createAttendance);

// NEW
router.get("/check", verifyToken, checkAttendanceExists);
router.get("/batch/:batch_id", verifyToken, getAttendanceByBatch);
router.get("/:id", verifyToken, getAttendanceDetails);
router.delete("/:id", verifyToken, deleteAttendance);
router.put("/:id", verifyToken, updateAttendance);


export default router;