import prisma from "../../prisma/prisma.js";

export async function getBookingsByCustomerId(
  customerId,
  page = 1,
  limit = 10,
  status,
) {
  const skip = (page - 1) * limit;
  const where = { customerId, ...(status && { status }) };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        driver: true,
        vehicle: true,
        payment: true,
      },
    }),
    prisma.booking.count({
      where,
    }),
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

export async function getCustomerDashboardStats(customerId) {
  const [totalBookings, activeBookings, completedBookings, recentBookings] =
    await Promise.all([
      prisma.booking.count({ where: { customerId } }),
      prisma.booking.count({
        where: {
          customerId,
          status: { in: ["CONFIRMED", "DRIVER_ASSIGNED", "ONGOING"] },
        },
      }),
      prisma.booking.count({ where: { customerId, status: "COMPLETED" } }),
      prisma.booking.findMany({
        where: { customerId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, driver: true },
      }),
    ]);

  const spendResult = await prisma.booking.aggregate({
    where: { customerId, status: "COMPLETED" },
    _sum: {
      advancePaid: true,
      remainingAmount: true,
    },
  });

  return {
    totalBookings,
    activeBookings,
    completedBookings,
    totalSpent:
      (spendResult._sum.advancePaid || 0) +
      (spendResult._sum.remainingAmount || 0),
    recentBookings,
  };
}
