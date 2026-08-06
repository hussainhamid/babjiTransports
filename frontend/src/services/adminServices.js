import api from "../api/axios";

// Dashboard
export const getAdminDashboard = () => api.get("/admin/dashboard");

// Customers
export const getAdminCustomers = (page = 1, limit = 10, search = "") =>
  api.get(
    `/admin/customers?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
  );
export const getAdminCustomerById = (id) => api.get(`/admin/customers/${id}`);
export const createAdminCustomer = (data) => api.post("/admin/customers", data);
export const updateAdminCustomer = (id, data) =>
  api.put(`/admin/customers/${id}`, data);
export const deactivateAdminCustomer = (id) =>
  api.delete(`/admin/customers/${id}`);

// Owners
export const getAdminOwners = (page = 1, limit = 10, search = "") =>
  api.get(
    `/admin/owners?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
  );
export const getAdminOwnerById = (id) => api.get(`/admin/owners/${id}`);
export const createAdminOwner = (data) => api.post("/admin/owners", data);
export const updateAdminOwner = (id, data) =>
  api.put(`/admin/owners/${id}`, data);
export const deactivateAdminOwner = (id) => api.delete(`/admin/owners/${id}`);

// Drivers
export const getAdminDrivers = (page = 1, limit = 10, search = "") =>
  api.get(
    `/admin/drivers?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
  );
export const getAdminDriverById = (id) => api.get(`/admin/drivers/${id}`);
export const createAdminDriver = (data) => api.post("/admin/drivers", data);
export const updateAdminDriver = (id, data) =>
  api.put(`/admin/drivers/${id}`, data);
export const deactivateAdminDriver = (id) => api.delete(`/admin/drivers/${id}`);

// Vehicles
export const getAdminVehicles = (page = 1, limit = 10, search = "") =>
  api.get(
    `/admin/vehicles?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
  );
export const reactivateAdminVehicle = (id) =>
  api.put(`/admin/vehicles/${id}/activate`);
export const getAdminVehicleById = (id) => api.get(`/admin/vehicles/${id}`);
export const createAdminVehicle = (formData) =>
  api.post("/admin/vehicles", formData);
export const updateAdminVehicle = (id, formData) =>
  api.put(`/admin/vehicles/${id}`, formData);
export const deleteAdminVehicle = (id) => api.delete(`/admin/vehicles/${id}`);

// Bookings
export const getAdminBookings = (
  page = 1,
  limit = 10,
  status,
  archived = false,
  search = "",
) =>
  api.get(
    `/admin/bookings?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}&archived=${archived}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
  );
export const getAdminBookingById = (id) => api.get(`/admin/bookings/${id}`);
export const createAdminBooking = (data) => api.post("/admin/bookings", data);
export const updateAdminBooking = (id, data) =>
  api.put(`/admin/bookings/${id}`, data);
export const archiveAdminBooking = (id) => api.delete(`/admin/bookings/${id}`);
export const restoreAdminBooking = (id) =>
  api.put(`/admin/bookings/${id}/restore`);

// Payments
export const getAdminPayments = (page = 1, limit = 10, voided = false) =>
  api.get(`/admin/payments?page=${page}&limit=${limit}&voided=${voided}`);
export const getAdminPaymentById = (id) => api.get(`/admin/payments/${id}`);
export const createAdminPayment = (data) => api.post("/admin/payments", data);
export const updateAdminPayment = (id, data) =>
  api.put(`/admin/payments/${id}`, data);
export const refundAdminPayment = (id) =>
  api.put(`/admin/payments/${id}/refund`);
export const voidAdminPayment = (id) => api.delete(`/admin/payments/${id}`);
export const restoreAdminPayment = (id) =>
  api.put(`/admin/payments/${id}/restore`);

export const activateAdminCustomer = (id) =>
  api.put(`/admin/customers/${id}/activate`);
export const activateAdminOwner = (id) =>
  api.put(`/admin/owners/${id}/activate`);
export const activateAdminDriver = (id) =>
  api.put(`/admin/drivers/${id}/activate`);
