import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import connectDB from "./utills/db.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors(
  {
    origin: ["http://localhost:5173", "*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/test", (req, res) => {
  res.send("API is working");
}); 
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() =>
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);
