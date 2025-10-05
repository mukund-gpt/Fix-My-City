import express from "express";
import { getAdminDetails, logoutAdmin, verifyAdmin } from "../controllers/admin.controller.js";
import {
  deleteUserAccount,
  googleLogin,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.contoller.js";
import { getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();

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
