import prisma from "../../prisma/prisma.js";

export async function getDriverDashboardStats(driverId) {
  const [totalTrips, activeTrips, completedTrips, upcomingTrips] =
    await Promise.all([
      prisma.booking.count({ where: { driverId } }),
      prisma.booking.count({
        where: {
          driverId,
          status: { in: ["DRIVER_ASSIGNED", "CONFIRMED", "ONGOING"] },
        },
      }),
      prisma.booking.count({ where: { driverId, status: "COMPLETED" } }),
      prisma.booking.findMany({
        where: {
          driverId,
          status: { in: ["DRIVER_ASSIGNED", "CONFIRMED", "ONGOING"] },
        },
        orderBy: { bookingDate: "asc" },
        include: { customer: true, vehicle: true },
      }),
    ]);
  return { totalTrips, activeTrips, completedTrips, upcomingTrips };
}
