import express from "express";
import {
  updateComplaintByStaff,
  viewAssignedComplaints,
} from "../controllers/complaint.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/complaints", protect, viewAssignedComplaints); // For staff to get all complaints
router.put("/complaints/:id", protect, updateComplaintByStaff);
// router.get("/reports", protect, adminOrStaff, getReports);
export default router;
