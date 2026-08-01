import prisma from "../../prisma/prisma.js";

export async function getDrivers(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [drivers, totalDrivers] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "DRIVER",
      },
      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },
      include: {
        vehicle: true,

        _count: {
          select: {
            vehicle: true,
            driverTrips: true,
          },
        },
      },
    }),

    prisma.user.count({
      where: {
        role: "DRIVER",
      },
    }),
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

export async function getDriverById(driverId) {}

export async function createDriver(driverData) {}

export async function updateDriver(driverId, driverData) {}

export async function deleteDriver(driverId) {}
