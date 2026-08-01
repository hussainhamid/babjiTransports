import { Router } from "express";

import {
  createBooking,
  cancelBooking,
  completeBooking,
  getBookings,
} from "../controllers/bookingController.js";

const router = Router();

router.post("/", createBooking);

router.get("/", getBookings);

router.put("/:id/cancel", cancelBooking);

router.put("/:id/complete", completeBooking);

export default router;
