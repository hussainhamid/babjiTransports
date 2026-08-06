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
