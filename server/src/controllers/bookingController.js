import prisma from "../prisma/prisma.js";
import { generateToken } from "../utils/jwt.js";

import { normalizePhone } from "../utils/normalizePhone.js";

export async function createBooking(req, res) {
  try {
    const {
      vehicleId,
      pickupLocation,
      destination,
      bookingDate,
      customerName,
    } = req.body;

    const customerPhone = normalizePhone(req.body.customerPhone);

    if (!vehicleId || !pickupLocation || !destination || !bookingDate) {
      return res.status(400).json({
        message:
          "vehicleId, pickupLocation, destination and bookingDate are required",
      });
    }

    let customer;
    let token;

    if (req.user && req.user.role === "CUSTOMER") {
      customer = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!customer)
        return res.status(404).json({ message: "Customer account not found" });
    } else {
      // Anonymous, or logged in as a non-customer role (owner/driver/admin browsing as a guest booker)
      if (!customerName || !customerPhone) {
        return res
          .status(400)
          .json({ message: "customerName and customerPhone are required" });
      }
      customer = await prisma.user.findUnique({
        where: { phone: customerPhone },
      });
      if (!customer) {
        customer = await prisma.user.create({
          data: { name: customerName, phone: customerPhone, role: "CUSTOMER" },
        });
      }
      token = generateToken(customer);
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        vehicleId,
        pickupLocation,
        destination,
        bookingDate: new Date(bookingDate),
        // estimatedFare/advancePaid/remainingAmount stay null — the owner sets these next
      },
      include: { vehicle: { include: { owner: true } } },
    });

    return res.status(201).json({ booking, token });
  } catch (err) {
    console.error(err);
    if (err.code === "P2003")
      return res.status(400).json({ message: "Invalid vehicleId" });
    return res.status(500).json({ message: "Unable to create booking" });
  }
}

// Figures out how the requesting user relates to this booking — used to gate every action below.
function getBookingRole(userId, booking) {
  if (userId === booking.customerId) return "CUSTOMER";
  if (userId === booking.vehicle.ownerId) return "OWNER";
  if (userId === booking.driverId) return "DRIVER";
  return null;
}

async function loadBookingWithAccess(bookingId, userId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      driver: true,
      vehicle: { include: { owner: true } },
      payment: true,
      invoice: true,
    },
  });
  if (!booking) return { error: "NOT_FOUND" };
  const role = getBookingRole(userId, booking);
  if (!role) return { error: "FORBIDDEN" };
  return { booking, role };
}

export async function getBookingDetail(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN")
      return res
        .status(403)
        .json({ message: "You don't have access to this booking" });
    return res.status(200).json({ ...booking, viewerRole: role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch booking" });
  }
}

export async function updateBookingDetail(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN")
      return res
        .status(403)
        .json({ message: "You don't have access to this booking" });

    const {
      pickupLocation,
      destination,
      bookingDate,
      estimatedFare,
      advancePaid,
    } = req.body;

    if (role === "CUSTOMER") {
      if (booking.status !== "PENDING") {
        return res.status(400).json({
          message:
            "You can only edit a booking before the owner has confirmed it.",
        });
      }
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          ...(pickupLocation !== undefined && { pickupLocation }),
          ...(destination !== undefined && { destination }),
          ...(bookingDate !== undefined && {
            bookingDate: new Date(bookingDate),
          }),
        },
      });
      return res.status(200).json(updated);
    }

    if (role === "OWNER") {
      const advance =
        advancePaid !== undefined ? Number(advancePaid) : booking.advancePaid;
      const fare =
        estimatedFare !== undefined
          ? Number(estimatedFare)
          : booking.estimatedFare;
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          ...(pickupLocation !== undefined && { pickupLocation }),
          ...(destination !== undefined && { destination }),
          ...(bookingDate !== undefined && {
            bookingDate: new Date(bookingDate),
          }),
          ...(estimatedFare !== undefined && { estimatedFare: fare }),
          ...(advancePaid !== undefined && {
            advancePaid: advance,
            remainingAmount: fare != null ? fare - advance : undefined,
          }),
          ...(booking.status === "PENDING" &&
            estimatedFare !== undefined && { status: "CONFIRMED" }),
        },
      });
      return res.status(200).json(updated);
    }

    return res
      .status(403)
      .json({ message: "Drivers cannot edit booking details" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update booking" });
  }
}

export async function assignDriverToBooking(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN" || role !== "OWNER") {
      return res
        .status(403)
        .json({ message: "Only the vehicle's owner can assign a driver" });
    }

    const { driverId } = req.body;
    if (!driverId)
      return res.status(400).json({ message: "driverId is required" });

    // Owner assigning themself as the driver — always allowed, no DriverOwner link needed.
    if (driverId !== booking.vehicle.ownerId) {
      const relation = await prisma.driverOwner.findUnique({
        where: {
          ownerId_driverId: { ownerId: booking.vehicle.ownerId, driverId },
        },
      });
      if (!relation || !relation.isActive) {
        return res
          .status(400)
          .json({ message: "This driver is not linked to your account" });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        driverId,
        status:
          booking.estimatedFare != null ? "DRIVER_ASSIGNED" : booking.status,
      },
    });
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to assign driver" });
  }
}

export async function payAdvance(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN" || role !== "CUSTOMER") {
      return res
        .status(403)
        .json({ message: "Only the customer can pay the advance" });
    }
    if (booking.advancePaid == null) {
      return res
        .status(400)
        .json({ message: "The owner hasn't set an advance amount yet" });
    }
    if (booking.payment && booking.payment.status !== "PENDING") {
      return res.status(400).json({
        message: "Advance has already been recorded for this booking",
      });
    }

    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { advanceAmount: booking.advancePaid, status: "ADVANCE_PAID" },
      create: {
        bookingId: booking.id,
        advanceAmount: booking.advancePaid,
        companyCommission: 0, // filled in for real once the trip completes
        driverAmount: 0,
        status: "ADVANCE_PAID",
      },
    });
    return res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to record advance payment" });
  }
}

const COMMISSION_RATE = 0.2; // 20% — adjust here if this ever needs to be configurable

export async function completeBooking(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN" || (role !== "OWNER" && role !== "DRIVER")) {
      return res.status(403).json({
        message: "Only the owner or assigned driver can complete this trip",
      });
    }
    if (booking.estimatedFare == null) {
      return res
        .status(400)
        .json({ message: "This booking has no fare set yet" });
    }

    const fuelCost = Number(req.body.fuelCost) || 0;
    const tollCost = Number(req.body.tollCost) || 0;
    const parkingCost = Number(req.body.parkingCost) || 0;
    const fineCost = Number(req.body.fineCost) || 0;
    const otherCost = Number(req.body.otherCost) || 0;

    const extras = fuelCost + tollCost + parkingCost + fineCost + otherCost;
    const companyCommission =
      Math.round(booking.estimatedFare * COMMISSION_RATE * 100) / 100;
    const totalAmount = booking.estimatedFare + extras + companyCommission;
    const driverAmount = booking.estimatedFare + extras - companyCommission;

    const [updatedBooking, invoice, payment] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED" },
      }),
      prisma.invoice.upsert({
        where: { bookingId: booking.id },
        update: {
          fuelCost,
          tollCost,
          parkingCost,
          fineCost,
          otherCost,
          totalAmount,
        },
        create: {
          bookingId: booking.id,
          fuelCost,
          tollCost,
          parkingCost,
          fineCost,
          otherCost,
          totalAmount,
        },
      }),
      prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: {
          finalAmount: totalAmount,
          companyCommission,
          driverAmount,
          status: "COMPLETED",
        },
        create: {
          bookingId: booking.id,
          advanceAmount: booking.advancePaid || 0,
          finalAmount: totalAmount,
          companyCommission,
          driverAmount,
          status: "COMPLETED",
        },
      }),
    ]);

    return res.status(200).json({ booking: updatedBooking, invoice, payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to complete booking" });
  }
}

export async function updateInvoice(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN" || (role !== "OWNER" && role !== "DRIVER")) {
      return res
        .status(403)
        .json({ message: "Only the owner or driver can edit the invoice" });
    }
    if (!booking.invoice)
      return res
        .status(400)
        .json({ message: "No invoice exists yet — complete the trip first" });

    const fuelCost = Number(req.body.fuelCost) ?? booking.invoice.fuelCost;
    const tollCost = Number(req.body.tollCost) ?? booking.invoice.tollCost;
    const parkingCost =
      Number(req.body.parkingCost) ?? booking.invoice.parkingCost;
    const fineCost = Number(req.body.fineCost) ?? booking.invoice.fineCost;
    const otherCost = Number(req.body.otherCost) ?? booking.invoice.otherCost;

    // companyCommission is intentionally recalculated, never taken from req.body — this is what makes it non-editable.
    const extras = fuelCost + tollCost + parkingCost + fineCost + otherCost;
    const companyCommission =
      Math.round(booking.estimatedFare * COMMISSION_RATE * 100) / 100;
    const totalAmount = booking.estimatedFare + extras + companyCommission;
    const driverAmount = booking.estimatedFare + extras - companyCommission;

    const [invoice, payment] = await prisma.$transaction([
      prisma.invoice.update({
        where: { bookingId: booking.id },
        data: {
          fuelCost,
          tollCost,
          parkingCost,
          fineCost,
          otherCost,
          totalAmount,
        },
      }),
      prisma.payment.update({
        where: { bookingId: booking.id },
        data: { finalAmount: totalAmount, companyCommission, driverAmount },
      }),
    ]);

    return res.status(200).json({ invoice, payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update invoice" });
  }
}

export async function cancelBooking(req, res) {}

export async function getBookings(req, res) {}

export async function getBookingById(req, res) {}
