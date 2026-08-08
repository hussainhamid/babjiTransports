import { Router } from "express";

import {
  getOwnerDashboard,
  getAllOwners,
  getOwner,
  createNewOwner,
  updateExistingOwnerDetaIls,
  deleteOwnerDetails,
  getOwnerDrivers,
  getOwnerVehicles,
  assignDriverToBooking,
  unassignDriverFromBooking,
  getBookingsForOwner,
  quoteBookingFare,
  addDriver,
  browseVerifiedDrivers,
  linkDriver,
} from "../controllers/ownerController.js";

const router = Router();

router.get("/:ownerId/dashboard", getOwnerDashboard);
router.get("/", getAllOwners);
router.get("/:ownerId", getOwner);
router.post("/", createNewOwner);
router.put("/:ownerId", updateExistingOwnerDetaIls);
router.delete("/:ownerId", deleteOwnerDetails);
router.get("/:ownerId/drivers", getOwnerDrivers);
router.get("/:ownerId/vehicles", getOwnerVehicles);
router.post(
  "/:ownerId/bookings/:bookingId/assign-driver",
  assignDriverToBooking,
);
router.post(
  "/:ownerId/bookings/:bookingId/unassign-driver",
  unassignDriverFromBooking,
);
router.get("/:ownerId/bookings", getBookingsForOwner);
router.post("/:ownerId/drivers", addDriver);
router.put("/:ownerId/bookings/:bookingId/quote", quoteBookingFare);
router.get("/:ownerId/available-drivers", browseVerifiedDrivers);
router.post("/:ownerId/drivers/link", linkDriver);

export default router;
