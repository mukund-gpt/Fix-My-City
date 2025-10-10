

import { Server } from "socket.io";
import { calculateDashboardStats } from "../controllers/liveStat.controller.js";

let io;  

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

// Access io anywhere
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
