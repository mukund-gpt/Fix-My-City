import express from "express";
import multer from "multer";
import { createComment } from "../controllers/comments.controller.js";
import {
  createComplaint,
  getComplaints,
  getComplaintsById,
  getFilteredComplaints,
  getmyComplaints,
  getComplaintSlaTimeline,
} from "../controllers/complaint.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({});
const upload = multer({ storage: storage });
const commentUpload = multer({ storage: multer.memoryStorage() });

router.get("/", getFilteredComplaints);
router.get("/my", protect, getmyComplaints);
router.get("/:id", protect, getComplaintsById);
router.get("/:id/sla-timeline", protect, getComplaintSlaTimeline);

router.post("/new", protect, upload.array("photos", 5), createComplaint); // For users to submit a new complaint);
router.post("/comment", protect, commentUpload.single("image"), createComment);

export default router;
