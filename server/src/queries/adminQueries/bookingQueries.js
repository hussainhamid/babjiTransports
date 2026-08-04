import prisma from "../../prisma/prisma.js";

export async function getBookings(
  page = 1,
  limit = 10,
  status,
  archived = false,
) {
  const skip = (page - 1) * limit;
  const where = {
    isArchived: archived,
    ...(status && { status }),
  };

  const [bookings, totalBookings] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        driver: { select: { id: true, name: true, phone: true } },
        vehicle: {
          select: { id: true, vehicleName: true, brand: true, model: true },
        },
        payment: true,
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      totalBookings,
      currentPage: page,
      totalPages: Math.ceil(totalBookings / limit),
      limit,
    },
  };
}

export async function getBookingById(bookingId) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      driver: true,
      vehicle: { include: { owner: true } },
      payment: true,
      invoice: true,
    },
  });
}

export async function createBooking(bookingData) {
  const {
    customerId,
    vehicleId,
    driverId,
    pickupLocation,
    destination,
    bookingDate,
    estimatedFare,
    advancePaid,
    remainingAmount,
  } = bookingData;

  return prisma.booking.create({
    data: {
      customerId,
      vehicleId,
      driverId: driverId || null,
      pickupLocation,
      destination,
      bookingDate: new Date(bookingDate),
      estimatedFare,
      advancePaid,
      remainingAmount,
    },
  });
}

export async function updateBooking(bookingId, bookingData) {
  const {
    pickupLocation,
    destination,
    bookingDate,
    estimatedFare,
    advancePaid,
    remainingAmount,
    status,
    driverId,
  } = bookingData;

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      ...(pickupLocation !== undefined && { pickupLocation }),
      ...(destination !== undefined && { destination }),
      ...(bookingDate !== undefined && { bookingDate: new Date(bookingDate) }),
      ...(estimatedFare !== undefined && { estimatedFare }),
      ...(advancePaid !== undefined && { advancePaid }),
      ...(remainingAmount !== undefined && { remainingAmount }),
      ...(status !== undefined && { status }),
      ...(driverId !== undefined && { driverId }),
    },
  });
}

export async function archiveBooking(bookingId) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { isArchived: true },
  });
}

export async function restoreBooking(bookingId) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { isArchived: false },
  });
}
