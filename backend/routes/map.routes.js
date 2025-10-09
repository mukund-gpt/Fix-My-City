import express from "express";
import { getLocations } from "../controllers/map.controller.js";
const router = express.Router();

router.get("/getLocations", getLocations);
export default router;
