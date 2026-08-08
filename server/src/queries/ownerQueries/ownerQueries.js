import prisma from "../../prisma/prisma.js";
import { normalizePhone } from "../../utils/normalizePhone.js";

export async function getOwnerDashboardStats(ownerId) {
  const [totalVehicles, availableVehicles, totalDrivers, vehicles] =
    await Promise.all([
      prisma.vehicle.count({ where: { ownerId } }),
      prisma.vehicle.count({ where: { ownerId, isAvailable: true } }),
      prisma.driverOwner.count({ where: { ownerId, isActive: true } }),
      prisma.vehicle.findMany({ where: { ownerId }, select: { id: true } }),
    ]);

  const vehicleIds = vehicles.map((v) => v.id);

  const [totalBookings, activeBookings, revenue, recentBookings] =
    await Promise.all([
      prisma.booking.count({ where: { vehicleId: { in: vehicleIds } } }),
      prisma.booking.count({
        where: {
          vehicleId: { in: vehicleIds },
          status: { in: ["CONFIRMED", "DRIVER_ASSIGNED", "ONGOING"] },
        },
      }),

      prisma.booking.findMany({
        where: { vehicleId: { in: vehicleIds } },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, customer: true, driver: true },
      }),
    ]);

  const revenueResult = await prisma.payment.aggregate({
    where: { booking: { vehicleId: { in: vehicleIds } } },
    _sum: { amountPaid: true },
  });

  return {
    totalVehicles,
    availableVehicles,
    totalDrivers,
    totalBookings,
    activeBookings,
    totalRevenue: revenueResult._sum.amountPaid || 0,
    recentBookings,
  };
}

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

export async function getOwnerBookings(ownerId, page = 1, limit = 10, status) {
  const skip = (page - 1) * limit;
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const vehicleIds = vehicles.map((v) => v.id);

  const where = { vehicleId: { in: vehicleIds }, ...(status && { status }) };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        driver: { select: { id: true, name: true, phone: true } },
        vehicle: { select: { id: true, vehicleName: true } },
        payment: true,
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
}

export async function quoteBooking(ownerId, bookingId, data) {
  const { estimatedFare, advancePaid, driverId } = data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { vehicle: true },
  });
  if (!booking) throw new Error("NOT_FOUND");
  if (booking.vehicle.ownerId !== ownerId) throw new Error("FORBIDDEN");

  const advance = Number(advancePaid) || 0;

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      estimatedFare: Number(estimatedFare),
      advancePaid: advance,
      remainingAmount: Number(estimatedFare) - advance,
      ...(driverId && { driverId }),
      status: driverId ? "DRIVER_ASSIGNED" : "CONFIRMED",
    },
  });
}

export async function createAndAssignDriver(ownerId, { name, phone }) {
  const normalized = normalizePhone(phone);
  let driver = await prisma.user.findUnique({ where: { phone: normalized } });

  if (!driver) {
    // Owner is vouching for someone brand new — trusted immediately, no separate verification needed.
    driver = await prisma.user.create({
      data: { name, phone: normalized, role: "DRIVER", isVerified: true },
    });
  } else if (!driver.isVerified) {
    throw new Error("NOT_VERIFIED");
  }

  await prisma.driverOwner.upsert({
    where: { ownerId_driverId: { ownerId, driverId: driver.id } },
    update: { isActive: true },
    create: { ownerId, driverId: driver.id, isActive: true },
  });
  return driver;
}

// New — browse the pool of publicly-applied, admin-verified drivers not yet linked to this owner
export async function getAvailableVerifiedDrivers(ownerId, search) {
  const linked = await prisma.driverOwner.findMany({
    where: { ownerId },
    select: { driverId: true },
  });
  const linkedIds = linked.map((l) => l.driverId);

  return prisma.user.findMany({
    where: {
      driverFeePaid: true, // ← the actual gate now, not role or isVerified
      licenseNumber: { not: null },
      id: { notIn: [...linkedIds, ownerId] }, // exclude already-linked drivers and the owner (they get "drive it myself" separately)
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      }),
    },
    select: {
      id: true,
      name: true,
      phone: true,
      city: true,
      experienceYears: true,
    },
    take: 20,
  });
}

export async function linkVerifiedDriver(ownerId, driverId) {
  const driver = await prisma.user.findUnique({ where: { id: driverId } });
  if (!driver || !driver.driverFeePaid) throw new Error("NOT_PAID");
  return prisma.driverOwner.upsert({
    where: { ownerId_driverId: { ownerId, driverId } },
    update: { isActive: true },
    create: { ownerId, driverId, isActive: true },
  });
}
