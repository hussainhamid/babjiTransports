import { Router } from "express";
import { protect } from "../middleware/auth.js";

import {
  createBooking,
  getBookingDetail,
  updateBookingDetail,
  assignDriverToBooking,
  payAdvance,
  completeBooking,
  updateInvoice,
  payFinalAmount,
  updateTripEvent,
  getBookings,
  cancelBooking,
} from "../controllers/bookingController.js";
import { attachUserIfPresent } from "../middleware/auth.js";

const router = Router();

router.post("/", attachUserIfPresent, createBooking);
router.get("/:id", protect, getBookingDetail);
router.put("/:id", protect, updateBookingDetail);
router.put("/:id/assign-driver", protect, assignDriverToBooking);
router.put("/:id/pay-advance", protect, payAdvance);
router.put("/:id/complete", protect, completeBooking);
router.put("/:id/invoice", protect, updateInvoice);
router.put("/:id/pay-final", protect, payFinalAmount);
router.put("/:id/trip-event", protect, updateTripEvent);
router.get("/", protect, getBookings);
router.put("/:id/cancel", protect, cancelBooking);

export default router;
