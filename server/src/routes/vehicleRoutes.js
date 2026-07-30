import express from "express";
import {
  createVehicle,
  getLatestVehicles,
} from "../controllers/vehicleController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/create", upload.single("image"), createVehicle);
router.get("/", getLatestVehicles);

export default router;
