import express from "express";
import multer from "multer";
import {
  assignComplaint,
  createComplaint,
  getComplaints,
  getComplaintsById,
  getmyComplaints,
  updateComplaint
} from "../controllers/complaint.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("photo"), createComplaint);
router.get("/", getComplaints);
router.get("/:id", protect, getComplaintsById); // Assuming this is for getting a specific complaint
router.get("/my", protect, getmyComplaints); 
router.post("/new", protect, upload.single("photo"), createComplaint);
router.get("/staff/complaints", protect, getComplaints); // For staff to get all complaints
router.get("/admin/complaints", protect, getComplaints); // For admin to get all complaints
router.put("/staff/complaints/:id", protect, updateComplaint); // For staff to update complaint status
router.put("/admin/complaints/assign", protect, assignComplaint); // For admin to assign complaints
router.put("/admin/complaints/:id", protect, updateComplaint); // For admin to update complaint status

export default router;
