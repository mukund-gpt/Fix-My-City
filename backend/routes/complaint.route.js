import express from "express";
import multer from "multer";
import {
  createComplaint,
  getComplaintsById,
  getFilteredComplaints,
  getmyComplaints,
} from "../controllers/complaint.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getFilteredComplaints);
router.get("/my", protect, getmyComplaints);
// router.get("/", getComplaints);
router.get("/:id", protect, getComplaintsById); // Assuming this is for getting a specific complaint

router.post("/new", protect, upload.single("photo"), createComplaint); // For users to submit a new complaint);

export default router;
