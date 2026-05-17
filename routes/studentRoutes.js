import express from "express";
import {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentFullDetails
} from "../controllers/studentController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { validateStudent } from "../middleware/validationMiddleware.js";
import { getStudentById } from "../controllers/studentController.js";

const router = express.Router();

// ✅ CREATE STUDENT (WITH VALIDATION)
router.post("/", verifyToken, validateStudent, createStudent);

// ✅ GET
router.get("/", verifyToken, getStudents);

// ✅ UPDATE (ALSO VALIDATION)
router.put("/:id", verifyToken, validateStudent, updateStudent);

// ✅ DELETE
router.delete("/:id", verifyToken, deleteStudent);

router.get("/:id", getStudentById);

router.get("/full/:id", verifyToken, getStudentFullDetails);

export default router;