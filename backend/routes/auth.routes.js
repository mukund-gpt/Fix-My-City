import express from "express";
import { getAdminDetails, logoutAdmin, verifyAdmin } from "../controllers/admin.controller.js";
import {
  deleteUserAccount,
  googleLogin,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { getAllUsers } from "../controllers/user.controller.js";
import User from "../models/user.model.js";

const router = express.Router();
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/logout", logoutUser);
// user routes 

router.get("/user", getAllUsers);
router.delete("/user", deleteUserAccount);

// admin routes
router.get("/admin", getAdminDetails);
router.post("/admin/verify",verifyAdmin);
router.post("/admin/logout", logoutAdmin);

export default router;
