import { Router } from "express";

const router = Router();

import {
  getBookingHistory,
  getProfile,
  updateProfile,
} from "../controllers/customerController.js";

router.get("/bookings", getBookingHistory);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
