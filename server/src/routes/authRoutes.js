import { Router } from "express";
import {
  sendOtp,
  verifyOtp,
  verifyAdminSecretKey,
  login,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/verify-admin-key", verifyAdminSecretKey);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
