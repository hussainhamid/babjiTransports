import prisma from "../../prisma/prisma.js";

export async function getDashboardStats() {
  const [
    totalDrivers,
    totalCustomers,
    totalOwners,
    totalVehicles,
    totalBookings,
    totalPayments,
  ] = await Promise.all([
    prisma.User.count({
      where: { role: "DRIVER" },
    }),
    prisma.User.count({
      where: { role: "CUSTOMER" },
    }),
    prisma.User.count({
      where: { role: "OWNER" },
    }),
    prisma.Vehicle.count(),
    prisma.Booking.count(),
    prisma.Payment.count(),
  ]);

  return {
    totalDrivers,
    totalCustomers,
    totalOwners,
    totalVehicles,
    totalBookings,
    totalPayments,
  };
}
