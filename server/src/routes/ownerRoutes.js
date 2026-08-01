import { Router } from "express";

import {
  getAllOwners,
  getOwner,
  createNewOwner,
  updateExistingOwnerDetaIls,
  deleteOwnerDetails,
  getOwnerDrivers,
  getOwnerVehicles,
  assignDriverToBooking,
  unassignDriverFromBooking,
} from "../controllers/ownerController.js";

const router = Router();

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

export default router;
