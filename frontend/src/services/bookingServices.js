import api from "../api/axios";

export const createBooking = (bookingData) =>
  api.post("/bookings", bookingData);

export const getBookingDetail = (id) => api.get(`/bookings/${id}`);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const assignDriver = (id, driverId) =>
  api.put(`/bookings/${id}/assign-driver`, { driverId });
export const payAdvance = (id) => api.put(`/bookings/${id}/pay-advance`);
export const completeBooking = (id, costs) =>
  api.put(`/bookings/${id}/complete`, costs);
export const updateInvoice = (id, data) =>
  api.put(`/bookings/${id}/invoice`, data);
export const payFinalAmount = (id) => api.put(`/bookings/${id}/pay-final`);
export const updateTripEvent = (id, event) =>
  api.put(`/bookings/${id}/trip-event`, { event });
export const listMyBookings = (page = 1, limit = 50) =>
  api.get(`/bookings?page=${page}&limit=${limit}`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
