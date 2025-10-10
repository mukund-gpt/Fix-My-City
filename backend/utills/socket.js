import { Server } from "socket.io";
import { calculateDashboardStats } from "../controllers/liveStat.controller.js";

let io;  
// Map to track userId (string) -> socket.id (string) for targeted messaging
const connectedUsers = new Map();

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Send initial dashboard data
        sendInitialData(socket);

        // 1. Handle user registration (when client component mounts)
        socket.on("register-user", (userId) => {
            if (userId) {
                // Ensure the key is a string for consistent lookups
                connectedUsers.set(userId.toString(), socket.id); 
                console.log(`User registered: ${userId} -> ${socket.id}`);
            }
        });

        // Refresh data on request
        socket.on("request-dashboard-update", async () => {
            try {
                const stats = await calculateDashboardStats();
                socket.emit("dashboard-update", stats);
            } catch (error) {
                console.error(" Error sending dashboard update:", error);
                socket.emit("dashboard-error", {
                    message: "Failed to fetch data",
                });
            }
        });

        // 2. Handle explicit unregistration (when client component unmounts)
        socket.on("unregister-user", (userId) => {
            if (userId) {
                const key = userId.toString();
                // Security check: only delete if the userId is currently associated with this socket
                if (connectedUsers.get(key) === socket.id) {
                    connectedUsers.delete(key);
                    console.log(`User explicitly unregistered: ${userId}`);
                }
            }
        });

        // 3. Handle disconnection (browser tab close/network loss)
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
            // Find and remove the user ID associated with this socket ID
            for (const [userId, sId] of connectedUsers.entries()) {
                if (sId === socket.id) {
                    connectedUsers.delete(userId);
                    console.log(`User unregistered on disconnect: ${userId}`);
                    break;
                }
            }
        });
    });

    return io;
};

// Send initial data to a single socket
const sendInitialData = async (socket) => {
    try {
        const stats = await calculateDashboardStats();
        socket.emit("dashboard-update", stats);
    } catch (error) {
        console.error(" Error sending initial data:", error);
        socket.emit("dashboard-error", {
            message: "Failed to fetch initial data",
        });
    }
};

// Broadcast to all clients
export const broadcastDashboardUpdate = async () => {
    if (!io) {
        console.error("Socket.IO not initialized");
        return;
    }
    try {
        const stats = await calculateDashboardStats();
        io.emit("dashboard-update", stats);
        console.log("✅ Dashboard update broadcasted");
    } catch (error) {
        console.error("Error broadcasting dashboard update:", error);
    }
};

// Helper: Sends real-time notification to a specific user
export const sendNotificationToUser = (userId, notificationData) => {
    if (!io) {
        console.error("Socket.IO not initialized");
        return false;
    }

    // Lookup the socketId using the userId from the map
    const socketId = connectedUsers.get(userId.toString());

    if (socketId) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            // Event name used on the frontend to listen for new notifications
            socket.emit("new-notification", notificationData);
            
            console.log(`📤 Event 'new-notification' sent to user: ${userId}`);
            return true;
        }
    }
    
    console.warn(`⚠️ No active socket found for user: ${userId}`);
    return false;
};


// General purpose emit
export const socketEmit = (recipient, event, message) => {
    if (!io) {
        console.error("Socket.IO not initialized");
        return;
    }

    let socketId = recipient;

    // If recipient is userId, map to socket.id
    if (connectedUsers.has(recipient.toString())) {
        socketId = connectedUsers.get(recipient.toString());
    }

    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
        socket.emit(event, message);
        console.log(`📤 Event '${event}' sent to ${recipient}`);
    } else {
        console.warn(`⚠️ No active socket found for recipient: ${recipient}`);
    }
};

// Access io anywhere
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
