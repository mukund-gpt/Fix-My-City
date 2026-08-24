import express from "express";
import {
  getSLAConfig,
  saveSLAConfig,
} from "../controllers/slaConfig.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/", getSLAConfig);
router.post("/", saveSLAConfig);

export default router;
