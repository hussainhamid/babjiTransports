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

    if (req.user) {
      // Trust ANY logged-in user, regardless of role — owner, driver, admin, or customer.
      customer = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!customer)
        return res.status(404).json({ message: "Account not found" });
    } else {
      if (!customerName || !customerPhone) {
        return res
          .status(400)
          .json({ message: "customerName and customerPhone are required" });
      }
      const normalized = normalizePhone(customerPhone);
      customer = await prisma.user.findUnique({ where: { phone: normalized } });
      if (!customer) {
        customer = await prisma.user.create({
          data: { name: customerName, phone: normalized, role: "CUSTOMER" },
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
function getBookingRole(userId, userRole, booking) {
  if (userRole === "ADMIN") return "ADMIN";
  if (userId === booking.customerId) return "CUSTOMER";
  if (userId === booking.vehicle.ownerId) return "OWNER";
  if (userId === booking.driverId) return "DRIVER";
  return null;
}

async function loadBookingWithAccess(bookingId, userId, userRole) {
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
  const role = getBookingRole(userId, userRole, booking); // ← now takes userRole
  if (!role) return { error: "FORBIDDEN" };
  return { booking, role };
}

export async function getBookingDetail(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
      req.user.role,
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
      req.user.role,
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
      req.user.role,
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
      req.user.role,
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
    if (
      booking.payment?.status === "ADVANCE_PAID" ||
      booking.payment?.status === "COMPLETED"
    ) {
      return res.status(400).json({ message: "Advance has already been paid" });
    }

    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        advanceAmount: booking.advancePaid,
        amountPaid: { increment: booking.advancePaid },
        status: "ADVANCE_PAID",
      },
      create: {
        bookingId: booking.id,
        advanceAmount: booking.advancePaid,
        amountPaid: booking.advancePaid,
        companyCommission: 0,
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
      req.user.role,
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
    if (!booking.driverArrivedDestinationAt) {
      return res.status(400).json({
        message: "Mark 'Arrived at Destination' before completing the trip.",
      });
    }

    // All five cost fields must be explicitly provided — "0" is fine, missing/blank is not.
    const costFields = [
      "fuelCost",
      "tollCost",
      "parkingCost",
      "fineCost",
      "otherCost",
    ];
    for (const field of costFields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
      ) {
        return res.status(400).json({
          message: `${field} is required — enter 0 if there was none`,
        });
      }
    }

    const fuelCost = Number(req.body.fuelCost);
    const tollCost = Number(req.body.tollCost);
    const parkingCost = Number(req.body.parkingCost);
    const fineCost = Number(req.body.fineCost);
    const otherCost = Number(req.body.otherCost);
    const extras = fuelCost + tollCost + parkingCost + fineCost + otherCost;
    const companyCommission =
      Math.round(booking.estimatedFare * COMMISSION_RATE * 100) / 100;
    const totalAmount = booking.estimatedFare + extras + companyCommission;
    const driverAmount = booking.estimatedFare + extras - companyCommission;

    const [updatedBooking, invoice, payment] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "PAYMENT_PENDING" },
      }), // NOT "COMPLETED" — that only happens once paid
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
        update: { finalAmount: totalAmount, companyCommission, driverAmount },
        create: {
          bookingId: booking.id,
          advanceAmount: booking.advancePaid || 0,
          amountPaid: 0,
          finalAmount: totalAmount,
          companyCommission,
          driverAmount,
          status: "PENDING",
        },
      }),
    ]);

    return res.status(200).json({ booking: updatedBooking, invoice, payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to complete booking" });
  }
}

export async function payFinalAmount(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
      req.user.role,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN" || role !== "CUSTOMER") {
      return res
        .status(403)
        .json({ message: "Only the customer can pay the invoice" });
    }
    if (!booking.invoice || !booking.payment) {
      return res.status(400).json({
        message: "No invoice exists yet — the trip must be completed first",
      });
    }
    if (booking.payment.status === "COMPLETED") {
      return res
        .status(400)
        .json({ message: "This invoice is already fully paid" });
    }

    const amountDue = booking.invoice.totalAmount - booking.payment.amountPaid;

    const [payment, updatedBooking] = await prisma.$transaction([
      prisma.payment.update({
        where: { bookingId: booking.id },
        data: { amountPaid: { increment: amountDue }, status: "COMPLETED" },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED" }, // ← the real "trip fully closed" trigger
      }),
    ]);

    return res.status(200).json({ payment, booking: updatedBooking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to process payment" });
  }
}

export async function updateInvoice(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
      req.user.role,
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

export async function updateTripEvent(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
      req.user.role,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN" || (role !== "DRIVER" && role !== "OWNER")) {
      return res
        .status(403)
        .json({ message: "Only the assigned driver can update trip progress" });
    }

    const { event } = req.body;
    const data = {};

    if (event === "ARRIVED_PICKUP") {
      data.driverArrivedPickupAt = new Date();
      data.status = "ONGOING";
    } else if (event === "ARRIVED_DESTINATION") {
      data.driverArrivedDestinationAt = new Date();
    } else {
      return res.status(400).json({ message: "Invalid event" });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data,
    });
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update trip status" });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { booking, role, error } = await loadBookingWithAccess(
      req.params.id,
      req.user.id,
      req.user.role,
    );
    if (error === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (error === "FORBIDDEN")
      return res
        .status(403)
        .json({ message: "You don't have access to this booking" });

    if (!["CUSTOMER", "OWNER", "ADMIN"].includes(role)) {
      return res
        .status(403)
        .json({ message: "Drivers cannot cancel a booking" });
    }
    if (
      ["ONGOING", "PAYMENT_PENDING", "COMPLETED", "CANCELLED"].includes(
        booking.status,
      )
    ) {
      return res.status(400).json({
        message: `A booking that is ${booking.status.toLowerCase().replace("_", " ")} can no longer be cancelled`,
      });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to cancel booking" });
  }
}

export async function getBookings(req, res) {
  try {
    const { id, role } = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let where = {};
    if (role === "CUSTOMER") where = { customerId: id };
    else if (role === "DRIVER") where = { driverId: id };
    else if (role === "OWNER") where = { vehicle: { ownerId: id } };
    // ADMIN: no filter at all — sees every booking on the platform

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          driver: { select: { id: true, name: true, phone: true } },
          vehicle: {
            include: {
              owner: { select: { id: true, name: true, phone: true } },
            },
          },
          payment: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return res.status(200).json({
      bookings,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch bookings" });
  }
}
