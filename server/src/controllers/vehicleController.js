import prisma from "../prisma/prisma.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "babji-transports",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export async function createVehicle(req, res) {
  try {
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    const vehicle = await prisma.vehicle.create({
      data: {
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

    res.status(201).json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create vehicle",
    });
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

export async function getVehicleById(req, res) {}

export async function updateVehicle(req, res) {}

export async function deleteVehicle(req, res) {}
