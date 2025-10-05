import express from "express";
import {
  googleLogin,
  loginUser,
  registerUser,
} from "../controllers/auth.contoller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {    
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout successful" });
  }
  );
});
router.get("/user", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
});

router.delete("/user", (req, res) => {
  if (req.session.user) {
    // Logic to delete user from database would go here
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to delete user account" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "User account deleted successfully" });
    }
    );
  } else {
    res.status(401).json({ message: "User not authenticated" });
  } 
});

router.get("/admin", (req, res) => {
  if (req.session.admin) {
    res.status(200).json({ admin: req.session.admin });
  } else {
    res.status(401).json({ message: "Admin not authenticated" });
  }
}
);
router.post("/admin/verify", (req, res) => {
  const { secretKey } = req.body;
  if (secretKey === process.env.ADMIN_SECRET_KEY) {
    req.session.admin = { isAdmin: true };
    res.status(200).json({ message: "Admin verified successfully" });
  } else {
    res.status(403).json({ message: "Invalid secret key" });
  } 
});
router.post("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Admin logout failed" });
    } 
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Admin logout successful" });
  } 
  );
});





export default router;
