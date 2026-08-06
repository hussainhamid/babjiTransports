import { getDashboardStats } from "../queries/adminQueries/dashboardQueries.js";
import {
  getDrivers as getDriversQuery,
  getDriverById as getDriverByIdQuery,
  createDriver as createDriverQuery,
  updateDriver as updateDriverQuery,
  deleteDriver as deleteDriverQuery,
} from "../queries/adminQueries/driverQueries.js";
import {
  getCustomers as getCustomersQuery,
  getCustomerById as getCustomerByIdQuery,
  createCustomer as createCustomerQuery,
  updateCustomer as updateCustomerQuery,
  deleteCustomer as deleteCustomerQuery,
} from "../queries/adminQueries/customerQueries.js";
import {
  getVehicles as getVehiclesQuery,
  getVehicleById as getVehicleByIdQuery,
  createVehicle as createVehicleQuery,
  updateVehicle as updateVehicleQuery,
  deleteVehicle as deleteVehicleQuery,
} from "../queries/adminQueries/vehicleQueries.js";
import {
  getBookings as getBookingsQuery,
  getBookingById as getBookingByIdQuery,
  createBooking as createBookingQuery,
  updateBooking as updateBookingQuery,
  archiveBooking as archiveBookingQuery,
  restoreBooking as restoreBookingQuery,
} from "../queries/adminQueries/bookingQueries.js";
import {
  getPayments as getPaymentsQuery,
  getPaymentById as getPaymentByIdQuery,
  createPayment as createPaymentQuery,
  voidPayment as voidPaymentQuery,
  refundPayment as refundPaymentQuery,
  editPayment as editPaymentQuery,
  restorePayment as restorePaymentQuery,
} from "../queries/adminQueries/paymentQueries.js";
import {
  getOwners as getOwnersQuery,
  getOwnerById as getOwnerByIdQuery,
  createOwner as createOwnerQuery,
  updateOwner as updateOwnerQuery,
  deleteOwner as deleteOwnerQuery,
} from "../queries/adminQueries/ownerQueries.js";
import { activateCustomer as activateCustomerQuery } from "../queries/adminQueries/customerQueries.js";
import { activateOwner as activateOwnerQuery } from "../queries/adminQueries/ownerQueries.js";
import { activateDriver as activateDriverQuery } from "../queries/adminQueries/driverQueries.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { normalizePhone } from "../utils/normalizePhone.js";

export async function getDashboard(req, res) {
  try {
    const dashboard = await getDashboardStats();
    res.status(200).json(dashboard);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}

export async function getDrivers(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;
    const drivers = await getDriversQuery(page, limit, search);
    return res.status(200).json(drivers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch drivers" });
  }
}

export async function getDriverById(req, res) {
  try {
    const driver = await getDriverByIdQuery(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    return res.status(200).json(driver);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch driver" });
  }
}

export async function getCustomers(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;
    const customers = await getCustomersQuery(page, limit, search);
    return res.status(200).json(customers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch customers" });
  }
}

export async function getCustomerById(req, res) {
  try {
    const customer = await getCustomerByIdQuery(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    return res.status(200).json(customer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch customer" });
  }
}

export async function getVehicles(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const vehicles = await getVehiclesQuery(page, limit, req.query.search);
    return res.status(200).json(vehicles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch vehicles" });
  }
}

export async function getVehicleById(req, res) {
  try {
    const vehicle = await getVehicleByIdQuery(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    return res.status(200).json(vehicle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch vehicle" });
  }
}

export async function getBookings(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status;
    const archived = req.query.archived === "true";
    const bookings = await getBookingsQuery(
      page,
      limit,
      status,
      archived,
      req.query.search,
    );
    return res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch bookings" });
  }
}

export async function getBookingById(req, res) {
  try {
    const booking = await getBookingByIdQuery(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch booking" });
  }
}

export async function getPayments(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const voided = req.query.voided === "true";
    const payments = await getPaymentsQuery(
      page,
      limit,
      voided,
      req.query.search,
    );
    return res.status(200).json(payments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch payments" });
  }
}

export async function getPaymentById(req, res) {
  try {
    const payment = await getPaymentByIdQuery(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch payment" });
  }
}

export async function getOwners(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;
    const owners = await getOwnersQuery(page, limit, search);
    return res.status(200).json(owners);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch owners" });
  }
}

export async function getOwnerById(req, res) {
  try {
    const owner = await getOwnerByIdQuery(req.params.id);
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    return res.status(200).json(owner);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch owner" });
  }
}

export async function createDriver(req, res) {
  try {
    const { name } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!name || !phone)
      return res.status(400).json({ message: "name and phone are required" });
    const driver = await createDriverQuery(req.body);
    return res.status(201).json(driver);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002")
      return res
        .status(409)
        .json({ message: "Phone number already registered" });
    return res.status(500).json({ message: "Unable to create driver" });
  }
}

export async function updateDriver(req, res) {
  try {
    const driver = await updateDriverQuery(req.params.id, req.body);
    return res.status(200).json(driver);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update driver" });
  }
}

export async function deleteDriver(req, res) {
  try {
    const driver = await deleteDriverQuery(req.params.id);
    return res.status(200).json({ message: "Driver deactivated", driver });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to deactivate driver" });
  }
}

export async function createCustomer(req, res) {
  try {
    const { name } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!name || !phone)
      return res.status(400).json({ message: "name and phone are required" });
    const customer = await createCustomerQuery(req.body);
    return res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002")
      return res
        .status(409)
        .json({ message: "Phone number already registered" });
    return res.status(500).json({ message: "Unable to create customer" });
  }
}

export async function updateCustomer(req, res) {
  try {
    const customer = await updateCustomerQuery(req.params.id, req.body);
    return res.status(200).json(customer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update customer" });
  }
}

export async function deleteCustomer(req, res) {
  try {
    const customer = await deleteCustomerQuery(req.params.id);
    return res.status(200).json({ message: "Customer deactivated", customer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to deactivate customer" });
  }
}

export async function createVehicle(req, res) {
  try {
    if (!req.body.ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Vehicle image is required" });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer);

    const vehicle = await createVehicleQuery({
      ...req.body,
      seats:
        req.body.category === "PASSENGER" ? Number(req.body.seats) : undefined,
      pricePerKm: Number(req.body.pricePerKm),
      minimumFare: Number(req.body.minimumFare),
      image: uploadResult.secure_url,
    });
    return res.status(201).json(vehicle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to create vehicle" });
  }
}

export async function updateVehicle(req, res) {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      updateData.image = uploadResult.secure_url;
    }

    const vehicle = await updateVehicleQuery(req.params.id, updateData);
    return res.status(200).json(vehicle);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Vehicle not found" });
    return res.status(500).json({ message: "Unable to update vehicle" });
  }
}

export async function deleteVehicle(req, res) {
  try {
    const vehicle = await deleteVehicleQuery(req.params.id);
    return res.status(200).json({ message: "Vehicle deactivated", vehicle });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to deactivate vehicle" });
  }
}
export async function reactivateVehicle(req, res) {
  try {
    const vehicle = await reactivateVehicleQuery(req.params.id);
    return res
      .status(200)
      .json({ message: "Vehicle marked available", vehicle });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Vehicle not found" });
    return res.status(500).json({ message: "Unable to update vehicle" });
  }
}

export async function createBooking(req, res) {
  try {
    const { customerId, vehicleId, pickupLocation, destination, bookingDate } =
      req.body;

    if (
      !customerId ||
      !vehicleId ||
      !pickupLocation ||
      !destination ||
      !bookingDate
    ) {
      return res
        .status(400)
        .json({
          message:
            "customerId, vehicleId, pickupLocation, destination and bookingDate are required",
        });
    }

    const booking = await createBookingQuery(req.body);
    return res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    if (err.code === "P2003")
      return res
        .status(400)
        .json({ message: "Invalid customerId, vehicleId, or driverId" });
    return res.status(500).json({ message: "Unable to create booking" });
  }
}

export async function updateBooking(req, res) {
  try {
    const booking = await updateBookingQuery(req.params.id, req.body);
    return res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Booking not found" });
    return res.status(500).json({ message: "Unable to update booking" });
  }
}

export async function archiveBooking(req, res) {
  try {
    const booking = await archiveBookingQuery(req.params.id);
    return res.status(200).json({ message: "Booking archived", booking });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Booking not found" });
    return res.status(500).json({ message: "Unable to archive booking" });
  }
}

export async function restoreBooking(req, res) {
  try {
    const booking = await restoreBookingQuery(req.params.id);
    return res.status(200).json({ message: "Booking restored", booking });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Booking not found" });
    return res.status(500).json({ message: "Unable to restore booking" });
  }
}

export async function createPayment(req, res) {
  try {
    const { bookingId, advanceAmount, companyCommission, driverAmount } =
      req.body;

    if (
      !bookingId ||
      advanceAmount === undefined ||
      companyCommission === undefined ||
      driverAmount === undefined
    ) {
      return res.status(400).json({
        message:
          "bookingId, advanceAmount, companyCommission and driverAmount are required",
      });
    }

    const payment = await createPaymentQuery(req.body);
    return res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    if (err.message.includes("already has a payment"))
      return res.status(409).json({ message: err.message });
    if (err.code === "P2003")
      return res.status(400).json({ message: "Invalid bookingId" });
    return res.status(500).json({ message: "Unable to create payment" });
  }
}

export async function voidPayment(req, res) {
  try {
    const payment = await voidPaymentQuery(req.params.id);
    return res.status(200).json({ message: "Payment voided", payment });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Payment not found" });
    return res.status(500).json({ message: "Unable to void payment" });
  }
}

export async function refundPayment(req, res) {
  try {
    const payment = await refundPaymentQuery(req.params.id);
    return res
      .status(200)
      .json({ message: "Payment marked as refunded", payment });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Payment not found" });
    return res.status(500).json({ message: "Unable to refund payment" });
  }
}

export async function editPayment(req, res) {
  try {
    const payment = await editPaymentQuery(req.params.id, req.body);
    return res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Payment not found" });
    return res.status(500).json({ message: "Unable to update payment" });
  }
}

export async function createOwner(req, res) {
  try {
    const { name } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!name || !phone)
      return res.status(400).json({ message: "name and phone are required" });

    const owner = await createOwnerQuery(req.body);
    return res.status(201).json(owner);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002")
      return res
        .status(409)
        .json({ message: "Phone number already registered" });
    return res.status(500).json({ message: "Unable to create owner" });
  }
}

export async function updateOwner(req, res) {
  try {
    const owner = await updateOwnerQuery(req.params.id, req.body);
    return res.status(200).json(owner);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Owner not found" });
    return res.status(500).json({ message: "Unable to update owner" });
  }
}

export async function deleteOwner(req, res) {
  try {
    const owner = await deleteOwnerQuery(req.params.id);
    return res.status(200).json({ message: "Owner deactivated", owner });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Owner not found" });
    return res.status(500).json({ message: "Unable to deactivate owner" });
  }
}

export async function activateCustomer(req, res) {
  try {
    const customer = await activateCustomerQuery(req.params.id);
    return res.status(200).json({ message: "Customer activated", customer });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Customer not found" });
    return res.status(500).json({ message: "Unable to activate customer" });
  }
}

export async function activateOwner(req, res) {
  try {
    const owner = await activateOwnerQuery(req.params.id);
    return res.status(200).json({ message: "Owner activated", owner });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Owner not found" });
    return res.status(500).json({ message: "Unable to activate owner" });
  }
}

export async function activateDriver(req, res) {
  try {
    const driver = await activateDriverQuery(req.params.id);
    return res.status(200).json({ message: "Driver activated", driver });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Driver not found" });
    return res.status(500).json({ message: "Unable to activate driver" });
  }
}

export async function restorePayment(req, res) {
  try {
    const payment = await restorePaymentQuery(req.params.id);
    return res.status(200).json({ message: "Payment restored", payment });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ message: "Payment not found" });
    return res.status(500).json({ message: "Unable to restore payment" });
  }
}
