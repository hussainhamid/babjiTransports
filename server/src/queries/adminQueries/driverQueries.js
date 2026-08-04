import prisma from "../../prisma/prisma.js";

export async function getDrivers(page = 1, limit = 10, search) {
  const skip = (page - 1) * limit;
  const where = {
    role: "DRIVER",
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [drivers, totalDrivers] = await Promise.all([
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
        _count: { select: { ownedVehicles: true, assignedTrips: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    drivers,
    pagination: {
      totalDrivers,
      currentPage: page,
      totalPages: Math.ceil(totalDrivers / limit),
      limit,
    },
  };
}

export async function getDriverById(driverId) {
  return prisma.user.findUnique({
    where: { id: driverId },
    include: {
      ownedVehicles: true,
      assignedTrips: {
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, customer: true },
      },
      owners: {
        where: { isActive: true },
        include: { owner: true },
      },
      _count: {
        select: {
          ownedVehicles: true,
          assignedTrips: { where: { status: "COMPLETED" } },
        },
      },
    },
  });
}

export async function createDriver(driverData) {
  const { name, phone, email } = driverData;
  return prisma.user.create({
    data: {
      name,
      phone,
      email: email || null,
      role: "DRIVER",
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

export async function updateDriver(driverId, driverData) {
  const { name, email } = driverData;

  return prisma.user.update({
    where: { id: driverId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    },
  });
}

export async function deleteDriver(driverId) {
  return prisma.user.update({
    where: { id: driverId },
    data: { isActive: false },
  });
}

export async function activateDriver(driverId) {
  return prisma.user.update({
    where: { id: driverId },
    data: { isActive: true },
  });
}
