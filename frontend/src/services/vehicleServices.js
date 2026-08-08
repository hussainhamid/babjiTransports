import api from "../api/axios";

export const addVehicle = async (vehicleData) => {
  return api.post("/vehicles/create", vehicleData);
};
export const getVehicleById = (id) => api.get(`/vehicles/${id}`);
export const getVehicles = (page = 1, limit = 9, search = "") =>
  api.get(
    `/vehicles?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
  );
