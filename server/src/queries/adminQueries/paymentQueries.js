import prisma from "../../prisma/prisma.js";

export async function getPayments(page = 1, limit = 10, voided = false) {
  const skip = (page - 1) * limit;
  const where = { isVoided: voided };

  const [payments, totalPayments] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: {
            id: true,
            pickupLocation: true,
            destination: true,
            customer: { select: { id: true, name: true, phone: true } },
            vehicle: { select: { id: true, vehicleName: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      totalPayments,
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit),
      limit,
    },
  };
}
export async function getPaymentById(paymentId) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { include: { customer: true, driver: true, vehicle: true } },
    },
  });
}

export async function createPayment(paymentData) {
  const {
    bookingId,
    advanceAmount,
    finalAmount,
    companyCommission,
    driverAmount,
    status,
  } = paymentData;

  const existing = await prisma.payment.findUnique({ where: { bookingId } });
  if (existing) {
    throw new Error("This booking already has a payment record");
  }

  return prisma.payment.create({
    data: {
      bookingId,
      advanceAmount,
      finalAmount: finalAmount ?? null,
      companyCommission,
      driverAmount,
      status: status || "PENDING",
    },
  });
}

export async function voidPayment(paymentId) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { isVoided: true, status: "VOIDED" },
  });
}

export async function refundPayment(paymentId) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED" },
  });
}

export async function editPayment(paymentId, data) {
  const { finalAmount, companyCommission, driverAmount, status } = data;

  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...(finalAmount !== undefined && { finalAmount }),
      ...(companyCommission !== undefined && { companyCommission }),
      ...(driverAmount !== undefined && { driverAmount }),
      ...(status !== undefined && { status }),
    },
  });
}

export async function restorePayment(paymentId) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { isVoided: false },
  });
}
