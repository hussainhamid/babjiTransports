import {
  getCustomerProfile,
  updateCustomerProfile,
  createCustomer,
} from "../queries/customerQueries/profileQueries.js";
import {
  getBookingsByCustomerId,
  getCustomerDashboardStats,
} from "../queries/customerQueries/bookingQueries.js";

export async function createNewCustomer(req, res) {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const customer = await createCustomer(req.body);
    return res.status(201).json(customer);
  } catch (err) {
    console.error(err);

    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Phone number already registered" });
    }
    return res.status(500).json({ message: "Unable to create customer" });
  }
}

export async function getDashboard(req, res) {
  try {
    const stats = await getCustomerDashboardStats(req.params.customerId);
    return res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch dashboard stats" });
  }
}

export async function getBookingHistory(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const bookings = await getBookingsByCustomerId(
      req.params.customerId,
      page,
      limit,
      req.query.status,
    );
    return res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch booking history" });
  }
}

export async function getProfile(req, res) {
  try {
    const profile = await getCustomerProfile(req.params.customerId);
    if (!profile) {
      return res.status(404).json({ message: "Customer not found" });
    }
    return res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to fetch customer profile" });
  }
}

export async function updateProfile(req, res) {
  try {
    const updated = await updateCustomerProfile(
      req.params.customerId,
      req.body,
    );
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unable to update customer profile" });
  }
}

export async function getMyProfile(req, res) {
  req.params.customerId = req.user.id;
  return getProfile(req, res);
}
export async function updateMyProfile(req, res) {
  req.params.customerId = req.user.id;
  return updateProfile(req, res);
}
export async function getMyDashboard(req, res) {
  req.params.customerId = req.user.id;
  return getDashboard(req, res);
}
export async function getMyBookings(req, res) {
  req.params.customerId = req.user.id;
  return getBookingHistory(req, res);
}
