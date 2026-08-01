import {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  deleteOwner,
  getDriversByOwnerId,
  getVehiclesByOwnerId,
  assignDriver,
  unassignDriver,
} from "../queries/ownerQueries/ownerQueries.js";

export async function getAllOwners(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const owners = await getOwners(page, limit);

    return res.status(200).json(owners);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to fetch owners",
    });
  }
}

export async function getOwner(req, res) {
  try {
    const owner = await getOwnerById(req.params.ownerId);

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    return res.status(200).json(owner);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch owner" });
  }
}

export async function createNewOwner(req, res) {
  try {
    const owner = await createOwner(req.body);
    return res.status(201).json(owner);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to create owner" });
  }
}

export async function updateExistingOwnerDetaIls(req, res) {
  try {
    const owner = await updateOwner(req.params.ownerId, req.body);

    return res.status(200).json(owner);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update owner" });
  }
}

export async function deleteOwnerDetails(req, res) {
  try {
    const owner = await deleteOwner(req.params.id);

    return res.status(200).json(owner);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete owner" });
  }
}

export async function getOwnerDrivers(req, res) {
  try {
    const drivers = await getDriversByOwnerId(req.params.ownerId);

    return res.status(200).json(drivers);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to fetch drivers for this owner" });
  }
}

export async function getOwnerVehicles(req, res) {
  try {
    const vehicles = await getVehiclesByOwnerId(req.params.ownerId);

    return res.status(200).json(vehicles);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to fetch vehicles for this owner" });
  }
}

export async function assignDriverToBooking(req, res) {
  try {
    const { ownerId, bookingId } = req.params;

    const { driverId } = req.body;
    const booking = await assignDriver(req.params.id, bookingId, driverId);
    return res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to assign driver to booking" });
  }
}

export async function unassignDriverFromBooking(req, res) {
  try {
    const { bookingId } = req.body;

    const booking = await unassignDriver(req.params.id, bookingId);
    return res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to unassign driver from booking" });
  }
}
