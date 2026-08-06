import api from "../api/axios";

export const getMyProfile = () => api.get("/customer/me/profile");
export const getMyDashboard = () => api.get("/customer/me/dashboard");
export const getMyBookings = (page = 1, limit = 10) =>
  api.get(`/customer/me/bookings?page=${page}&limit=${limit}`);
