import express from "express";
import multer from "multer";
import { createComplaint, getComplaints } from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("photo"), createComplaint);
router.get("/", protect, getComplaints);

export default router;
