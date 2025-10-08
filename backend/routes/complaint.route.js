import express from "express";
import multer from "multer";
import {
  createComplaint,
  getComplaints,
  getComplaintsById,
  getFilteredComplaints,
  getmyComplaints,
} from "../controllers/complaint.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({});
const upload = multer({ storage: storage });

router.get("/", getFilteredComplaints);
router.get("/my", protect, getmyComplaints);
router.get("/", getComplaints);
router.get("/:id", getComplaintsById); // Assuming this is for getting a specific complaint

router.post("/new", protect, upload.array("photos", 5), createComplaint); // For users to submit a new complaint);

export default router;
