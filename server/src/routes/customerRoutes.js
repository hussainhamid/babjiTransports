import { Router } from "express";

import {
  getDashboard,
  getBookingHistory,
  getProfile,
  updateProfile,
  createNewCustomer,
  getMyProfile,
  updateMyProfile,
  getMyDashboard,
  getMyBookings,
} from "../controllers/customerController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = Router();

router.get("/me/profile", protect, authorize("CUSTOMER"), getMyProfile);
router.put("/me/profile", protect, authorize("CUSTOMER"), updateMyProfile);
router.get("/me/dashboard", protect, authorize("CUSTOMER"), getMyDashboard);
router.get("/me/bookings", protect, authorize("CUSTOMER"), getMyBookings);

router.post("/", createNewCustomer);
router.get("/:customerId/dashboard", getDashboard);
router.get("/:customerId/bookings", getBookingHistory);
router.get("/:customerId/profile", getProfile);
router.put("/:customerId/profile", updateProfile);

export default router;
