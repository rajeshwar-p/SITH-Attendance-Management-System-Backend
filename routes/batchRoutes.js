import express from "express";
import {
  createBatch,
  getBatches,
  getBatchDetails,
  addStudentsToBatch,
  removeStudentsFromBatch,
  updateBatch,          // ✅ ADD
  deleteBatch,           // ✅ ADD
  updateBatchStudents,
  getFullBatchData,
  getSingleBatchFull,
  getSingleBatchFullDetails
} from "../controllers/batchController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createBatch);
router.get("/full", verifyToken, getFullBatchData);
router.get("/full-details/:id", verifyToken, getSingleBatchFullDetails);
router.get("/full/:id", verifyToken, getSingleBatchFull);

router.get("/", verifyToken, getBatches);
router.get("/:id", verifyToken, getBatchDetails);

// ✅ NEW
router.put("/:id", verifyToken, updateBatch);
router.delete("/:id", verifyToken, deleteBatch);

router.post("/add-students", verifyToken, addStudentsToBatch);
router.post("/remove-students", verifyToken, removeStudentsFromBatch);
router.post("/update-students", verifyToken, updateBatchStudents);

export default router;