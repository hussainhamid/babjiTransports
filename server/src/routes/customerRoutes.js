import { Router } from "express";

import {
  getDashboard,
  getBookingHistory,
  getProfile,
  updateProfile,
  createNewCustomer,
} from "../controllers/customerController.js";

const router = Router();

router.post("/", createNewCustomer);
router.get("/:customerId/dashboard", getDashboard);
router.get("/:customerId/bookings", getBookingHistory);
router.get("/:customerId/profile", getProfile);
router.put("/:customerId/profile", updateProfile);

export default router;
