import api from "../api/axios";

export const getDriverDashboard = () => api.get("/driver/dashboard");
export const getDriverBookings = (status) =>
  api.get(`/driver/bookings${status ? `?status=${status}` : ""}`);
export const updateTripStatus = (bookingId, status) =>
  api.put(`/driver/bookings/${bookingId}/status`, { status });
export const applyAsDriver = (data) => api.post("/driver/apply", data);
