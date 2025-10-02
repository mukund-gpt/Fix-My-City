import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() =>
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);
