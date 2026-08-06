import {
  getOwnerDashboardStats,
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  deleteOwner,
  getDriversByOwnerId,
  getVehiclesByOwnerId,
  assignDriver,
  unassignDriver,
  getOwnerBookings,
  quoteBooking,
  createAndAssignDriver,
} from "../queries/ownerQueries/ownerQueries.js";

export async function getOwnerDashboard(req, res) {
  try {
    const stats = await getOwnerDashboardStats(req.params.ownerId);
    return res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch owner dashboard" });
  }
}

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
    const booking = await assignDriver(ownerId, bookingId, driverId);
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
    const { bookingId } = req.params;

    const booking = await unassignDriver(bookingId);
    return res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to unassign driver from booking" });
  }
}

export async function getBookingsForOwner(req, res) {
  try {
    const { ownerId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const bookings = await getOwnerBookings(
      ownerId,
      page,
      limit,
      req.query.status,
    );
    return res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch bookings" });
  }
}

export async function quoteBookingFare(req, res) {
  try {
    const { ownerId, bookingId } = req.params;
    const booking = await quoteBooking(ownerId, bookingId, req.body);
    return res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    if (err.message === "NOT_FOUND")
      return res.status(404).json({ message: "Booking not found" });
    if (err.message === "FORBIDDEN")
      return res
        .status(403)
        .json({ message: "This booking does not belong to your vehicle" });
    return res.status(500).json({ message: "Unable to update booking" });
  }
}

export async function addDriver(req, res) {
  try {
    const driver = await createAndAssignDriver(req.params.ownerId, req.body);
    return res.status(201).json(driver);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add driver" });
  }
}
