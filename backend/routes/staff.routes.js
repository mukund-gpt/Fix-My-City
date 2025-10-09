import express from "express";
import multer from "multer";
import { createComment } from "../controllers/comments.controller.js";
import {
  updateComplaintByStaff,
  viewAssignedComplaints,
} from "../controllers/complaint.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Configure multer storage (memory or disk)
const storage = multer.memoryStorage(); // use diskStorage if you want to save images to server
const upload = multer({ storage });

router.get("/complaints", protect, viewAssignedComplaints); // For staff to get all complaints
router.post("/complaints/comment",protect,upload.single("image"),createComment)
router.put("/complaints/:id", protect,updateComplaintByStaff);
// router.get("/reports", protect, adminOrStaff, getReports);
export default router;
