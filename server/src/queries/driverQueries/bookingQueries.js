import prisma from "../../prisma/prisma.js";

export async function getDriverBookings(
  driverId,
  page = 1,
  limit = 10,
  status,
) {
  const skip = (page - 1) * limit;
  const where = { driverId, ...(status && { status }) };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: true, vehicle: true, payment: true },
    }),
    prisma.booking.count({ where }),
  ]);
  return {
    bookings,
    pagination: {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
}

export async function updateTripStatus(driverId, bookingId, status) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("NOT_FOUND");
  if (booking.driverId !== driverId) throw new Error("FORBIDDEN");
  return prisma.booking.update({ where: { id: bookingId }, data: { status } });
}
