import express from "express";
import multer from "multer";
import { createComment } from "../controllers/comments.controller.js";
import {
  updateComplaintByStaff,
  viewAssignedComplaints,
} from "../controllers/complaint.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Configure multer storage (memory or disk)
const storage = multer.memoryStorage(); // use diskStorage if you want to save images to server
const upload = multer({ storage });

router.use(protect, requireRole("staff"));

router.get("/complaints", viewAssignedComplaints); // For staff to get all complaints
router.post("/complaints/comment", upload.single("image"), createComment)
router.put("/complaints/:id", updateComplaintByStaff);
// router.get("/reports", protect, adminOrStaff, getReports);
export default router;
