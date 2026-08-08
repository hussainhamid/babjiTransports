import prisma from "../../prisma/prisma.js";

export async function getDashboardStats() {
  const [
    totalDrivers,
    totalCustomers,
    totalOwners,
    totalVehicles,
    totalBookings,
    totalPayments,
    earningsResult,
    commissionResult,
  ] = await Promise.all([
    prisma.user.count({ where: { driverFeePaid: true } }), // ← was role: "DRIVER"
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.vehicle.count(),
    prisma.booking.count(),
    prisma.payment.count(),
    prisma.payment.aggregate({ _sum: { amountPaid: true } }),
    prisma.payment.aggregate({
      where: { finalAmount: { not: null } },
      _sum: { companyCommission: true },
    }),
  ]);

  return {
    totalDrivers,
    totalCustomers,
    totalOwners,
    totalVehicles,
    totalBookings,
    totalPayments,
    totalEarnings: earningsResult._sum.amountPaid || 0,
    totalCommission: commissionResult._sum.companyCommission || 0,
  };
}
