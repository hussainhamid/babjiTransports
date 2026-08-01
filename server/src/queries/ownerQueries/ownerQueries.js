import prisma from "../../prisma/prisma.js";

export async function getOwners(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [owners, totalOwners] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "OWNER",
      },

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        ownedVehicles: true,

        managedDrivers: {
          include: {
            driver: true,
          },
        },

        _count: {
          select: {
            ownedVehicles: true,
            managedDrivers: true,
          },
        },
      },
    }),

    prisma.user.count({
      where: {
        role: "OWNER",
      },
    }),
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
  return prisma.user.findUnique({
    where: {
      id: ownerId,
    },

    include: {
      ownedVehicles: true,
      managedDrivers: {
        include: {
          driver: true,
        },
      },
    },
  });
}

export async function createOwner(ownerData) {
  return prisma.user.create({
    data: {
      ...ownerData,
      role: "OWNER",
    },
  });
}

export async function updateOwner(ownerId, ownerData) {
  return prisma.user.update({
    where: {
      id: ownerId,
    },
    data: {
      ...ownerData,
    },
  });
}

export async function deleteOwner(ownerId) {
  return prisma.user.delete({
    where: {
      id: ownerId,
    },
  });
}

export async function addDriverToOwner(ownerId, driverId) {
  return prisma.driverOwner.create({
    data: {
      ownerId,
      driverId,
    },

    include: {
      owner: true,
      driver: true,
    },
  });
}

export async function removeDriverFromOwner(ownerId, driverId) {
  return prisma.driverOwner.update({
    where: {
      ownerId_driverId: {
        ownerId,
        driverId,
      },
    },

    data: {
      isActive: false,
    },
  });
}

export async function getDriversByOwnerId(ownerId) {
  return prisma.driverOwner.findMany({
    where: {
      ownerId: ownerId,
    },
    include: {
      driver: true,
    },

    orderBy: {
      joinedAt: "desc",
    },
  });
}

export async function getVehiclesByOwnerId(ownerId) {
  return prisma.vehicle.findMany({
    where: {
      ownerId,
    },

    include: {
      bookings: {
        include: {
          customer: true,
          driver: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function assignDriver(ownerId, bookingId, driverId) {
  const relationship = await prisma.driverOwner.findUnique({
    where: {
      ownerId_driverId: {
        ownerId,
        driverId,
      },
    },
  });

  if (!relationship || !relationship.isActive) {
    throw new Error("Driver does not belong to this owner.");
  }

  return prisma.booking.update({
    where: {
      id: bookingId,
    },

    data: {
      driverId,
      status: "DRIVER_ASSIGNED",
    },

    include: {
      customer: true,
      vehicle: true,
      driver: true,
    },
  });
}

export async function reassignDriver(ownerId, driverId) {
  return prisma.driverOwner.update({
    where: {
      ownerId_driverId: {
        ownerId,
        driverId,
      },
    },

    data: {
      isActive: true,
    },
  });
}

export async function unassignDriver(bookingId) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      driverId: null,
      status: "PENDING",
    },
    include: {
      customer: true,
      vehicle: true,
    },
  });
}
