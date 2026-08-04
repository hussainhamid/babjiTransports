import prisma from "../../prisma/prisma.js";

export async function getCustomers(page = 1, limit = 10, search) {
  const skip = (page - 1) * limit;
  const where = {
    role: "CUSTOMER",
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [customers, totalCustomers] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        _count: { select: { customerTrips: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      totalCustomers,
      currentPage: page,
      totalPages: Math.ceil(totalCustomers / limit),
      limit,
    },
  };
}

export async function getCustomerById(customerId) {
  return prisma.user.findUnique({
    where: { id: customerId },
    include: {
      customerTrips: {
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, driver: true, payment: true },
      },
      _count: { select: { customerTrips: true } },
    },
  });
}
export async function createCustomer(customerData) {
  const { name, phone, email } = customerData;

  return prisma.user.create({
    data: {
      name,
      phone,
      email,
      role: "CUSTOMER",
      isVerified: true,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateCustomer(customerId, customerData) {
  const { name, email } = customerData;

  return prisma.user.update({
    where: { id: customerId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: email || null }),
    },
  });
}

export async function deleteCustomer(customerId) {
  return prisma.user.update({
    where: { id: customerId },
    data: { isActive: false },
  });
}

export async function activateCustomer(customerId) {
  return prisma.user.update({
    where: { id: customerId },
    data: { isActive: true },
  });
}
