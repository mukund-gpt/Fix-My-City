import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole =
  (...roles) =>
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      req.user = user;
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Unable to verify user permissions" });
    }
  };

export const adminProtect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET); // Use a different secret for admin tokens
      req.admin = decoded; // Attach decoded token payload to request object
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid admin token" }); // Token verification failed
    }
  } else {
    return res.status(401).json({ message: "No admin token provided" }); // No token found in request
  }
};
