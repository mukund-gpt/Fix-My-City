import express from "express";
import multer from "multer";
import { assignComplaint, updateComplaintByAdmin } from "../controllers/admin.controller.js";
import { createComplaint, getComplaints, getComplaintsById, getmyComplaints, updateComplaintByStaff } from '../controllers/complaint.controller.js';
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/my", protect,getmyComplaints); 
// router.get("/", getComplaints);
router.get("/:id", protect, getComplaintsById); // Assuming this is for getting a specific complaint

router.post("/new", protect, upload.single("photos"),createComplaint); // For users to submit a new complaint);
router.get("/staff/complaints", protect, getComplaints); // For staff to get all complaints
router.get("/admin/complaints", protect, getComplaints); // For admin to get all complaints
router.put("/staff/complaints/:id", protect, updateComplaintByStaff); // For staff to update complaint status
router.put("/admin/complaints/assign", protect, assignComplaint); // For admin to assign complaints
router.put("/admin/complaints/:id", protect, updateComplaintByAdmin); // For admin to update complaint status

export default router;
