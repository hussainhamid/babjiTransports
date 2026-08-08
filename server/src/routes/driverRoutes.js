import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import {
  getDashboard,
  getMyVehicles,
  getMyBookings,
  updateMyTripStatus,
  applyAsDriver,
} from "../controllers/driverController.js";

const router = Router();

router.get("/dashboard", protect, authorize("DRIVER"), getDashboard);
router.get("/vehicles", protect, authorize("DRIVER"), getMyVehicles);
router.get("/bookings", protect, authorize("DRIVER"), getMyBookings);
router.put(
  "/bookings/:bookingId/status",
  protect,
  authorize("DRIVER"),
  updateMyTripStatus,
);
router.post("/apply", applyAsDriver);

export default router;
