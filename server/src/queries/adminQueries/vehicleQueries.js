import prisma from "../../prisma/prisma.js";

export async function getVehicles(page = 1, limit = 10, search) {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { vehicleName: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [vehicles, totalVehicles] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, phone: true } },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return {
    vehicles,
    pagination: {
      totalVehicles,
      currentPage: page,
      totalPages: Math.ceil(totalVehicles / limit),
      limit,
    },
  };
}

export async function reactivateVehicle(vehicleId) {
  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: { isAvailable: true },
  });
}

export async function getVehicleById(vehicleId) {
  return prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      owner: true,
      bookings: {
        orderBy: { createdAt: "desc" },
        include: { customer: true, driver: true },
      },
      _count: {
        select: {
          bookings: { where: { status: "COMPLETED" } },
        },
      },
    },
  });
}

export async function createVehicle(vehicleData) {
  const {
    ownerId,
    vehicleName,
    brand,
    model,
    category,
    fuelType,
    transmission,
    seats,
    loadCapacity,
    city,
    image,
    pricePerKm,
    minimumFare,
  } = vehicleData;

  return prisma.vehicle.create({
    data: {
      ownerId,
      vehicleName,
      brand,
      model,
      category,
      fuelType,
      transmission,
      seats,
      loadCapacity,
      city,
      image,
      pricePerKm,
      minimumFare,
    },
  });
}

export async function updateVehicle(vehicleId, vehicleData) {
  const {
    vehicleName,
    brand,
    model,
    category,
    fuelType,
    transmission,
    seats,
    loadCapacity,
    city,
    image,
    pricePerKm,
    minimumFare,
    isAvailable,
  } = vehicleData;

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      ...(vehicleName !== undefined && { vehicleName }),
      ...(brand !== undefined && { brand }),
      ...(model !== undefined && { model }),
      ...(category !== undefined && { category }),
      ...(fuelType !== undefined && { fuelType }),
      ...(transmission !== undefined && { transmission }),
      ...(seats !== undefined && { seats }),
      ...(loadCapacity !== undefined && { loadCapacity }),
      ...(city !== undefined && { city }),
      ...(image !== undefined && { image }), // only touched if a new URL is passed in
      ...(pricePerKm !== undefined && { pricePerKm }),
      ...(minimumFare !== undefined && { minimumFare }),
      ...(isAvailable !== undefined && { isAvailable }),
    },
  });
}

export async function deleteVehicle(vehicleId) {
  const bookingCount = await prisma.booking.count({ where: { vehicleId } });

  if (bookingCount > 0) {
    return prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isAvailable: false },
    });
  }

  return prisma.vehicle.delete({ where: { id: vehicleId } });
}

export async function approveVehicle(vehicleId) {}
