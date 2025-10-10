

import { Server } from "socket.io";
import { calculateDashboardStats } from "../controllers/liveStat.controller.js";

let io;  
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

    socket.on("disconnect", () => {
              console.log(`Client disconnected: ${socket.id}`);
              // Find and remove the user ID associated with this socket ID
              for (const [userId, sId] of connectedUsers.entries()) {
                  if (sId === socket.id) {
                      connectedUsers.delete(userId);
                      console.log(`User unregistered: ${userId}`);
                      break;
                  }
              }
          });
    });

  return io;
};

// Send initial data
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

export const sendNotificationToUser = (userId, notificationData) => {
    if (!io) {
        console.error("Socket.IO not initialized");
        return;
    }

    const socketId = connectedUsers.get(userId.toString()); // Ensure key is a string

    if (socketId) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            socket.emit("new-notification", notificationData);
            
            console.log(` Event 'new-notification' sent to user: ${userId}`);
            return true;
        }
    }
    
    console.warn(` No active socket found for user: ${userId}`);
    return false;
};


export const socketEmit = (recipient, event, message) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }

  let socketId = recipient;

  // If recipient is userId, map to socket.id
  if (connectedUsers.has(recipient)) {
    socketId = connectedUsers.get(recipient);
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
