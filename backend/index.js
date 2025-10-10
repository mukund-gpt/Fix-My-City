import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import adminroutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import maproutes from "./routes/map.routes.js";
import notificationRoutes from './routes/notification.routes.js';
import slaroutes from './routes/sla.routes.js';
import staffroutes from "./routes/staff.routes.js";
import connectDB from "./utills/db.js";
dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/test", (req, res) => {
  res.send("API is working");
});
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminroutes);
app.use("/api/staff", staffroutes);
app.use("/api/map", maproutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/slaconfig', slaroutes);

app.get("/", (req, res) => {
  return res.send("Backend is working fine");
});

const PORT = process.env.PORT || 5000;
connectDB().then(() =>
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);
