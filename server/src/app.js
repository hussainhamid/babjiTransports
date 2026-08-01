import express from "express";
import cors from "cors";

import vehicleRoutes from "./routes/vehicleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/owners", ownerRoutes);

app.use("/auth", authRoutes);

app.use("/vehicles", vehicleRoutes);

app.use("/bookings", bookingRoutes);

app.use("/driver", driverRoutes);

app.use("/customer", customerRoutes);

app.use("/admin", adminRoutes);
export default app;
