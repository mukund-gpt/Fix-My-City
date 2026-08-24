import express from "express";
import {
    assignComplaint,
    getAllUser,
    getanalyatics,
    getComplaints,
    getStaffByDepartment,
    manuallyEscalateComplaint,
    runSlaEscalationJob,
    updateComplaintByAdmin
} from "../controllers/admin.controller.js";
import {
    getResolvedComplaints,
    getUnresolvedComplaints,
} from "../controllers/complaint.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";
import { getReports } from "../utills/generatereports.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/users", getAllUser);
router.get("/staff", getStaffByDepartment
    
)
router.get("/complaints", getComplaints);
router.put("/complaints/assign", assignComplaint); // For admin to assign complaints
router.get("/complaints/unresolved", getUnresolvedComplaints);
router.get("/complaints/resolved", getResolvedComplaints);
router.put("/complaints/:id", updateComplaintByAdmin); // For admin to update complaint status
router.post('/complaints/:id/escalate', manuallyEscalateComplaint);
router.post('/job/run-escalation', runSlaEscalationJob);
router.get("/analytics",getanalyatics);
router.get("/reports", getReports);
export default router;
