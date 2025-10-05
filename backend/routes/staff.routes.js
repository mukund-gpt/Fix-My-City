import express from "express";
import { getComplaints, updateComplaintByStaff } from "../controllers/complaint.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/staff/complaints", protect, getComplaints); // For staff to get all complaints
router.put("/staff/complaints/:id", protect, updateComplaintByStaff);

export default router;