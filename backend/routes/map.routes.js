import express from "express";
import { getLocations } from "../controllers/map.controller";
const router = express.Router();

router.get("/getLocations", getLocations);
export default router;