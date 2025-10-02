import express from "express";
import multer from "multer";
import { createComplaint, getComplaints } from '../controllers/complaint.controller.js';
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("photo"), createComplaint);
router.get("/", protect, getComplaints);

export default router;
