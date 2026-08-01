import { Router } from "express";

import {
  getDashboard,
  getDrivers,
  getDriverById,
  getCustomers,
  getCustomerById,
  getVehicles,
  getVehicleById,
  getBookings,
  getBookingById,
  getPayments,
  getPaymentById,
} from "../controllers/adminController.js";

const router = Router();

router.get("/dashboard", getDashboard);

router.get("/drivers", getDrivers);
router.get("/drivers/:id", getDriverById);

router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomerById);

router.get("/vehicles", getVehicles);
router.get("/vehicles/:id", getVehicleById);

router.get("/bookings", getBookings);
router.get("/bookings/:id", getBookingById);

router.get("/payments", getPayments);
router.get("/payments/:id", getPaymentById);

export default router;
