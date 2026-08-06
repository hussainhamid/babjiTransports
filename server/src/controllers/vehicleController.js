import prisma from "../prisma/prisma.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { createVehicle as createVehicleQuery } from "../queries/adminQueries/vehicleQueries.js";

import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

import { generateToken } from "../utils/jwt.js";
import { normalizePhone } from "../utils/normalizePhone.js";

export async function createVehicle(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vehicle image is required" });
    }

    let owner;
    let token; // only set for brand-new owners — tells the frontend "save this"
    const phoneNo = normalizePhone(req.body.phone);

    if (req.user) {
      // Already has a token from a previous visit — trust it, ignore any name/phone in the body.
      owner = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!owner)
        return res.status(404).json({ message: "Owner account not found" });
    } else {
      // First-time visitor — need name + phone to find or create the account.
      if (!req.body.ownerName || !phoneNo) {
        return res
          .status(400)
          .json({ message: "ownerName and ownerPhone are required" });
      }

      owner = await prisma.user.findUnique({
        where: { phone: phoneNo },
      });

      if (!owner) {
        owner = await prisma.user.create({
          data: {
            name: req.body.ownerName,
            phone: phoneNo,
            role: "OWNER",
          },
        });
      }

      token = generateToken(owner);
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer);

    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: owner.id,
        category: req.body.category,
        brand: req.body.brand,
        model: req.body.model,
        vehicleName: req.body.vehicleName,
        fuelType: req.body.fuelType,
        transmission: req.body.transmission,
        seats:
          req.body.category === "PASSENGER" ? Number(req.body.seats) : null,
        loadCapacity:
          req.body.category === "GOODS" ? req.body.loadCapacity : null,
        pricePerKm: Number(req.body.pricePerKm),
        minimumFare: Number(req.body.minimumFare),
        city: req.body.city,
        image: uploadResult.secure_url,
        driverName: req.body.driverName,
        driverPhone: req.body.driverPhone,
      },
    });

    return res.status(201).json({ vehicle, token }); // `token` is omitted/undefined for returning owners
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create vehicle" });
  }
}

export async function getLatestVehicles(req, res) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        isAvailable: true,
      },
    });

    res.status(200).json(vehicles);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "unable to get vehicles" });
  }
}

export async function getVehicleById(req, res) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: { owner: { select: { id: true, name: true, phone: true } } },
    });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    return res.status(200).json(vehicle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch vehicle" });
  }
}

export async function updateVehicle(req, res) {
  try {
    const existing = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
    });
    if (!existing)
      return res.status(404).json({ message: "Vehicle not found" });

    let imageUrl = existing.image;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

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
      pricePerKm,
      minimumFare,
      isAvailable,
    } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: {
        ...(vehicleName !== undefined && { vehicleName }),
        ...(brand !== undefined && { brand }),
        ...(model !== undefined && { model }),
        ...(category !== undefined && { category }),
        ...(fuelType !== undefined && { fuelType }),
        ...(transmission !== undefined && { transmission }),
        ...(seats !== undefined && { seats: Number(seats) }),
        ...(loadCapacity !== undefined && { loadCapacity }),
        ...(city !== undefined && { city }),
        ...(pricePerKm !== undefined && { pricePerKm: Number(pricePerKm) }),
        ...(minimumFare !== undefined && { minimumFare: Number(minimumFare) }),
        ...(isAvailable !== undefined && { isAvailable }),
        image: imageUrl,
      },
    });

    return res.status(200).json(vehicle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update vehicle" });
  }
}

export async function deleteVehicle(req, res) {
  try {
    const bookingCount = await prisma.booking.count({
      where: { vehicleId: req.params.id },
    });
    if (bookingCount > 0) {
      const vehicle = await prisma.vehicle.update({
        where: { id: req.params.id },
        data: { isAvailable: false },
      });
      return res.status(200).json({
        message: "Vehicle has bookings — marked unavailable instead of deleted",
        vehicle,
      });
    }
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: "Vehicle deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete vehicle" });
  }
}
