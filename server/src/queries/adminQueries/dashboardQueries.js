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
    prisma.user.count({ where: { role: "DRIVER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.vehicle.count(),
    prisma.booking.count(),
    prisma.payment.count(),
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
