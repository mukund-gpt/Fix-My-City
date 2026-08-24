import express from "express";
import multer from "multer";
import {
  assignComplaint,
  getAllUser,
  getanalyatics,
  getComplaints,
  getStaffByDepartment,
  manuallyEscalateComplaint,
  reopenComplaint,
  runSlaEscalationJob,
  updateComplaintByAdmin,
} from "../controllers/admin.controller.js";
import {
  getResolvedComplaints,
  getUnresolvedComplaints,
} from "../controllers/complaint.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";
import { getReports } from "../utills/generatereports.js";
import { createComment } from "../controllers/comments.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect, requireRole("admin"));

router.get("/users", getAllUser);
router.get("/staff", getStaffByDepartment);
router.get("/complaints", getComplaints);
router.put("/complaints/assign", assignComplaint); // For admin to assign complaints
router.post("/complaints/comment", upload.single("image"), createComment);
router.get("/complaints/unresolved", getUnresolvedComplaints);
router.get("/complaints/resolved", getResolvedComplaints);
router.put("/complaints/:id", updateComplaintByAdmin); // For admin to update complaint status
router.post("/complaints/:id/reopen", reopenComplaint);
router.post("/complaints/:id/escalate", manuallyEscalateComplaint);
router.post("/job/run-escalation", runSlaEscalationJob);
router.get("/analytics", getanalyatics);
router.get("/reports", getReports);
export default router;
