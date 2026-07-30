import api from "../api/axios";

export const addVehicle = async (vehicleData) => {
  return api.post("/vehicles/create", vehicleData);
};

export const getVehicles = () => {
  return api.get("/vehicles");
};
