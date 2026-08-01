import { getDashboardStats } from "../queries/adminQueries/dashboardQueries.js";

export async function getDashboard(req, res) {
  try {
    const dashboard = await getDashboardStats();
    res.status(200).json(dashboard);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}

export async function getDrivers(req, res) {}

export async function getDriverById(req, res) {}

export async function getCustomers(req, res) {}

export async function getCustomerById(req, res) {}

export async function getVehicles(req, res) {}

export async function getVehicleById(req, res) {}

export async function getBookings(req, res) {}

export async function getBookingById(req, res) {}

export async function getPayments(req, res) {}

export async function getPaymentById(req, res) {}
