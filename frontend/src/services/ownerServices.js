import api from "../api/axios";

export const getOwnerDashboard = (ownerId) =>
  api.get(`/owners/${ownerId}/dashboard`);
export const getOwnerDrivers = (ownerId) =>
  api.get(`/owners/${ownerId}/drivers`);
export const getOwnerBookings = (ownerId, page = 1, limit = 10, status) =>
  api.get(
    `/owners/${ownerId}/bookings?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
  );
export const quoteBookingFare = (ownerId, bookingId, data) =>
  api.put(`/owners/${ownerId}/bookings/${bookingId}/quote`, data);
export const addDriver = (ownerId, data) =>
  api.post(`/owners/${ownerId}/drivers`, data);
