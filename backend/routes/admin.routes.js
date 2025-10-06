import express from "express";
import { assignComplaint, getComplaints, getStaffByDepartment, updateComplaintByAdmin } from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();
// router.use(adminProtect);
router.get("/staff", getStaffByDepartment);
router.get("/complaints", protect, getComplaints); 
router.put("/complaints/assign", protect, assignComplaint); // For admin to assign complaints
router.put("/complaints/:id", protect, updateComplaintByAdmin); // For admin to update complaint status

export default router;
