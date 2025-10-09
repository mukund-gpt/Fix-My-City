import express from "express";
import {
    assignComplaint,
    getAllUser,
    getanalyatics,
    getComplaints,
    getStaffByDepartment,
    updateComplaintByAdmin
} from "../controllers/admin.controller.js";
import {
    getResolvedComplaints,
    getUnresolvedComplaints,
} from "../controllers/complaint.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { getReports } from "../utills/generatereports.js";

const router = express.Router();

router.get("/users", getAllUser);
router.get("/staff", getStaffByDepartment
    
)
router.get("/complaints", protect, getComplaints);
router.put("/complaints/assign", protect, assignComplaint); // For admin to assign complaints
router.get("/complaints/unresolved", protect, getUnresolvedComplaints);
router.get("/complaints/resolved", protect, getResolvedComplaints);
router.put("/complaints/:id", protect, updateComplaintByAdmin); // For admin to update complaint status
router.get("/analytics",getanalyatics);
router.get("/reports", protect, getReports);
export default router;
