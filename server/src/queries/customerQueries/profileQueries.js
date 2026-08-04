import prisma from "../../prisma/prisma.js";

export async function getCustomerProfile(customerId) {
  return prisma.user.findUnique({
    where: {
      id: customerId,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });
}

export async function updateCustomerProfile(customerId, data) {
  const { name, email } = data;

  return prisma.user.update({
    where: { id: customerId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    },
  });
}

export async function createCustomer(data) {
  const { name, phone, email } = data;

  return prisma.user.create({
    data: {
      name,
      phone,
      email: email || null,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });
}
