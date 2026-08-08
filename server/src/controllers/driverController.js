import prisma from "../prisma/prisma.js";
import { getDriverDashboardStats } from "../queries/driverQueries/dashboardQueries.js";
import {
  getDriverBookings,
  updateTripStatus,
} from "../queries/driverQueries/bookingQueries.js";
import { normalizePhone } from "../utils/normalizePhone.js";

export async function getDashboard(req, res) {
  try {
    const stats = await getDriverDashboardStats(req.user.id);
    return res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch dashboard" });
  }
}

export async function getMyVehicles(req, res) {
  try {
    // Vehicles belonging to the owner(s) this driver is actively linked to
    const relations = await prisma.driverOwner.findMany({
      where: { driverId: req.user.id, isActive: true },
      include: { owner: { include: { ownedVehicles: true } } },
    });
    const vehicles = relations.flatMap((r) => r.owner.ownedVehicles);
    return res.status(200).json(vehicles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch vehicles" });
  }
}

export async function getMyBookings(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const bookings = await getDriverBookings(
      req.user.id,
      page,
      limit,
      req.query.status,
    );
    return res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch bookings" });
  }
}

export async function updateMyTripStatus(req, res) {
  try {
    const booking = await updateTripStatus(
      req.user.id,
      req.params.bookingId,
      req.body.status,
    );
    return res.status(200).json(booking);
  } catch (err) {
    if (err.message === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (err.message === "FORBIDDEN")
      return res
        .status(403)
        .json({ message: "This trip is not assigned to you" });
    if (err.message === "INVALID_TRANSITION")
      return res
        .status(400)
        .json({
          message:
            "Trips can only be completed via the invoice flow, not this shortcut",
        });
    console.error(err);
    return res.status(500).json({ message: "Unable to update trip status" });
  }
}

export async function applyAsDriver(req, res) {
  try {
    const { name, phone, city, licenseNumber, experienceYears } = req.body;
    if (!name || !phone || !licenseNumber) {
      return res
        .status(400)
        .json({ message: "name, phone and licenseNumber are required" });
    }

    const normalized = normalizePhone(phone);
    let driver = await prisma.user.findUnique({ where: { phone: normalized } });

    const driverFields = {
      city,
      licenseNumber,
      experienceYears: experienceYears ? Number(experienceYears) : null,
      driverFeePaid: true, // simulated payment for now — real Razorpay charge replaces this later
    };

    if (driver) {
      // Existing account (customer/owner/whatever) gaining driver capability — role is left untouched.
      driver = await prisma.user.update({
        where: { id: driver.id },
        data: driverFields,
      });
    } else {
      // Brand new applicant — role defaults to DRIVER since this is their first registration.
      driver = await prisma.user.create({
        data: { name, phone: normalized, role: "DRIVER", ...driverFields },
      });
    }

    return res
      .status(201)
      .json({ message: "You're now registered as a driver!", driver });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to submit application" });
  }
}
