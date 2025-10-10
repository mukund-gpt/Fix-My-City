import express from "express";
import { getDashboardStats } from "../controllers/liveStat.controller.js";


const router = express.Router();

// Get dashboard statistics
router.get("/", getDashboardStats);



export default router;