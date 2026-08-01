import { Router } from "express";

import {
  getDashboard,
  getMyVehicles,
  getMyBookings,
} from "../controllers/driverController.js";

const router = Router();

router.get("/dashboard", getDashboard);

router.get("/vehicles", getMyVehicles);

router.get("/bookings", getMyBookings);

export default router;
