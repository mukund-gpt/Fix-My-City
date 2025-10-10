import express from "express";
import { getSLAConfig, saveSLAConfig } from "../controllers/slaConfig.controller.js";

const router = express.Router();

router.get("/", getSLAConfig);
router.post("/", saveSLAConfig);

export default router;
