import express from "express";
import notificationController from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect); 

router.get("/", notificationController.getNotifications);

router.put("/read/all", notificationController.markAllAsRead);

router.put("/read/:id", notificationController.markAsRead);

router.delete("/:id", notificationController.deleteNotification);

export default router;
