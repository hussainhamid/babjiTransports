import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import AddVehicle from "../pages/AddVehicle";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminOwners from "../pages/admin/AdminOwners";
import AdminDrivers from "../pages/admin/AdminDrivers";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addVehicle" element={<AddVehicle />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="owners" element={<AdminOwners />} />
          <Route path="drivers" element={<AdminDrivers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
