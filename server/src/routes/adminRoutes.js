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
  getOwners,
  getOwnerById,
  createDriver,
  updateDriver,
  deleteDriver,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  createBooking,
  updateBooking,
  archiveBooking,
  restoreBooking,
  createPayment,
  voidPayment,
  refundPayment,
  editPayment,
  createOwner,
  updateOwner,
  deleteOwner,
  activateCustomer,
  activateOwner,
  activateDriver,
  reactivateVehicle,
  restorePayment,
} from "../controllers/adminController.js";

import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

import upload from "../middleware/upload.js";

const router = Router();

router.use(protect, authorize("ADMIN"));

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

router.get("/owners", getOwners);
router.get("/owners/:id", getOwnerById);

router.post("/drivers", createDriver);
router.put("/drivers/:id", updateDriver);
router.delete("/drivers/:id", deleteDriver);

router.post("/customers", createCustomer);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

router.post("/vehicles", upload.single("image"), createVehicle);
router.put("/vehicles/:id", upload.single("image"), updateVehicle);
router.delete("/vehicles/:id", deleteVehicle);

router.post("/bookings", createBooking);
router.put("/bookings/:id", updateBooking);
router.delete("/bookings/:id", archiveBooking);
router.put("/bookings/:id/restore", restoreBooking);

router.post("/payments", createPayment);
router.delete("/payments/:id", voidPayment);
router.put("/payments/:id/refund", refundPayment);
router.put("/payments/:id", editPayment);

router.post("/owners", createOwner);
router.put("/owners/:id", updateOwner);
router.delete("/owners/:id", deleteOwner);

router.put("/customers/:id/activate", activateCustomer);
router.put("/owners/:id/activate", activateOwner);
router.put("/drivers/:id/activate", activateDriver);

router.put("/vehicles/:id/activate", reactivateVehicle);
router.put("/payments/:id/restore", restorePayment);

export default router;
