import mongoose from "mongoose";
import Notification from "../models/notificationModel.js"; // Adjust path as needed

// --- Utility function for creating new notifications (to be used elsewhere) ---

/**
 * Creates and saves a new notification document.
 * @param {string} recipientId The ID of the user who should receive the notification.
 * @param {string} title The notification title.
 * @param {string} message The notification message.
 * @param {string} type The type of notification (e.g., 'ASSIGNMENT').
 * @param {string | null} referenceId Optional ID of the related document (e.g., complaint).
 * @param {string | null} senderId Optional ID of the user who triggered the event.
 */
export const createNotification = async ({
    recipientId,
    title,
    message,
    type,
    referenceId = null,
    senderId = null,
}) => {
    try {
        const newNotification = new Notification({
            recipient: recipientId,
            title,
            message,
            type,
            referenceId: referenceId ? new mongoose.Types.ObjectId(referenceId) : null,
            sender: senderId,
            isRead: false,
        });

        await newNotification.save();
        console.log(`Notification created for user ${recipientId}.`);
        return newNotification;

    } catch (error) {
        console.error("Error creating notification:", error);
        // Optionally, re-throw or handle error silently
    }
};

// --- Controller Functions for API Endpoints ---

/**
 * Fetches notifications for the authenticated user with pagination.
 * GET /api/notifications?limit=10&offset=0
 */
export const getNotifications = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is attached by authentication middleware
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
        // 1. Fetch notifications for the user, sorted by creation date (newest first)
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset)
            .lean(); // Use lean() for performance since we don't need Mongoose documents

        // 2. Count total documents for the user
        const totalCount = await Notification.countDocuments({ recipient: userId });
        
        // 3. Determine if more results exist
        const hasMore = offset + notifications.length < totalCount;

        res.status(200).json({
            data: notifications,
            meta: {
                totalCount,
                limit,
                offset,
                hasMore,
            }
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
};

/**
 * Marks a single notification as read or unread.
 * PUT /api/notifications/read/:id
 */
export const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    // Optional: Allow marking as unread if 'isRead' is passed in the body
    const { isRead = true } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid notification ID." });
    }

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId }, // Ensure the user owns the notification
            { $set: { isRead: isRead } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found or access denied." });
        }

        res.status(200).json({
            message: `Notification marked as ${isRead ? 'read' : 'unread'}.`,
            data: notification,
        });

    } catch (error) {
        console.error("Error marking notification:", error);
        res.status(500).json({ message: "Failed to update notification status." });
    }
};

/**
 * Marks all unread notifications for the user as read.
 * PUT /api/notifications/read/all
 */
export const markAllAsRead = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await Notification.updateMany(
            { recipient: userId, isRead: false }, // Filter: only update unread ones for this user
            { $set: { isRead: true } }
        );

        res.status(200).json({
            message: `${result.modifiedCount} notifications marked as read.`,
            modifiedCount: result.modifiedCount,
        });

    } catch (error) {
        console.error("Error marking all notifications:", error);
        res.status(500).json({ message: "Failed to mark all notifications as read." });
    }
};

/**
 * Deletes a single notification.
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid notification ID." });
    }

    try {
        const result = await Notification.deleteOne({ 
            _id: id, 
            recipient: userId 
        }); // Ensure the user owns the notification

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Notification not found or access denied." });
        }

        res.status(200).json({ 
            message: "Notification successfully deleted.",
            id 
        });

    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Failed to delete notification." });
    }
};

// Export the utility creator function for other controllers
export default {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification, // This utility is key for generating notifications from other features
};
