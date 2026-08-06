import express from "express";
import {
  createVehicle,
  getLatestVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

import upload from "../middleware/upload.js";
import { attachUserIfPresent } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/create",
  attachUserIfPresent,
  upload.single("image"),
  createVehicle,
);
router.get("/", getLatestVehicles);
router.get("/:id", getVehicleById);
router.put("/:id", upload.single("image"), updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
