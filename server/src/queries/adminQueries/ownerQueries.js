import prisma from "../../prisma/prisma.js";

export async function getOwners(page = 1, limit = 10, search) {
  const skip = (page - 1) * limit;
  const where = {
    role: "OWNER",
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [owners, totalOwners] = await Promise.all([
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
        _count: { select: { ownedVehicles: true, managedDrivers: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    owners,
    pagination: {
      totalOwners,
      currentPage: page,
      totalPages: Math.ceil(totalOwners / limit),
      limit,
    },
  };
}

export async function getOwnerById(ownerId) {
  const [owner, completedTrips] = await Promise.all([
    prisma.user.findUnique({
      where: { id: ownerId },
      include: {
        ownedVehicles: true,
        managedDrivers: {
          where: { isActive: true },
          include: { driver: true },
        },
        _count: { select: { ownedVehicles: true, managedDrivers: true } },
      },
    }),

    prisma.booking.count({
      where: {
        vehicle: { ownerId },
        status: "COMPLETED",
      },
    }),
  ]);

  if (!owner) return null;

  return {
    ...owner,
    completedTripsCount: completedTrips,
  };
}

export async function createOwner(ownerData) {
  const { name, phone, email } = ownerData;

  return prisma.user.create({
    data: { name, phone, email: email || null, role: "OWNER" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateOwner(ownerId, ownerData) {
  const { name, email } = ownerData;

  return prisma.user.update({
    where: { id: ownerId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: email || null }),
    },
  });
}

export async function deleteOwner(ownerId) {
  return prisma.user.update({
    where: { id: ownerId },
    data: { isActive: false },
  });
}

export async function activateOwner(ownerId) {
  return prisma.user.update({
    where: { id: ownerId },
    data: { isActive: true },
  });
}
